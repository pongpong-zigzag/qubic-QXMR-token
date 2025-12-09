import { useEffect, useState } from "react";
import { fetchEntityAskOrders, fetchEntityBidOrders } from "@/services/api.service";
import { EntityOrder } from "@/types";
import { formatQubicAmount } from "@/utils";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useQubicConnect } from "@/components/connect/QubicConnectContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import usePlaceOrder from "@/hooks/usePlaceOrder";
import { refetchAtom } from "@/store/action";
import { useAtom } from "jotai";

interface UserOrderProps extends React.HTMLAttributes<HTMLDivElement> {}
const UserOrder: React.FC<UserOrderProps> = ({ ...props }) => {
  const [askOrders, setAskOrders] = useState<EntityOrder[]>([]);
  const [bidOrders, setBidOrders] = useState<EntityOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetch] = useAtom(refetchAtom);
  const { wallet } = useQubicConnect();
  const { placeOrder } = usePlaceOrder();

  const entityId = wallet?.publicKey || "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB";

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const [asks, bids] = await Promise.all([fetchEntityAskOrders(entityId), fetchEntityBidOrders(entityId)]);
        setAskOrders(asks);
        setBidOrders(bids);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [entityId, refetch]);

  const handleCancelOrder = (order: EntityOrder, type: "buy" | "sell") => {
    placeOrder(order.assetName, type === "buy" ? "rmBuy" : "rmSell", order.price, order.numberOfShares);
  };

  const renderOrders = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    const allOrders = [
      ...bidOrders.map((order) => ({ ...order, type: "buy" as const })),
      ...askOrders.map((order) => ({ ...order, type: "sell" as const })),
    ];

    if (allOrders.length === 0) {
      return <div className="py-8 text-center text-gray-500">No orders found</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allOrders.map((order, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{order.assetName}</TableCell>
              <TableCell>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${order.type === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {order.type === "buy" ? "Buy" : "Sell"}
                </span>
              </TableCell>
              <TableCell className={order.type === "buy" ? "text-green-500" : "text-red-500"}>
                {formatQubicAmount(order.price)}
              </TableCell>
              <TableCell>{order.numberOfShares.toLocaleString()}</TableCell>
              <TableCell>{formatQubicAmount(order.price * order.numberOfShares)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                  onClick={() => handleCancelOrder(order, order.type)}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div {...props}>
      <div className="px-4 pb-0 pt-4">{/* <h2 className="text-lg font-medium">Your Orders</h2> */}</div>
      <div className="p-4">{renderOrders()}</div>
    </div>
  );
};

export default UserOrder;
