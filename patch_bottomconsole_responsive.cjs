const fs = require('fs');
let code = fs.readFileSync('src/components/BottomConsole.tsx', 'utf8');

// For unit selection
code = code.replace(
  /<div className="h-40 border-t border-slate-800 bg-slate-900\/90 p-4 flex gap-6 z-20 relative">/,
  `<div className="h-auto md:h-40 border-t border-slate-800 bg-slate-900/90 p-4 flex flex-col md:flex-row gap-4 md:gap-6 z-20 relative">`
);

code = code.replace(
  /<div className="w-1\/3 flex flex-col gap-2">/,
  `<div className="w-full md:w-1/3 flex flex-col gap-2">`
);

code = code.replace(
  /<div className="flex-1 flex flex-col justify-center border-l border-slate-800 pl-6 gap-4">/,
  `<div className="flex-1 flex flex-col justify-center md:border-l border-slate-800 md:pl-6 gap-4">`
);

// For incident selection
code = code.replace(
  /<div className="h-48 border-t border-slate-800 bg-slate-900\/90 p-4 flex gap-6 z-20 relative">/,
  `<div className="h-auto md:h-48 min-h-[16rem] md:min-h-0 border-t border-slate-800 bg-slate-900/90 p-4 flex flex-col md:flex-row gap-4 md:gap-6 z-20 relative overflow-y-auto">`
);

code = code.replace(
  /<div className="w-1\/2 flex flex-col gap-2">/,
  `<div className="w-full md:w-1/2 flex flex-col gap-2 shrink-0">`
);

// Unit dispatch lists in the second half
code = code.replace(
  /<div className="w-1\/2 flex flex-col">/,
  `<div className="w-full md:w-1/2 flex flex-col gap-2 shrink-0 overflow-y-auto">`
);

fs.writeFileSync('src/components/BottomConsole.tsx', code);
