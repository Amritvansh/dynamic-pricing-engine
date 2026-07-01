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
          // find where axios.create is called
          const createIndex = jsData.indexOf('axios.create');
          if (createIndex !== -1) {
            console.log('Found axios.create around here:');
            console.log(jsData.substring(createIndex - 100, createIndex + 200));
          } else {
            console.log('axios.create not found');
          }
        });
      });
    }
  });
});
