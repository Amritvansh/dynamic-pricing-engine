const https = require('https');

https.get('https://dynamic-pricing-frontend-theta.vercel.app', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (match) {
      const jsUrl = 'https://dynamic-pricing-frontend-theta.vercel.app' + match[1];
      https.get(jsUrl, (res2) => {
        let jsData = '';
        res2.on('data', chunk => jsData += chunk);
        res2.on('end', () => {
          const createIndex = jsData.indexOf('dpe_auth_token');
          if (createIndex !== -1) {
            console.log('Found dpe_auth_token around here:');
            console.log(jsData.substring(createIndex - 100, createIndex + 200));
          } else {
            console.log('dpe_auth_token not found');
          }
        });
      });
    }
  });
});
