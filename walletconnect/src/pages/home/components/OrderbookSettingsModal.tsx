import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderbookSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    showCumulativeVolume: boolean;
    maxItems: number;
    groupingSize: number;
  };
  onSettingsChange: (settings: { showCumulativeVolume: boolean; maxItems: number; groupingSize: number }) => void;
}

const OrderbookSettingsModal: React.FC<OrderbookSettingsModalProps> = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  // Reset local settings when modal opens
  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Orderbook Settings
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {localSettings.showCumulativeVolume ? "Cumulative" : "Individual"} Volume
            </Badge>
          </DialogTitle>
          <DialogDescription>Customize how the orderbook is displayed</DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="show-cumulative-volume" className="text-sm font-medium">
                Cumulative Volume
              </Label>
              <p className="text-xs text-muted-foreground">
                Show accumulated volume instead of individual order volume
              </p>
            </div>
            <Switch
              id="show-cumulative-volume"
              checked={localSettings.showCumulativeVolume}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showCumulativeVolume: checked })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-items" className="text-sm font-medium">
                Maximum Visible Orders
              </Label>
              <span className="text-sm font-medium">{localSettings.maxItems}</span>
            </div>
            <Slider
              id="max-items"
              min={5}
              max={50}
              step={5}
              value={[localSettings.maxItems]}
              onValueChange={(value) => setLocalSettings({ ...localSettings, maxItems: value[0] })}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderbookSettingsModal;
