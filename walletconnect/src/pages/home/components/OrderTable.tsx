import { EntityOrder } from "@/types";
import { cn, formatQubicAmount } from "@/utils";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

interface OrderTableProps extends React.HTMLAttributes<HTMLDivElement> {
  orders: EntityOrder[];
  type: "ask" | "bid";
  id: string;
  onSelectPrice?: (price: number) => void;
  maxItems?: number;
  showCumulativeVolume?: boolean;
  showHeader?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  type,
  id,
  className,
  onSelectPrice,
  maxItems = 15,
  showCumulativeVolume = false,
  showHeader = true,
  ...props
}) => {
  const columnHelper = createColumnHelper<EntityOrder & { cumVolume: number }>();

  // Add cumulative volume calculation
  const [processedOrders, setProcessedOrders] = useState<(EntityOrder & { cumVolume: number })[]>([]);

  useEffect(() => {
    const sortedData = [...orders].sort((a, b) => {
      if (type === "ask") {
        return a.price - b.price;
      }
      return b.price - a.price;
    });

    // Calculate cumulative volume
    let cumVolume = 0;
    const processed = sortedData.map((order) => {
      cumVolume += Number(order.price) * Number(order.numberOfShares);
      return {
        ...order,
        cumVolume,
      };
    });

    // Limit the number of items if maxItems is provided
    const limitedData = maxItems > 0 ? processed.slice(0, maxItems) : processed;
    setProcessedOrders(limitedData);
  }, [orders, type, maxItems]);

  const columns = [
    columnHelper.accessor("price", {
      header: "Price",
      cell: (info) => (
        <div className={cn("text-right font-semibold", type === "ask" ? "text-red-500" : "text-green-500")}>
          {formatQubicAmount(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor("numberOfShares", {
      header: "Quantity",
      cell: (info) => <div className="text-right px-1">{info.getValue().toLocaleString()}</div>,
    }),
    columnHelper.accessor(
      (row) => {
        if (showCumulativeVolume) {
          return row.cumVolume;
        }
        return row.price * row.numberOfShares;
      },
      {
        id: "total",
        header: "Total",
        cell: (info) => <div className="text-right">{formatQubicAmount(info.getValue())}</div>,
      },
    ),
  ];

  const maxCumVolume = useMemo(() => {
    return processedOrders.length > 0 ? processedOrders[processedOrders.length - 1].cumVolume : 0;
  }, [processedOrders]);

  const table = useReactTable({
    data: processedOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      if (type === "ask") {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      } else if (type === "bid") {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [type, processedOrders]);

  const handleRowClick = (price: number) => {
    if (onSelectPrice) {
      onSelectPrice(price);
    }
  };

  return (
    <div className={cn("flex h-full w-full flex-col rounded-lg p-2 text-sm", className)} {...props}>
      {showHeader && (
        <div className="flex w-full border-b px-2 py-1 font-medium">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div key={header.id} className="flex-1 text-center">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            )),
          )}
        </div>
      )}

      <motion.div
        ref={containerRef}
        className={cn(
          "flex h-[calc(100%-40px)] w-full flex-1 flex-col overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600",
          type === "ask" && "flex-col-reverse",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {table.getRowModel().rows.map((row) => {
          const rowVolume = row.original.price * row.original.numberOfShares;
          const rowData = row.original as EntityOrder & { cumVolume: number };

          // Calculate background width based on either individual volume or cumulative volume
          const bgWidth = showCumulativeVolume
            ? (rowData.cumVolume / maxCumVolume) * 100
            : (rowVolume / maxCumVolume) * 100;

          return (
            <motion.div
              key={row.id}
              className="flex w-full cursor-pointer gap-1 px-2 text-xs transition-colors duration-150 hover:!bg-muted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: row.index * 0.02 }}
              style={{
                background: `linear-gradient(to left, ${
                  type === "ask" ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 255, 0, 0.1)"
                } ${bgWidth}%, transparent ${bgWidth}%)`,
              }}
              onClick={() => handleRowClick(Number(row.original.price))}
            >
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="flex-1" style={{ minWidth: 0 }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default OrderTable;
