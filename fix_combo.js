import fs from 'fs';

let file = 'src/components/DailyComboDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Math\.round\(\s*\(\s*([^()]+)\s*\/\s*([^()]+)\s*\)\s*\*\s*100\s*,?\s*\)/g, 'parseFloat((($1 / $2) * 100).toFixed(1))');

fs.writeFileSync(file, content);
console.log('Fixed dailycombo');
