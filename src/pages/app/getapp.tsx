import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Copy, Check, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GetApp() {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bloom-app.vercel.app";
  const qrUrl = `/api/qr?url=${encodeURIComponent(appUrl)}&size=180`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage-800 mb-2">Get the Bloom App</h1>
          <p className="text-slate-600">Install Bloom on all your devices for quick access</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl border border-sage-200 p-8 text-center">
            <div className="mb-6">
              <img src={qrUrl} alt="QR Code" className="mx-auto w-[180px] h-[180px] border-4 border-sage-100 rounded-xl" />
            </div>
            <h2 className="font-serif text-2xl text-sage-800 mb-2">Scan to Open</h2>
            <p className="text-slate-600 mb-6">Point your phone camera at this QR code to open Bloom instantly</p>
            <div className="bg-sage-50 rounded-lg p-3 mb-4">
              <code className="text-sm text-sage-800 break-all">{appUrl}</code>
            </div>
            <Button onClick={handleCopy} variant="outline" className="w-full">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-sage-200 p-8">
            <h2 className="font-serif text-2xl text-sage-800 mb-6">Install Instructions</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-6 h-6 text-sage-600" />
                  <h3 className="font-semibold text-sage-800">iPhone (Safari)</h3>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 pl-9">
                  <li>Open Bloom in Safari</li>
                  <li>Tap the Share button (box with arrow)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-6 h-6 text-sage-600" />
                  <h3 className="font-semibold text-sage-800">Android (Chrome)</h3>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 pl-9">
                  <li>Open Bloom in Chrome</li>
                  <li>Tap the three dots menu (top right)</li>
                  <li>Tap "Add to Home screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Monitor className="w-6 h-6 text-sage-600" />
                  <h3 className="font-semibold text-sage-800">Desktop (Chrome/Edge)</h3>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 pl-9">
                  <li>Open Bloom in your browser</li>
                  <li>Click the install icon in the address bar</li>
                  <li>Click "Install" to confirm</li>
                  <li>Bloom will open in its own window</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "iOS", emoji: "📱" },
            { name: "Android", emoji: "🤖" },
            { name: "Mac", emoji: "💻" },
            { name: "Windows", emoji: "🖥️" }
          ].map((platform) => (
            <div key={platform.name} className="bg-white rounded-xl border border-sage-200 p-6 text-center">
              <div className="text-4xl mb-3">{platform.emoji}</div>
              <div className="font-medium text-sage-800">{platform.name}</div>
              <div className="text-xs text-slate-500 mt-1">Supported</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}