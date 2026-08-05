const fs = require('fs');

// Patch LeftSidebar
let leftCode = fs.readFileSync('src/components/LeftSidebar.tsx', 'utf8');
leftCode = leftCode.replace(
  /<div className="w-64 border-r border-slate-800 bg-slate-900\/50 flex flex-col z-10 relative h-full">/,
  `<div className="w-full md:w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col z-10 relative h-full">`
);
fs.writeFileSync('src/components/LeftSidebar.tsx', leftCode);

// Patch RightSidebar
let rightCode = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');
rightCode = rightCode.replace(
  /<div className="w-72 border-l border-slate-800 bg-slate-900\/50 flex flex-col z-10 relative">/,
  `<div className="w-full md:w-72 border-l border-slate-800 bg-slate-900/50 flex flex-col z-10 relative h-full">`
);
fs.writeFileSync('src/components/RightSidebar.tsx', rightCode);

