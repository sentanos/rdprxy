const proxy = require('http-proxy');
const https = require('https');
const http = require('http');
const { URL } = require('url');

if (!process.env.ACCESS_KEY || !process.env.ALLOWED_HOSTS) {
  throw new Error('Configuration error! Make sure ACCESS_KEY and ALLOWED_HOSTS are both defined in your process environment.');
}

const getHosts = (hosts) => {
  let parsed = [];
  hosts = hosts.split(',');
  for (let i = 0; i < hosts.length; i++) {
    const iHost = hosts[i];
    const split = iHost.split(':');
    if (split.length !== 2) {
      throw new Error(`Configuration error! Invalid protocol:host pair on item ${iHost}`);
    }
    const proto = split[0];
    if (proto !== 'http' && proto !== 'https') {
      throw new Error(`Configuration error! Invalid protocol ${proto}. Only these protocols are allowed: http, https`);
    }
    const host = split[1];
    try {
      (() => new URL(`${proto}://${host}`))();
    } catch (e) {
      throw new Error(`Configuration error! Invalid host domain on item ${iHost}`);
    }
    parsed.push({
      proto: proto,
      host: host
    });
  }
  return parsed;
};

const PORT = process.env.PORT || 80;
const ACCESS_KEY = process.env.ACCESS_KEY;
const ALLOWED_HOSTS = getHosts(process.env.ALLOWED_HOSTS);

const server = http.createServer();

const httpsProxy = proxy.createProxyServer({
  agent: new https.Agent({
    checkServerIdentity: (host, cert) => {
      return undefined;
    }
  }),
  changeOrigin: true
});

const httpProxy = proxy.createProxyServer({
  changeOrigin: true
});

const onProxyError = (err, req, res) => {
  console.error(err);

  res.writeHead(500, {'Content-Type': 'text/plain'});

  res.end('Proxying failed.');
};

const onProxyReq = (proxyReq, req, res, options) => {
  proxyReq.setHeader('User-Agent', 'Mozilla');
  proxyReq.removeHeader('roblox-id');
  proxyReq.removeHeader('proxy-access-key');
  proxyReq.removeHeader('proxy-target');
};

httpsProxy.on('error', onProxyError);
httpsProxy.on('proxyReq', onProxyReq);
httpProxy.on('error', onProxyError);
httpProxy.on('proxyReq', onProxyReq);

const doProxy = (target, proto, req, res) => {
  var options = {
    target: proto + '://' + target.host
  };
  if (proto === 'https') {
    httpsProxy.web(req, res, options);
  } else if (proto === 'http') {
    httpProxy.web(req, res, options);
  } else {
    throw new Error(`Do proxy error: Invalid protocol ${proto}`);
  }
};

server.on('request', (req, res) => {
  if (req.headers['proxy-access-key'] && req.headers['proxy-target']) {
    req.on('error', (err) => {
      console.error(`Request error: ${err}`);
    });
    if (req.headers['proxy-access-key'] === ACCESS_KEY) {
      const requestedTarget = req.headers['proxy-target'];
      if (requestedTarget) {
        let parsedTarget;
        try {
          parsedTarget = new URL(`https://${requestedTarget}`);
        } catch (e) {
          res.writeHead(400, {'Content-Type': 'text/plain'});
          res.end('Invalid target');
          return;
        }
        const requestedHost = parsedTarget.host;
        for (let i = 0; i < ALLOWED_HOSTS.length; i++) {
          const iHost = ALLOWED_HOSTS[i];
          if (requestedHost === iHost.host) {
            doProxy(parsedTarget, iHost.proto, req, res);
            return;
          }
        }
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Host not whitelisted');
      } else {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Target is required');
      }
    } else {
      res.writeHead(403, {'Content-Type': 'text/plain'});
      res.end('Invalid access key');
    }
  } else {
    res.writeHead(400, {'Content-Type': 'text/plain'});
    res.end('proxy-access-key and proxy-target headers are both required');
  }
});

server.listen(PORT, (err) => {
  if (err) {
    console.error(`Server listening error: ${err}`);
    return;
  }
  console.log(`Server started on port ${PORT}`);
});
