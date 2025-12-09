import { useQubicConnect } from "@/components/connect/QubicConnectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import usePlaceOrder from "@/hooks/usePlaceOrder";
import { fetchOwnedAssets } from "@/services/rpc.service";
import { actionAtom } from "@/store/action";
import { assetsAtom } from "@/store/assets";
import { balancesAtom } from "@/store/balances";
import { cn, formatQubicAmount } from "@/utils";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface OrderFormData {
  price: number;
  quantity: number;
}

const OrderForm: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  const [action] = useAtom(actionAtom);
  const [balances] = useAtom(balancesAtom);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const { wallet } = useQubicConnect();
  const { placeOrder } = usePlaceOrder();
  const [assets] = useAtom(assetsAtom);
  const asset = assets.find((asset) => asset.name === action.curPair);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    defaultValues: {
      price: action.curPrice || 0,
      quantity: 0,
    },
  });

  // Update form when price changes from outside
  useEffect(() => {
    if (action.curPrice) {
      setValue("price", action.curPrice);
    }
  }, [action.curPrice, setValue]);

  const watchedPrice = watch("price");
  const watchedQuantity = watch("quantity");
  const total = (watchedPrice || 0) * (watchedQuantity || 0);

  const onSubmit = async (data: OrderFormData) => {
    if (await validateOrder(data)) {
      try {
        let isMaker = false;
        if (orderType === "buy") {
          isMaker = action.curPairBestAskPrice > data.price;
        } else {
          isMaker = action.curPairBestBidPrice < data.price;
        }
        await placeOrder(action.curPair, orderType, data.price, data.quantity, isMaker);
      } catch (error) {
        console.error("Failed to submit order:", error);
      }
    }
  };

  const validateOrder = async (data: OrderFormData) => {
    if (!wallet?.publicKey) {
      toast.error("Please connect your wallet");
      return false;
    } else if (data.price <= 0 || data.quantity <= 0) {
      toast.error("Invalid order price or quantity");
      return false;
    } else if (orderType === "buy") {
      if (balances[0].balance < total) {
        toast.error("Insufficient balance");
        return false;
      }
    } else if (orderType === "sell") {
      const assetBalance = await fetchOwnedAssets(wallet.publicKey || "") || [];
      const assetBalanceData = assetBalance.find((asset: { asset: string; amount: string }) => asset.asset === action.curPair);
      if (assetBalanceData?.amount < data.quantity) {
        toast.error("Insufficient asset balance");
        return false;
      }
    }
    return true;
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="px-2 pb-0 pt-2">
        <h2 className="text-lg font-medium">Place Order</h2>
      </div>
      <div className="p-1">
        <Tabs
          defaultValue="buy"
          value={orderType}
          onValueChange={(value: string) => setOrderType(value as "buy" | "sell")}
          className="w-full"
        >
          <TabsList className="mb-2 grid w-full grid-cols-2">
            <TabsTrigger value="buy" className={cn("data-[state=active]:bg-success-40 data-[state=active]:text-white")}>
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className={cn("data-[state=active]:bg-error-40 data-[state=active]:text-white")}>
              Sell
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="200"
                step="any"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be greater than 0" },
                  valueAsNumber: true,
                })}
                className={errors.price ? "border-error-40" : ""}
              />
              {errors.price && <p className="text-sm text-error-40">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="3000"
                step="any"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 0, message: "Quantity must be greater than 0" },
                  valueAsNumber: true,
                })}
                className={errors.quantity ? "border-error-40" : ""}
              />
              {errors.quantity && <p className="text-sm text-error-40">{errors.quantity.message}</p>}
              <p className="px-3 pt-1 text-right text-sm text-muted-foreground">
                {asset?.balance} {action.curPair}
              </p>
            </div>

            <Separator className="my-1" />

            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatQubicAmount(total)}</span>
            </div>

            <Button
              type="submit"
              className={cn(
                "mt-2 w-full",
                orderType === "buy"
                  ? "bg-success-40 text-white hover:bg-success-40/90"
                  : "bg-error-40 text-white hover:bg-error-40/90",
              )}
            >
              {orderType === "buy" ? "Buy" : "Sell"} {action.curPair || "QCAP"}
            </Button>
          </form>
        </Tabs>
      </div>
    </div>
  );
};

export default OrderForm;
