const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(Date\.now\(\) - incident\.createdAt > 180000 && !incident\.isResolving\) \{ \/\/ 3 minutes to resolve/g,
  `const isAssigned = incident.assignedUnits.length > 0;
      const timeLimit = isAssigned ? 300000 : 60000;
      if (Date.now() - incident.createdAt > timeLimit && !incident.isResolving) {`
);

fs.writeFileSync('server.ts', code);
