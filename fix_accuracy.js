import fs from 'fs';

function fixRounding(file) {
  let content = fs.readFileSync(file, 'utf8');

  if (file.includes('App.tsx')) {
    content = content.replace(/s\.total_resolved >= 15/g, 's.total_resolved >= 20');
    content = content.replace(/last15ForSignal/g, 'recent20ForSignal');
    content = content.replace(/\.slice\(0, 15\)/g, '.slice(0, 20)');
    content = content.replace(/15 settled games/g, '20 settled games');
    
    content = content.replace(/accuracy_rate >= 0\.8\b/g, 'accuracy_rate >= 0.85');
    content = content.replace(/>= 0\.8\b/g, '>= 0.85');
    // content = content.replace(/0\.866/g, '0.85'); // I already sed-ed it? Wait, sed failed. So this will do it.
    content = content.replace(/0\.866/g, '0.85');
  }

  // Replace Math.round((A / B) * 100) with parseFloat(((A / B) * 100).toFixed(1))
  content = content.replace(/Math\.round\(\s*\(\s*([^()]+)\s*\/\s*([^()]+)\s*\)\s*\*\s*100\s*,?\s*\)/g, 'parseFloat((($1 / $2) * 100).toFixed(1))');
  content = content.replace(/Math\.round\(\s*([^()]+)\s*\*\s*100\s*,?\s*\)/g, 'parseFloat(($1 * 100).toFixed(1))');
  
  // also handle the case like Math.round((total / total2) * 100 ) when there are newlines.. regex with [\s\S]
  // Let's do it simply
  
  fs.writeFileSync(file, content);
}

fixRounding('src/App.tsx');
fixRounding('src/lib/signalTrainer.ts');
console.log('Fixed accuracy roundings');
