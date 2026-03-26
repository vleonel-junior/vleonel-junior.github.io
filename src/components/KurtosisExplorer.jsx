import { useState, useMemo } from 'preact/hooks';

export default function KurtosisExplorer() {
  const [kurtValue, setKurtValue] = useState(50); // 0 to 100

  const p = kurtValue / 100;
  
  const NORMAL_BINS = [1, 2, 5, 10, 20, 35, 55, 75, 90, 100, 100, 90, 75, 55, 35, 20, 10, 5, 2, 1];
  const PLATY_BINS =  [0, 0, 2, 10, 25, 45, 60, 58, 72, 68, 68, 72, 58, 60, 45, 25, 10, 2, 0, 0];
  const LEPTO_BINS =  [25, 10, 5, 8, 2, 0, 15, 35, 70, 110, 110, 70, 35, 15, 0, 2, 8, 5, 10, 25];
  
  const numBins = 20;
  const globalMax = 120; // scaled so max 110 doesn't overflow container

  const interpolatedBins = useMemo(() => {
    return Array.from({ length: numBins }).map((_, i) => {
      if (p < 0.5) {
        // Interpolate between PLATY and NORMAL
        const weightNormal = p * 2;
        return PLATY_BINS[i] * (1 - weightNormal) + NORMAL_BINS[i] * weightNormal;
      } else {
        // Interpolate between NORMAL and LEPTO
        const weightLepto = (p - 0.5) * 2;
        return NORMAL_BINS[i] * (1 - weightLepto) + LEPTO_BINS[i] * weightLepto;
      }
    });
  }, [p]);

  const bins = interpolatedBins.map((val, i) => ({
    x: (i + 0.5) / numBins,
    height: (val / globalMax) * 85
  }));

  const normalLinePoints = NORMAL_BINS.map((val, i) => {
    const x = (i + 0.5) / numBins * 100;
    const y = 100 - (val / globalMax) * 85;
    return `${x},${y}`;
  }).join(' ');

  let state = 'Mésokurtique';
  if (kurtValue < 33) state = 'Platykurtique';
  else if (kurtValue > 66) state = 'Leptokurtique';

  let theme = {};
  if (state === 'Platykurtique') {
    theme = {
      category: "Platykurtique (Queues Légères)",
      titleColor: "text-[#a855f7]",
      badgeBg: "bg-[#581c87]/40",
      badgeBorder: "border-[#a855f7]/30",
      activeBg: "bg-[#1f162e]",
      activeBorder: "border-[#a855f7]",
      barBg: "bg-[#a855f7]/30",
      barBorder: "border-[#a855f7]",
      sliderFill: "#a855f7",
      descHeading: "Platykurtique :",
      desc: " Pic plus plat et queues plus fines que la normale. Les données sont réparties plus uniformément, sans valeurs extrêmes. Exemple : distribution uniforme.",
    };
  } else if (state === 'Mésokurtique') {
    theme = {
      category: "Mésokurtique (Normal)",
      titleColor: "text-[#22c55e]",
      badgeBg: "bg-[#14532d]/40",
      badgeBorder: "border-[#22c55e]/30",
      activeBg: "bg-[#14261d]",
      activeBorder: "border-[#22c55e]",
      barBg: "bg-[#22c55e]/30",
      barBorder: "border-[#22c55e]",
      sliderFill: "#22c55e",
      descHeading: "Mésokurtique :",
      desc: " Épaisseur des queues similaire à une distribution normale. C'est la référence (kurtosis = 3, ou excès de kurtosis = 0).",
    };
  } else {
    theme = {
      category: "Leptokurtique (Queues Lourdes)",
      titleColor: "text-[#f43f5e]",
      badgeBg: "bg-[#881337]/40",
      badgeBorder: "border-[#f43f5e]/30",
      activeBg: "bg-[#2d151c]",
      activeBorder: "border-[#f43f5e]",
      barBg: "bg-[#f43f5e]/30",
      barBorder: "border-[#f43f5e]",
      sliderFill: "#f43f5e",
      descHeading: "Leptokurtique :",
      desc: " Plus de données dans les queues et le pic qu'une distribution normale. Courant dans les rendements financiers où les événements extrêmes se produisent plus souvent.",
    };
  }

  return (
    <div className="my-8 rounded-xl bg-[#0c0c0e] text-zinc-300 p-8 shadow-2xl border border-zinc-800/80 font-sans not-prose">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 text-white">Explorateur de Kurtosis</h3>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Déplacez le curseur pour voir comment le kurtosis affecte "l'épaisseur des queues" de la distribution. La ligne pointillée montre une distribution normale pour référence.
        </p>
      </div>

      {/* Slider Area */}
      <div className="flex flex-col mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-400">Kurtosis</span>
          <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${theme.badgeBg} ${theme.titleColor} ${theme.badgeBorder} transition-colors duration-300 shadow-sm`}>
            {theme.category}
          </span>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Plat</span>
          <div className="relative flex-1 flex items-center h-2">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={kurtValue} 
              onInput={(e) => setKurtValue(e.currentTarget.valueAsNumber)}
              className="absolute w-full h-full opacity-0 cursor-pointer z-20"
            />
            {/* Custom slider track */}
            <div className="absolute top-0 left-0 w-full h-full bg-zinc-700/50 rounded-full z-0 overflow-hidden">
              <div 
                className="h-full transition-all duration-300 rounded-full" 
                style={{ width: `${kurtValue}%`, backgroundColor: theme.sliderFill }}
              ></div>
            </div>
            {/* Custom slider thumb */}
            <div 
              className="absolute w-5 h-5 bg-[#0c0c0e] border-[3px] border-zinc-300 rounded-full z-10 transition-all duration-75 pointer-events-none transform -translate-x-1/2"
              style={{ left: `${kurtValue}%` }}
            ></div>
          </div>
          <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Pointu</span>
        </div>
      </div>

      {/* State Cards */}
      <div className="flex gap-4 mb-6">
        {/* Platykurtic Card */}
        <div onClick={() => setKurtValue(0)} className={`flex-1 rounded-lg p-3 text-center border cursor-pointer transition-all duration-300 ${state === 'Platykurtique' ? `${theme.activeBg} ${theme.activeBorder}` : 'bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50'}`}>
          <div className="text-sm font-bold text-[#a855f7] mb-0.5">Platykurtique</div>
          <div className="text-xs text-zinc-400 mb-0.5">Kurtosis &lt; 3</div>
          <div className="text-[10px] text-zinc-500">Pic plat, queues fines</div>
        </div>
        {/* Mesokurtic Card */}
        <div onClick={() => setKurtValue(50)} className={`flex-1 rounded-lg p-3 text-center border cursor-pointer transition-all duration-300 ${state === 'Mésokurtique' ? `${theme.activeBg} ${theme.activeBorder}` : 'bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50'}`}>
          <div className="text-sm font-bold text-[#22c55e] mb-0.5">Mésokurtique</div>
          <div className="text-xs text-zinc-400 mb-0.5">Kurtosis = 3</div>
          <div className="text-[10px] text-zinc-500">Distribution normale</div>
        </div>
        {/* Leptokurtic Card */}
        <div onClick={() => setKurtValue(100)} className={`flex-1 rounded-lg p-3 text-center border cursor-pointer transition-all duration-300 ${state === 'Leptokurtique' ? `${theme.activeBg} ${theme.activeBorder}` : 'bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50'}`}>
          <div className="text-sm font-bold text-[#f43f5e] mb-0.5">Leptokurtique</div>
          <div className="text-xs text-zinc-400 mb-0.5">Kurtosis &gt; 3</div>
          <div className="text-[10px] text-zinc-500">Pic pointu, queues épaisses</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-end mb-2 text-xs font-semibold mr-4 relative z-10">
        <div className="flex items-center gap-2 border border-zinc-700/50 px-3 py-1.5 rounded-md bg-[#18191b]/80 shadow-sm">
          <div className="w-4 border-t-2 border-dashed border-[#22c55e]"></div>
          <span className="text-zinc-400">Normale (référence)</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative w-full h-[280px] mb-12 flex items-end pl-10 pb-8 mt-2">
        {/* Labels & Annotations */}
        {state === 'Leptokurtique' && (
          <>
            <div className="absolute top-[35%] left-[20%] text-[11px] font-bold text-[#f43f5e] uppercase tracking-wider animate-pulse">Queue épaisse</div>
            <div className="absolute top-[35%] right-[20%] text-[11px] font-bold text-[#f43f5e] uppercase tracking-wider animate-pulse">Queue épaisse</div>
          </>
        )}

        {/* Y Axis Label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] text-zinc-500 font-medium tracking-[0.2em] uppercase">
          Fréquence
        </div>
        {/* X Axis Label */}
        <div className="absolute bottom-0 left-1/2 text-[11px] text-zinc-500 font-medium tracking-[0.2em] uppercase">
          Valeur
        </div>

        {/* Axes lines (L-shape) */}
        <div className="absolute left-10 bottom-8 top-0 w-px bg-zinc-600/60 z-10"></div>
        <div className="absolute left-10 bottom-8 right-0 h-px bg-zinc-600/60 z-10"></div>

        {/* Chart content container */}
        <div className="relative w-full h-full flex items-end px-1 ml-2">
          
          {/* Default Normal Dashed Line Overlay */}
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="absolute inset-x-1 bottom-0 h-full z-30 pointer-events-none"
            style={{ width: 'calc(100% - 8px)' }}
          >
            <polyline
              points={normalLinePoints}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="6,4"
              className="opacity-70 gap-4"
            />
          </svg>

          {/* Bins */}
          <div className="absolute inset-x-1 bottom-0 h-full flex items-end z-20">
            {bins.map((bin, i) => (
              <div 
                key={i} 
                className={`flex-1 mx-[1px] border-t-2 border-r-[1px] border-l-[1px] opacity-90 transition-all duration-300 ${theme.barBg} ${theme.barBorder}`}
                style={{ height: `${bin.height}%` }}
              ></div>
            ))}
          </div>
          
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-[#18191b] rounded-xl p-5 border border-zinc-800/80">
        <div className="text-sm text-zinc-300 tracking-wide">
          <span className={`font-bold ${theme.titleColor}`}>{theme.descHeading}</span>
          {theme.desc}
        </div>
      </div>
    </div>
  );
}
