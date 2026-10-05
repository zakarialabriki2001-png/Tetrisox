import fs from 'fs';

for (const file of ['src/components/PremiumStatsDashboard.tsx', 'src/components/BetGeneratorDashboard.tsx']) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/Math\.round\(\s*\(\s*([^()]+)\s*\/\s*([^()]+)\s*\)\s*\*\s*100\s*,?\s*\)/g, 'parseFloat((($1 / $2) * 100).toFixed(1))');
  content = content.replace(/Math\.round\(\s*([^()]+)\s*\*\s*100\s*,?\s*\)/g, 'parseFloat(($1 * 100).toFixed(1))');

  // Replace hardcoded 80%+ accuracy ratings text ?
  content = content.replace(/80\%\+ accuracy/g, '85%+ accuracy');

  fs.writeFileSync(file, content);
}
console.log('Fixed premium and betgenerator UI text and roundings');
