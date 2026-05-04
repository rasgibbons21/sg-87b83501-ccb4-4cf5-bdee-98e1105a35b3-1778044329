import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Copy, Smartphone, Monitor } from "lucide-react";
import { useState } from "react";

export default function GetApp() {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bloom.vercel.app";

  const copyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-sage-900 mb-2">Install Bloom on Your Device</h1>
          <p className="text-sage-600">Access Bloom like a native app from any device.</p>
        </div>

        <div className="bg-white border border-sage-200 rounded-xl p-8 text-center">
          <div className="inline-block mb-6">
            <img
              src={`/api/qr?url=${encodeURIComponent(appUrl)}&size=180`}
              alt="QR code for Bloom app"
              className="w-[180px] h-[180px] border-4 border-sage-200 rounded-xl"
            />
          </div>
          
          <h3 className="text-xl font-serif text-sage-900 mb-2">Scan to Open on Mobile</h3>
          <p className="text-sage-600 mb-4">Use your phone's camera to scan this QR code</p>

          <div className="flex items-center gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={appUrl}
              readOnly
              className="flex-1 px-4 py-2 border border-sage-200 rounded-lg bg-sage-50 text-sage-900 font-mono text-sm"
            />
            <Button
              onClick={copyLink}
              variant="outline"
              className="border-sage-300"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-sage-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-sage-700" />
              </div>
              <h3 className="font-medium text-sage-900">Mobile Installation</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🍎</span>
                  <span className="font-medium text-sage-900 text-sm">iPhone / iPad</span>
                </div>
                <ol className="text-sm text-sage-700 space-y-1 ml-6 list-decimal">
                  <li>Open {appUrl} in Safari</li>
                  <li>Tap the Share button (square with arrow)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="font-medium text-sage-900 text-sm">Android</span>
                </div>
                <ol className="text-sm text-sage-700 space-y-1 ml-6 list-decimal">
                  <li>Open {appUrl} in Chrome</li>
                  <li>Tap the three dots menu (⋮)</li>
                  <li>Tap "Install app" or "Add to Home screen"</li>
                  <li>Tap "Install" to confirm</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-white border border-sage-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                <Monitor className="w-5 h-5 text-sage-700" />
              </div>
              <h3 className="font-medium text-sage-900">Desktop Installation</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🍎</span>
                  <span className="font-medium text-sage-900 text-sm">Mac (Safari)</span>
                </div>
                <ol className="text-sm text-sage-700 space-y-1 ml-6 list-decimal">
                  <li>Open {appUrl} in Safari</li>
                  <li>Click File → Add to Dock</li>
                  <li>The app icon will appear in your Dock</li>
                </ol>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💻</span>
                  <span className="font-medium text-sage-900 text-sm">Windows / Mac (Chrome)</span>
                </div>
                <ol className="text-sm text-sage-700 space-y-1 ml-6 list-decimal">
                  <li>Open {appUrl} in Chrome</li>
                  <li>Click the install icon (⊕) in the address bar</li>
                  <li>Or click the three dots → Install Bloom</li>
                  <li>Click "Install" to add to your desktop</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-champagne-50 border border-champagne-200 rounded-xl p-6">
          <h3 className="font-medium text-sage-900 mb-2">📱 Why Install?</h3>
          <ul className="text-sm text-sage-700 space-y-1">
            <li>• Access Bloom with one tap from your home screen</li>
            <li>• Works offline for viewing your portfolio and guides</li>
            <li>• Faster load times and smoother experience</li>
            <li>• Receive push notifications for market updates (coming soon)</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-sage-200 rounded-lg p-4 text-center">
            <span className="text-2xl mb-2 block">🍎</span>
            <span className="text-xs text-sage-700 font-medium">iOS</span>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-4 text-center">
            <span className="text-2xl mb-2 block">🤖</span>
            <span className="text-xs text-sage-700 font-medium">Android</span>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-4 text-center">
            <span className="text-2xl mb-2 block">🍎</span>
            <span className="text-xs text-sage-700 font-medium">Mac</span>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-4 text-center">
            <span className="text-2xl mb-2 block">💻</span>
            <span className="text-xs text-sage-700 font-medium">Windows</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}