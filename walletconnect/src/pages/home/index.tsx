import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import OrderForm from "./components/OrderForm";
import Orderbook from "./components/Orderbook";
import Chart from "./components/Chart";
import History from "./components/History";
import UserOrder from "./components/UserOrder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateChartDimensions = () => {
      if (chartContainerRef.current) {
        const { clientWidth, clientHeight } = chartContainerRef.current;
        setChartDimensions({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    // Initial size calculation
    updateChartDimensions();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateChartDimensions);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    // Also handle window resize events
    window.addEventListener("resize", updateChartDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateChartDimensions);
    };
  }, []);

  return (
    <div className="container mx-auto flex flex-col space-y-4 p-2 md:p-4">
      {/* Main content area */}
      <div className="flex h-[1600px] flex-col gap-1 md:gap-2 lg:h-[1000px] lg:flex-row">
        {/* Left column - Chart, History, User Orders */}
        <div className="flex w-full flex-grow flex-col gap-1 md:gap-2 lg:w-3/4">
          <Card className="relative min-h-[300px] flex-grow overflow-hidden p-2 md:min-h-0" ref={chartContainerRef}>
            {chartDimensions.width > 0 && chartDimensions.height > 0 && (
              <Chart
                className="absolute inset-0 p-2"
                style={{
                  width: chartDimensions.width,
                  height: chartDimensions.height,
                }}
              />
            )}
          </Card>
          <Card className="min-h-[300px] overflow-auto p-2 text-xs md:h-1/4 md:min-h-0">
            <Tabs defaultValue="history" className="h-full w-full">
              <TabsList className="mb-2 flex w-full">
                <TabsTrigger value="history" className="flex-1">
                  Asset Trades
                </TabsTrigger>
                <TabsTrigger value="userOrders" className="flex-1">
                  My Orders
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="history"
                className="h-[calc(100%-40px)] overflow-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600"
              >
                <History className="w-full" />
              </TabsContent>
              <TabsContent
                value="userOrders"
                className="h-[calc(100%-40px)] overflow-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600"
              >
                <UserOrder className="w-full" />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right column - Orderbook, Order Form */}
        <div className="lg:w-1/4">
          <Card className="min-h-[400px] flex-grow text-xs lg:h-[620px]">
            <Orderbook />
          </Card>
          <Card className="h-[380px] p-1 md:p-2">
            <OrderForm />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
