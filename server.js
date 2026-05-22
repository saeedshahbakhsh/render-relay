const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const BLOCKED_HEADERS = [
  'host', 'connection', 'keep-alive', 'proxy-authenticate',
  'proxy-authorization', 'te', 'trailer', 'transfer-encoding',
  'upgrade', 'forwarded', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port'
];

const server = http.createServer((req, res) => {
  const destHost = req.headers['x-host'];

  if (!destHost) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid Request: Missing target host');
    return;
  }

  BLOCKED_HEADERS.forEach(header => {
    delete req.headers[header];
  });

  const targetUrl = destHost.startsWith('http') ? destHost : `http://${destHost}`;

  proxy.web(req, res, { target: targetUrl }, (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Gateway Error: Connection Failed');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
