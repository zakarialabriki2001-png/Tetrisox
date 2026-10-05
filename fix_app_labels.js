import fs from 'fs';

let file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/80\% accuracy/g, '85% accuracy');
content = content.replace(/80\%\+ accuracy/g, '85%+ accuracy');
content = content.replace(/80\% on last 10 finished games/g, '85% on recent 20 finished games');
content = content.replace(/last 10 games/g, 'recent 20 games');
content = content.replace(/≥80\%/g, '≥85%');

fs.writeFileSync(file, content);

console.log('Fixed UI labels');
