export function Footer() {
  return (
    <footer className="bg-sage-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white font-serif text-2xl font-semibold leading-none">Bloom</span>
              <span className="text-[9px] uppercase tracking-widest text-sage-400 leading-none mt-0.5">by Cinder Vault</span>
            </div>
          </div>

          <p className="text-sage-300 text-sm max-w-2xl leading-relaxed">
            <strong className="text-white">Disclaimer:</strong> Bloom by Cinder Vault provides educational content only. We are not registered investment advisors. 
            All investment picks, strategies, and recommendations are for informational purposes. Past performance does not guarantee future results. 
            Consult a qualified financial advisor before making investment decisions. Affiliate commissions support this platform.
          </p>

          <p className="text-sage-400 text-sm">
            © {new Date().getFullYear()} Cinder Vault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}