import { useState, useMemo } from 'preact/hooks';

export default function SkewnessExplorer() {
  const [skewValue, setSkewValue] = useState(50); // 0 to 100

  const p = skewValue / 100;
  
  // Base arrays reflecting EXACTLY the shapes from the images
  const RIGHT_BINS = [0.5, 100, 25, 18, 14, 11, 9, 8, 7, 6, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];
  const SYMM_BINS = [1, 2, 4, 8, 15, 25, 40, 60, 85, 100, 100, 85, 60, 40, 25, 15, 8, 4, 2, 1];
  const LEFT_BINS = [...RIGHT_BINS].reverse();
  
  const numBins = 20;
  
  const interpolatedBins = useMemo(() => {
    return Array.from({ length: numBins }).map((_, i) => {
      if (p < 0.5) {
        // Interpolate between LEFT and SYMM
        const weightSymm = p * 2;
        return LEFT_BINS[i] * (1 - weightSymm) + SYMM_BINS[i] * weightSymm;
      } else {
        // Interpolate between SYMM and RIGHT
        const weightRight = (p - 0.5) * 2;
        return SYMM_BINS[i] * (1 - weightRight) + RIGHT_BINS[i] * weightRight;
      }
    });
  }, [p]);
  
  // Calculate Stats exactly from the bars
  let sum = 0;
  let sumX = 0;
  let maxD = 0;
  let modeIndex = 0;
  
  interpolatedBins.forEach((val, i) => {
    sum += val;
    sumX += val * (i + 0.5);
    if (val > maxD) {
      maxD = val;
      modeIndex = i;
    }
  });
  
  let mean = (sumX / sum) / numBins;
  
  // If perfectly symmetric, mode should be exactly 0.5 (between the two peaks)
  let mode = p === 0.5 ? 0.5 : (modeIndex + 0.5) / numBins;
  
  let runningSum = 0;
  let median = 0;
  for (let i = 0; i < numBins; i++) {
    runningSum += interpolatedBins[i];
    if (runningSum >= sum / 2) {
      const prevSum = runningSum - interpolatedBins[i];
      const needed = (sum / 2) - prevSum;
      const fraction = needed / interpolatedBins[i];
      median = (i + fraction) / numBins;
      break;
    }
  }

  // Final rendering array (scale max to 85% visually)
  const bins = interpolatedBins.map((val, i) => ({
    x: (i + 0.5) / numBins,
    height: (val / maxD) * 85
  }));

  // Determine heights of the lines at their exact positions
  const getLineHeight = (pos) => {
    // Find nearest bin
    const binIndex = Math.min(Math.max(Math.floor(pos * numBins), 0), numBins - 1);
    return bins[binIndex]?.height || 0;
  };

  let theme = {
    category: "Symétrique",
    badgeBg: "bg-[#14532d]/40",
    badgeText: "text-[#22c55e]",
    badgeBorder: "border-[#22c55e]/30",
    barBg: "bg-[#22c55e]/30",
    barBorder: "border-[#22c55e]",
    sliderFill: "#22c55e",
    relation: ["Moyenne", "≈", "Médiane", "≈", "Mode"],
    desc: "Dans des données symétriques, les mesures de centralité coïncident.",
  };
  
  if (p < 0.45) {
    theme = {
      category: "Asymétrique à Gauche (Négatif)",
      badgeBg: "bg-[#1e3a8a]/40",
      badgeText: "text-[#3b82f6]",
      badgeBorder: "border-[#3b82f6]/30",
      barBg: "bg-[#3b82f6]/30",
      barBorder: "border-[#3b82f6]",
      sliderFill: "#3b82f6",
      relation: ["Moyenne", "<", "Médiane", "<", "Mode"],
      desc: "Dans une asymétrie à gauche, la traîne attire la moyenne vers la gauche.",
    };
  } else if (p > 0.55) {
    theme = {
      category: "Asymétrique à Droite (Positif)",
      badgeBg: "bg-[#78350f]/40",
      BadgeText: "text-[#f59e0b]",
      badgeText: "text-[#f59e0b]",
      badgeBorder: "border-[#f59e0b]/30",
      barBg: "bg-[#f59e0b]/30",
      barBorder: "border-[#f59e0b]",
      sliderFill: "#f59e0b",
      relation: ["Mode", "<", "Médiane", "<", "Moyenne"],
      desc: "Dans une asymétrie à droite, la traîne attire la moyenne vers la droite.",
    };
  }

  const renderRelationString = () => {
    return theme.relation.map((word, i) => {
      let colorClass = "text-zinc-500";
      if (word === "Moyenne") colorClass = "text-[#22c55e]";
      if (word === "Médiane") colorClass = "text-[#06b6d4]";
      if (word === "Mode") colorClass = "text-[#f59e0b]";
      
      return (
        <span key={i} className={`mx-1 font-bold ${colorClass}`}>
          {word}
        </span>
      );
    });
  };

  return (
    <div className="my-8 rounded-xl bg-[#0c0c0e] text-zinc-300 p-8 shadow-2xl border border-zinc-800/80 font-sans not-prose">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2 text-white">Skewness Explorer</h3>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Déplacez le curseur pour voir comment l'asymétrie affecte la forme de la distribution et la relation entre la Moyenne, la Médiane et le Mode.
        </p>
      </div>

      {/* Slider Area */}
      <div className="flex flex-col mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-400">Asymétrie</span>
          <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} transition-colors duration-300 shadow-sm`}>
            {theme.category}
          </span>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Gauche</span>
          <div className="relative flex-1 flex items-center h-2">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={skewValue} 
              onInput={(e) => setSkewValue(e.currentTarget.valueAsNumber)}
              className="absolute w-full h-full opacity-0 cursor-pointer z-20"
            />
            {/* Custom slider track */}
            <div className="absolute top-0 left-0 w-full h-full bg-zinc-700/50 rounded-full z-0 overflow-hidden">
              <div 
                className="h-full transition-all duration-300 rounded-full" 
                style={{ width: `${skewValue}%`, backgroundColor: theme.sliderFill }}
              ></div>
            </div>
            {/* Custom slider thumb */}
            <div 
              className="absolute w-5 h-5 bg-[#0c0c0e] border-[3px] border-zinc-300 rounded-full z-10 transition-all duration-75 pointer-events-none transform -translate-x-1/2"
              style={{ left: `${skewValue}%` }}
            ></div>
          </div>
          <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Droite</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mb-10 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#22c55e]"></div>
          <span className="text-zinc-300">Moyenne</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#06b6d4]"></div>
          <span className="text-zinc-300">Médiane</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b]"></div>
          <span className="text-zinc-300">Mode</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative w-full h-[280px] mb-12 flex items-end pl-10 pb-8">
        {/* Y Axis Label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] text-zinc-500 font-medium tracking-[0.2em] uppercase">
          Fréquence
        </div>
        {/* X Axis Label */}
        <div className="absolute -bottom-6 left-1/2 text-[11px] text-zinc-500 font-medium tracking-[0.2em] uppercase">
          Valeur
        </div>

        {/* Axes lines (L-shape) */}
        <div className="absolute left-12 bottom-9 top-0 w-px bg-zinc-600/60 z-10"></div>
        <div className="absolute left-12 bottom-9 right-0 h-px bg-zinc-600/60 z-10"></div>

        {/* Chart content container */}
        <div className="relative w-full h-full flex items-end px-1 ml-2">
          
          {/* Bins */}
          <div className="absolute inset-x-1 bottom-0 h-full flex items-end z-20">
            {bins.map((bin, i) => (
              <div 
                key={i} 
                className={`flex-1 mx-[1px] border-t-2 border-r-2 border-l-2 opacity-90 transition-all duration-300 ${theme.barBg} ${theme.barBorder}`}
                style={{ height: `${bin.height}%` }}
              ></div>
            ))}
          </div>

          {/* Median Line (Solid Cyan, sits exactly at bar height, dot at bottom) */}
          <div 
            className="absolute bottom-0 w-px bg-[#06b6d4] z-30 transition-all duration-300 flex flex-col justify-end items-center"
            style={{ left: `${median * 100}%`, height: `${getLineHeight(median)}%` }}
          >
            <div className="absolute -bottom-[5px] w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></div>
            <span className="absolute -bottom-[26px] text-xs text-[#06b6d4] font-bold">Médiane</span>
          </div>

          {/* Mean Line (Dashed Green, goes above bars, dot at top) */}
          <div 
            className="absolute bottom-0 w-px border-l-[2px] border-dashed border-[#22c55e] z-30 transition-all duration-300 flex flex-col justify-start items-center"
            style={{ left: `${mean * 100}%`, height: `${Math.max(getLineHeight(mean) + 15, 40)}%` }}
          >
            <div className="absolute -top-[5px] w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
            <span className="absolute -top-[24px] text-xs text-[#22c55e] font-bold">Moyenne</span>
          </div>

          {/* Mode Line (Dotted Orange, stops exactly at peak with arrow) */}
          <div 
            className="absolute bottom-0 w-px border-l-[2px] border-dotted border-[#f59e0b] z-30 transition-all duration-300 flex flex-col justify-start items-center"
            style={{ left: `${mode * 100}%`, height: `${getLineHeight(mode)}%` }}
          >
            {/* Arrow Head */}
            <div className="absolute -top-1 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#f59e0b]"></div>
            <span className="absolute -top-[22px] text-xs text-[#f59e0b] font-bold">Mode</span>
          </div>
          
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-[#18191b] rounded-xl p-5 text-center border border-zinc-800/80">
        <div className="text-[17px] tracking-wide mb-2 flex items-center justify-center">
          {renderRelationString()}
        </div>
        <div className="text-sm text-zinc-500">{theme.desc}</div>
      </div>
    </div>
  );
}
