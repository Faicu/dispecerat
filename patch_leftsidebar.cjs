const fs = require('fs');
let code = fs.readFileSync('src/components/LeftSidebar.tsx', 'utf8');

// Add state for accordion and purchase modal
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\('units'\);/,
  `const [activeTab, setActiveTab] = useState('units');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['police', 'fire', 'ambulance']);
  const [showPurchaseMenu, setShowPurchaseMenu] = useState(false);
  const toggleCategory = (type: string) => setExpandedCategories(prev => prev.includes(type) ? prev.filter(c => c !== type) : [...prev, type]);`
);

// Accordion for units
code = code.replace(
  /<div className="text-\[9px\] uppercase font-bold text-slate-500 border-b border-slate-800 pb-1">\{UNIT_THEME\[type\]\.label\} \(\{units\.length\}\)<\/div>[\s\S]*?\{units\.map/,
  `<div onClick={() => toggleCategory(type)} className="cursor-pointer text-[9px] uppercase font-bold text-slate-400 bg-slate-800/40 p-1.5 rounded flex justify-between items-center hover:bg-slate-800/80 transition-colors">
                <span>{UNIT_THEME[type].label} ({units.length})</span>
                <span>{expandedCategories.includes(type) ? '▲' : '▼'}</span>
              </div>
              {expandedCategories.includes(type) && units.map`
);
code = code.replace(
  /\(unit => \{/,
  `(unit => {`
);

// Purchase Units Button
code = code.replace(
  /<div className="text-\[10px\] font-bold uppercase tracking-widest text-slate-500 mb-2">Purchase Units<\/div>[\s\S]*?<\/div>(\s*<div className="mt-2 pt-2 border-t border-slate-700\/50">)/,
  `
         <button onClick={() => setShowPurchaseMenu(!showPurchaseMenu)} className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 p-2 rounded text-[10px] uppercase font-bold tracking-widest transition-colors">
            {showPurchaseMenu ? 'Ascunde Magazin' : 'Magazin Unități'}
         </button>
         {showPurchaseMenu && (
           <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] uppercase font-bold text-center">
              {(['police', 'ambulance', 'fire', 'gendarmerie', 'swat', 'helicopter'] as UnitType[]).map(type => {
                const canAfford = gameState.budget >= UNIT_PRICES[type];
                return (
                  <button
                    key={type}
                    onClick={() => onPurchase(type)}
                    disabled={!canAfford}
                    className={\`border p-1 rounded transition-colors \${canAfford ? \`bg-slate-800 border-slate-700 text-slate-300 \${UNIT_THEME[type].hoverClasses}\` : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'}\`}
                  >
                    {UNIT_THEME[type].label.split(' ')[0]}<br/><span className={canAfford ? 'text-emerald-500' : 'text-slate-600'}>€{UNIT_PRICES[type] / 1000}k</span>
                  </button>
                );
              })}
           </div>
         )}$1`
);

fs.writeFileSync('src/components/LeftSidebar.tsx', code);
