import { useState } from 'preact/hooks';

export default function BoxPlotExplorer() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      id: 'overview',
      title: "Aperçu",
      desc: "Cette visualisation est une boîte à moustaches (box plot) annotée, une méthode de référence pour afficher la distribution des données grâce à un résumé en cinq nombres. Les boîtes à moustaches sont très utiles pour identifier les valeurs aberrantes et comparer la dispersion. L'écart interquartile (la boîte), l'étendue (les moustaches) et les mesures de tendance centrale y sont représentés."
    },
    {
      id: 'q1',
      title: "Premier Quartile et Boîte",
      desc: "Le bord gauche de la boîte marque le premier quartile (Q1). Cela correspond au 25ème centile : 25 % des valeurs de l'échantillon lui sont inférieures. La boîte s'étend de Q1 à Q3, encapsulant ainsi la moitié centrale (50 %) des données."
    },
    {
      id: 'median',
      title: "Médiane",
      desc: "La ligne verticale à l'intérieur de la boîte représente la médiane (Q2), le 50ème centile. C'est la valeur charnière qui sépare exactement l'échantillon trié en deux moitiés de taille égale."
    },
    {
      id: 'mean',
      title: "Moyenne",
      desc: "La croix (×) désigne la moyenne arithmétique. Bien que le box plot repose naturellement sur les quartiles robustes, la moyenne y est souvent insérée pour évaluer l'asymétrie : une moyenne excentrée par rapport à la médiane signale une distribution asymétrique (skewness)."
    },
    {
      id: 'q3',
      title: "Troisième Quartile",
      desc: "Le bord droit de la boîte délimite le troisième quartile (Q3). C'est le 75ème centile, indiquant que la vaste majorité (75 %) des points de données sont accumulés sous ce seuil."
    },
    {
      id: 'iqr',
      title: "Écart Interquartile (IQR)",
      desc: "La boîte entière incarne l'Écart Interquartile (IQR = Q3 - Q1), l'espace où résident les 50 % de valeurs les plus centrales. C'est un indicateur de dispersion particulièrement puissant car il ignore d'emblée l'impact des extrémités extrêmes."
    },
    {
      id: 'whisker',
      title: "Moustaches",
      desc: "Les segments horizontaux, surnommés moustaches, s'étendent de part et d'autre de la boîte. Ils illustrent la portée des données considérées comme régulières et atteignent souvent une distance maximale conventionnelle de 1,5 fois l'IQR."
    },
    {
      id: 'minmax',
      title: "Minimum et Maximum",
      desc: "Les traits d'arrêt marquant l'extrémité des moustaches définissent le minimum et le maximum stricts des données 'non-aberrantes'. Toute valeur respectant ces frontières est considérée comme statistiquement représentative."
    },
    {
      id: 'outlier',
      title: "Valeurs Aberrantes (Outliers)",
      desc: "Les points isolés flottant au-delà des moustaches sont les valeurs aberrantes (outliers). Leur statut mathématiquement exceptionnel exige qu'elles soient affichées et potentiellement analysées ou nettoyées séparément."
    }
  ];

  const isStep = (ids) => {
    if (step === 0) return true;
    return ids.includes(steps[step].id);
  };

  const isEmphasized = (ids) => {
    return step !== 0 && ids.includes(steps[step].id);
  };

  const getLineClass = (visibleIds, emphasizeIds = visibleIds) => {
    const active = isStep(visibleIds);
    const emphasized = isEmphasized(emphasizeIds);
    if (emphasized) return "stroke-[#38bdf8] drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]";
    if (active) return "stroke-[#0ea5e9]";
    return "stroke-zinc-700/40";
  };

  const getStrokeWidth = (visibleIds, emphasizeIds = visibleIds) => {
    return isEmphasized(emphasizeIds) ? 3 : 2;
  };

  const getTextClass = (ids) => {
    const active = isStep(ids);
    const emphasized = isEmphasized(ids);
    if (emphasized) return "fill-white font-bold drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]";
    if (active) return "fill-zinc-300 font-semibold";
    return "fill-zinc-600 font-medium";
  };

  const getCircleClass = (visibleIds, emphasizeIds = visibleIds) => {
    const active = isStep(visibleIds);
    const emphasized = isEmphasized(emphasizeIds);
    if (emphasized) return "stroke-[#38bdf8] fill-[#0c0c0e] drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]";
    if (active) return "stroke-[#0ea5e9] fill-[#0c0c0e]";
    return "stroke-zinc-700/40 fill-transparent";
  };

  return (
    <div className="my-8 rounded-xl bg-[#0c0c0e] text-zinc-300 p-8 shadow-2xl border border-zinc-800/80 font-sans not-prose">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 text-white">Explorateur Box Plot</h3>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Découvrez la construction d'une boîte à moustaches. Utilisez la navigation ci-dessous pour explorer chaque élément statistique.
        </p>
      </div>

      <div className="relative w-full overflow-hidden bg-[#121316] rounded-xl border border-zinc-800 p-4 pt-10 pb-6 mb-6">
        <svg viewBox="0 0 800 320" className="w-full h-auto">
          {/* Box Fill */}
          <rect 
            x="280" y="110" width="300" height="80" 
            className={`transition-all duration-300 ${isStep(['iqr']) ? (isEmphasized(['iqr']) ? 'fill-[#0ea5e9]/20' : 'fill-[#0ea5e9]/10') : 'fill-transparent'}`} 
          />

          {/* Regular Data Points */}
          <g className={`transition-all duration-300 ${isStep(['overview']) ? 'opacity-100' : 'opacity-0'}`}>
            {[190, 220, 300, 350, 480, 520, 620, 650].map(cx => (
              <circle key={cx} cx={cx} cy="150" r="3" className={getCircleClass(['overview'])} strokeWidth="1.5" />
            ))}
          </g>

          {/* Outliers */}
          <g className="transition-all duration-300">
            {[50, 90, 760].map(cx => (
              <circle key={cx} cx={cx} cy="150" r="4.5" className={getCircleClass(['outlier', 'overview'], ['outlier'])} strokeWidth="2" />
            ))}
          </g>

          {/* Whiskers Lines */}
          <line x1="150" y1="150" x2="280" y2="150" className={`${getLineClass(['whisker', 'minmax', 'overview'], ['whisker'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['whisker'])} />
          <line x1="580" y1="150" x2="680" y2="150" className={`${getLineClass(['whisker', 'minmax', 'overview'], ['whisker'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['whisker'])} />

          {/* Min & Max Ticks */}
          <line x1="150" y1="130" x2="150" y2="170" className={`${getLineClass(['minmax', 'overview', 'whisker'], ['minmax'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['minmax'])} />
          <line x1="680" y1="130" x2="680" y2="170" className={`${getLineClass(['minmax', 'overview', 'whisker'], ['minmax'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['minmax'])} />

          {/* Box Edges */}
          <line x1="280" y1="110" x2="580" y2="110" className={`${getLineClass(['iqr', 'overview'], ['iqr'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['iqr'])} />
          <line x1="280" y1="190" x2="580" y2="190" className={`${getLineClass(['iqr', 'overview'], ['iqr'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['iqr'])} />

          <line x1="280" y1="110" x2="280" y2="190" className={`${getLineClass(['q1', 'iqr', 'overview'], ['q1', 'iqr'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['q1', 'iqr'])} />
          <line x1="440" y1="110" x2="440" y2="190" className={`${getLineClass(['median', 'overview'], ['median'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['median'])} />
          <line x1="580" y1="110" x2="580" y2="190" className={`${getLineClass(['q3', 'iqr', 'overview'], ['q3', 'iqr'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['q3', 'iqr'])} />

          {/* Mean */}
          <path d="M 395,145 L 405,155 M 395,155 L 405,145" className={`${getLineClass(['mean', 'overview'], ['mean'])} transition-all duration-300`} strokeWidth={getStrokeWidth(['mean']) + 0.5} strokeLinecap="round" />

          {/* Typography */}
          <g className={`transition-all duration-300 ${getTextClass(['outlier', 'overview'])}`}>
            <text x="70" y="55" fontSize="13" textAnchor="middle">Valeurs</text>
            <text x="70" y="73" fontSize="12" textAnchor="middle" className="opacity-80">Aberrantes</text>
            <line x1="70" y1="85" x2="70" y2="135" className={`${getLineClass(['outlier', 'overview'], ['outlier'])} opacity-60`} strokeWidth="1.5" strokeDasharray="3,3" />
            <polygon points="67,132 73,132 70,138" className={isStep(['outlier', 'overview']) ? (isEmphasized(['outlier']) ? 'fill-[#38bdf8]' : 'fill-[#0ea5e9]') : 'fill-zinc-700/40'} />
          </g>

          <text x="150" y="205" fontSize="14" textAnchor="middle" className={`transition-all duration-300 ${getTextClass(['minmax', 'overview'])}`}>Minimum</text>
          <text x="680" y="205" fontSize="14" textAnchor="middle" className={`transition-all duration-300 ${getTextClass(['minmax', 'overview'])}`}>Maximum</text>

          <text x="215" y="140" fontSize="13" textAnchor="middle" className={`transition-all duration-300 ${getTextClass(['whisker', 'overview'])}`}>Moustache</text>
          <text x="630" y="140" fontSize="13" textAnchor="middle" className={`transition-all duration-300 ${getTextClass(['whisker', 'overview'])}`}>Moustache</text>

          <g className={`transition-all duration-300 ${getTextClass(['q1', 'overview'])}`}>
            <text x="280" y="55" fontSize="13" textAnchor="middle">Premier Quartile</text>
            <text x="280" y="73" fontSize="12" textAnchor="middle" className="opacity-80">Q1</text>
          </g>

          <g className={`transition-all duration-300 ${getTextClass(['median', 'overview'])}`}>
            <text x="440" y="55" fontSize="13" textAnchor="middle">Médiane</text>
            <text x="440" y="73" fontSize="12" textAnchor="middle" className="opacity-80">Q2</text>
          </g>

          <g className={`transition-all duration-300 ${getTextClass(['mean', 'overview'])}`}>
            <text x="385" y="73" fontSize="13" textAnchor="middle">Moyenne</text>
            <line x1="385" y1="85" x2="400" y2="135" className={`${getLineClass(['mean', 'overview'], ['mean'])} opacity-60`} strokeWidth="1.5" strokeDasharray="3,3" />
            <polygon points="398,131 404,133 401,139" className={isStep(['mean', 'overview']) ? (isEmphasized(['mean']) ? 'fill-[#38bdf8]' : 'fill-[#0ea5e9]') : 'fill-zinc-700/40'} />
          </g>

          <g className={`transition-all duration-300 ${getTextClass(['q3', 'overview'])}`}>
            <text x="580" y="55" fontSize="13" textAnchor="middle">Troisième Quartile</text>
            <text x="580" y="73" fontSize="12" textAnchor="middle" className="opacity-80">Q3</text>
          </g>

          <g className={`transition-all duration-300 ${getTextClass(['iqr', 'overview'])}`}>
            <path d="M 280,215 Q 280,225 355,225 Q 430,225 430,235 Q 430,225 505,225 Q 580,225 580,215" fill="none" className={`${getLineClass(['iqr', 'overview'], ['iqr'])} transition-all duration-300`} strokeWidth="1.5" />
            <text x="430" y="255" fontSize="14" textAnchor="middle">Écart Interquartile</text>
            <text x="430" y="275" fontSize="13" textAnchor="middle" className="opacity-80">IQR</text>
          </g>
        </svg>
      </div>

      <div className="flex flex-col bg-[#18191b] rounded-xl border border-zinc-800/80 overflow-hidden shadow-lg mt-8 relative">
        <div className="absolute top-0 left-0 h-[3px] bg-zinc-800 w-full">
            <div className="h-full bg-[#0ea5e9] transition-all duration-500 ease-in-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
        </div>
        <div className="p-6 pt-7">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-[#e2e8f0]">{steps[step].title}</h4>
            <div className="flex items-center gap-2 bg-[#0c0c0e] px-2 py-1 rounded-lg border border-zinc-800 shadow-inner">
              <button 
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-zinc-500 p-1.5 hover:text-white hover:bg-zinc-800 rounded-md transition-all disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="text-xs font-bold text-zinc-500 tracking-[0.2em] w-[45px] text-center">
                {step + 1}/{steps.length}
              </span>
              <button 
                onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                disabled={step === steps.length - 1}
                className="text-zinc-500 p-1.5 hover:text-white hover:bg-zinc-800 rounded-md transition-all disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          <p className="text-sm md:text-[15px] text-zinc-400 leading-relaxed min-h-[72px]">
            {steps[step].desc}
          </p>
        </div>
      </div>
    </div>
  );
}
