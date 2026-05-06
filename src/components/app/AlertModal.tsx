import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AlertModalProps {
  ticker: string;
  name: string;
  currentPrice: number;
  onClose: () => void;
  onCreateAlert: (alertType: "above" | "below" | "target" | "stop", alertPrice: number) => void;
}

export function AlertModal({ ticker, name, currentPrice, onClose, onCreateAlert }: AlertModalProps) {
  const [alertType, setAlertType] = useState<"above" | "below" | "target" | "stop">("above");
  const [alertPrice, setAlertPrice] = useState(currentPrice.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) return;
    onCreateAlert(alertType, price);
  };

  const alertTypes = [
    { value: "above" as const, label: "Price Above", color: "text-[#6DD6A0]" },
    { value: "below" as const, label: "Price Below", color: "text-[#F09090]" },
    { value: "target" as const, label: "Target Hit", color: "text-[#2D7A4A]" },
    { value: "stop" as const, label: "Stop Loss", color: "text-[#C04040]" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-sage-100">
          <div>
            <h2 className="font-serif text-2xl text-sage-800">Set Price Alert</h2>
            <p className="text-sm text-slate-600 mt-1">{ticker} — {name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label className="text-sage-700 mb-3 block">Current Price</Label>
            <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
              <span className="font-mono text-2xl font-bold text-sage-900">${currentPrice.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <Label className="text-sage-700 mb-3 block">Alert Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {alertTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAlertType(type.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    alertType === type.value
                      ? "border-sage-600 bg-sage-50"
                      : "border-slate-200 hover:border-sage-300"
                  }`}
                >
                  <span className={alertType === type.value ? type.color : "text-slate-600"}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="alertPrice" className="text-sage-700 mb-2 block">Alert Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
              <Input
                id="alertPrice"
                type="number"
                step="0.01"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                className="pl-8 font-mono text-lg"
                placeholder="0.00"
                required
              />
            </div>
            {alertPrice && !isNaN(parseFloat(alertPrice)) && (
              <p className="text-xs text-slate-500 mt-2">
                Alert will trigger when price {alertType === "above" || alertType === "target" ? "reaches or exceeds" : "falls to or below"} ${parseFloat(alertPrice).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-sage-800 hover:bg-sage-900 text-white">
              Create Alert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}