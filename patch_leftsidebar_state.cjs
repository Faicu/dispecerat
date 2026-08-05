const fs = require('fs');
let code = fs.readFileSync('src/components/LeftSidebar.tsx', 'utf8');

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'units' \| 'logs'>\('units'\);/,
  `const [activeTab, setActiveTab] = useState<'units' | 'logs'>('units');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['police', 'fire', 'ambulance', 'gendarmerie', 'swat', 'helicopter']);
  const [showPurchaseMenu, setShowPurchaseMenu] = useState(false);
  const toggleCategory = (type: string) => setExpandedCategories(prev => prev.includes(type) ? prev.filter(c => c !== type) : [...prev, type]);`
);

fs.writeFileSync('src/components/LeftSidebar.tsx', code);
