import LightweightChart from "@/components/LightweightChart";
import { fetchAssetChartAveragePrice } from "@/services/api.service";
import { actionAtom } from "@/store/action";
import { assetsAtom } from "@/store/assets";
import { cn } from "@/utils";
import { useAtom } from "jotai";
import type { SingleValueData, Time } from "lightweight-charts";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { settingsAtom } from "@/store/settings";

type TimeFrame = "5m" | "15m" | "1h" | "4h" | "1d" | "1w";
type ChartType = "line" | "area" | "candle";

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}
const Chart: React.FC<ChartProps> = ({ className, ...props }) => {
  const [priceData, setPriceData] = useState<SingleValueData[]>([]);
  const [volumeData, setVolumeData] = useState<SingleValueData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1h");
  const [, setChartType] = useState<ChartType>("line");
  const [action, setAction] = useAtom(actionAtom);
  const [assets] = useAtom(assetsAtom);
  const [settings] = useAtom(settingsAtom);

  const asset = assets.find((asset) => asset.name === action.curPair);
  const symbol = asset?.name || "QX";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchAssetChartAveragePrice(
          asset?.issuer || "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB",
          symbol,
        );

        const avgPriceData: SingleValueData[] =
          res?.map((v) => ({
            value: v.averagePrice,
            time: v.time as Time,
          })) ?? [];

        setAction((prev) => ({
          ...prev,
          curPairLatestTradePrice: Math.floor(avgPriceData[avgPriceData.length - 1].value || 0),
        }));

        const histogramVolumeData: SingleValueData[] =
          res?.map((v) => ({
            value: v.totalAmount,
            time: v.time as Time,
          })) ?? [];

        setPriceData(avgPriceData);
        setVolumeData(histogramVolumeData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asset, timeFrame, symbol]);

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  const handleChartTypeChange = (newChartType: ChartType) => {
    setChartType(newChartType);
  };

  const handleAssetChange = (value: string) => {
    setAction({
      ...action,
      curPair: value,
    });
  };

  if (loading && priceData.length === 0) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", className)} {...props}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", className)} {...props}>
      <LightweightChart
        priceDataSeries={priceData}
        volumeDataSeries={volumeData}
        className="h-full"
        title={`${symbol} Price Chart`}
        symbol={symbol}
        loading={loading}
        showControls={false}
        showTooltip={true}
        theme={settings.darkMode ? "dark" : "light"}
        HeaderComponent={
          <div className="flex w-36 items-center gap-2">
            <Select onValueChange={handleAssetChange} value={action.curPair}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((option) => (
                  <SelectItem key={option.name} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        onTimeFrameChange={handleTimeFrameChange}
        onChartTypeChange={handleChartTypeChange}
      />
    </div>
  );
};

export default Chart;
