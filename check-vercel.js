const https = require('https');

https.get('https://dynamic-pricing-frontend-theta.vercel.app', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (match) {
      const jsUrl = 'https://dynamic-pricing-frontend-theta.vercel.app' + match[1];
      console.log('Fetching JS bundle:', jsUrl);
      https.get(jsUrl, (res2) => {
        let jsData = '';
        res2.on('data', chunk => jsData += chunk);
        res2.on('end', () => {
          const t15 = jsData.includes('timeout:15000');
          const t60 = jsData.includes('timeout:60000');
          console.log('Contains timeout:15000 ?', t15);
          console.log('Contains timeout:60000 ?', t60);
          
          const timeoutMatch = jsData.match(/timeout:\d+/g);
          if (timeoutMatch) {
            console.log('Found timeouts:', timeoutMatch.join(', '));
          }
        });
      });
    } else {
      console.log('No JS bundle found in HTML');
    }
  });
});
