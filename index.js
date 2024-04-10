const http = require('http');
const url = require('url');
const { Worker } = require('worker_threads');

var worker = null;
function startWorker(){
  if(worker == null){
    worker = new Worker('./service.js');
    worker.on('exit', (code) => {
      console.log(`${new Date().toISOString()}: The worker ends with code ${code}`);
      worker = null;
      setTimeout(()=>{
        startWorker();
      }, 5000);
    });
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method.toLowerCase();
  const host = req.headers.host;
  process.env.URL = host;

  if (path === '/' && method === 'get') {
    if (worker === null) {
      startWorker();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Ok' }));
  }
  else if (path === '/get-host' && method === 'get') {
    if (worker === null) {
      startWorker();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Ok' }));
  }
  else if (path === '/post-message' && method === 'post') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (worker !== null) {
        worker.postMessage(body);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Ok' }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});