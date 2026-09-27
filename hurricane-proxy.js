// Servidor proxy local pra NOAA Hurricane data
// Roda em http://localhost:3001
// Contorna CORS bloqueado do NOAA

const http = require('http');
const https = require('https');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const target = url.searchParams.get('url');

  if (!target) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Missing url parameter' }));
    return;
  }

  https.get(target, { timeout: 30000 }, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      res.writeHead(200);
      res.end(data);
    });
  }).on('error', (err) => {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  });
});

server.listen(PORT, () => {
  console.log(`🌀 Hurricane proxy rodando em http://localhost:${PORT}`);
  console.log(`GET http://localhost:${PORT}?url=<NOAA_URL>`);
});
