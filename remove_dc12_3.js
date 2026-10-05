import fs from 'fs';

const data = JSON.parse(fs.readFileSync('db-store.json', 'utf8'));

// Iterate over signals
if (data.signals) {
  for (const dateKey of Object.keys(data.signals)) {
    const dailySignals = data.signals[dateKey];
    for (const signal of dailySignals) {
      if (signal.stats && signal.stats.market_performance && signal.stats.market_performance['DC_12']) {
        delete signal.stats.market_performance['DC_12'];
      }
      
      if (signal.predictions) {
        signal.predictions = signal.predictions.filter(p => p.market !== 'DC_12');
      }
      
      if (signal.top_predictions) {
        signal.top_predictions = signal.top_predictions.filter(p => p.market !== 'DC_12');
      }
    }
  }
}

// Clean up match states if possible
if (data.matches) {
   for (const key of Object.keys(data.matches)) {
      if (data.matches[key].odds && data.matches[key].odds['DC_12']) {
          delete data.matches[key].odds['DC_12'];
      }
   }
}

fs.writeFileSync('db-store.json', JSON.stringify(data, null, 2));
console.log('Removed DC_12 from db-store.json');
