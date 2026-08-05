const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const occurrences = code.match(/export default App;/g);
if (occurrences && occurrences.length > 1) {
   // Keep only the last one
   const idx = code.lastIndexOf('export default App;');
   code = code.substring(0, idx).replace(/export default App;/g, '') + code.substring(idx);
   fs.writeFileSync('src/App.tsx', code);
}
