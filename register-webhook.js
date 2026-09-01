const https = require('https');

const SELLER_ID = '6739774';
const API_KEY = 'nKQxlSFFAp9plwgZhoqa';
const API_SECRET = 'fdMhGGTEkMOCpDDjqlL4';
const WEBHOOK_URL = 'https://pilavci-sitem7.vercel.app/api/webhooks/trendyol';

const payload = JSON.stringify({
  url: WEBHOOK_URL,
  authenticationType: "API_KEY",
  apiKey: "pilavci-secret-key-123", // A random key just in case Trendyol requires it for their auth to us
  subscribedStatuses: [] // all statuses
});

const options = {
  hostname: 'apigw.trendyol.com',
  path: `/integration/webhook/sellers/${SELLER_ID}/webhooks`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64'),
    'Content-Length': payload.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(payload);
req.end();
