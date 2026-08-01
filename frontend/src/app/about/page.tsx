export default function AboutPage() {
  return (
    <div className="min-h-screen carbon-bg text-f1-text">
      <div className="bg-[#0F0D0B] border-b border-f1-border relative f1-stripe-top shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <a href="/" className="w-9 h-9 rounded-lg bg-[#141210] border border-f1-border flex items-center justify-center text-f1-muted hover:text-white hover:border-f1-red/50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white f1-font tracking-wide">
              <span className="text-f1-red">Pit</span>Wall About
            </h1>
            <p className="text-xs text-f1-muted uppercase tracking-widest font-semibold">Technical Specifications & Project Info</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div className="carbon-card border border-f1-red/50 rounded-xl p-6 shadow-f1-glow f1-stripe-top">
          <h2 className="text-base font-black text-f1-red uppercase tracking-wider mb-3 f1-font flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse"></span>
            Disclaimer
          </h2>
          <p className="text-sm text-f1-text leading-relaxed font-medium">
            PitWall, FastF1, and this website are unofficial and are not associated in any way with the
            Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and
            related marks are trade marks of Formula One Licensing B.V.
          </p>
        </div>

        <div className="carbon-card border border-f1-border rounded-xl p-6 shadow-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-3 f1-font">What is this?</h2>
          <p className="text-sm text-f1-text leading-relaxed font-medium">
            PitWall is an independent project that lets you follow live and replay past Formula 1 sessions
            with track visualisation, driver positions, and timing data. It is built purely for educational and
            entertainment purposes.
          </p>
        </div>

        <div className="carbon-card border border-f1-border rounded-xl p-6 shadow-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-3 f1-font">Data Sources</h2>
          <p className="text-sm text-f1-text leading-relaxed mb-4 font-medium">
            All data is sourced from publicly available APIs. No proprietary or restricted data is used.
          </p>
          <p className="text-sm text-f1-text leading-relaxed font-medium">
            This project relies on underlying data provided by{" "}
            <a
              href="https://github.com/theOehrly/Fast-F1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-f1-red hover:underline font-bold"
            >
              FastF1
            </a>
            , an open-source Python library for accessing Formula 1 timing and telemetry data.
            Thanks to the FastF1 maintainers and contributors for making this possible.
          </p>
        </div>

        <div className="text-center pt-4">
          <a
            href="/"
            className="inline-flex f1-slant px-5 py-2.5 bg-[#141210] border border-f1-border text-white text-xs font-black uppercase tracking-widest rounded-lg hover:border-f1-red/50 hover:bg-[#1C1712] transition-all shadow"
          >
            <span className="f1-slant-unskew">← Back to Session Picker</span>
          </a>
        </div>
      </div>
    </div>
  );
}
