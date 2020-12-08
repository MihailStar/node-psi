/* eslint-disable no-console */
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const os = require('os');
const EventEmitter = require('events');
const http = require('http');

// path
console.info(chalk.blueBright('__filename:'), __filename);
console.info(
  chalk.blueBright('path.dirname(__filename):'),
  path.dirname(__filename)
);
console.info(
  chalk.blueBright('path.basename(__filename):'),
  path.basename(__filename)
);
console.info(
  chalk.blueBright('path.extname(__filename):'),
  path.extname(__filename)
);
console.info(
  chalk.blueBright('path.parse(__filename):'),
  path.parse(__filename)
);
console.info(chalk.blueBright('__dirname:'), __dirname);
console.info(
  chalk.blueBright('path.join(__dirname, "index.js"):'),
  path.join(__dirname, 'index.js')
);

// fs
const pathway = path.join(__dirname, 'test.txt');
fs.writeFile(pathway, 'fs.writeFile\n', (writeError) => {
  if (writeError) throw writeError;

  fs.appendFile(pathway, 'fs.appendFile', (appendError) => {
    if (appendError) throw appendError;
  });

  fs.readFile(pathway, 'utf-8', (readError, content) => {
    if (readError) throw readError;

    console.info(chalk.blueBright('fs.readFile():'), content);
  });
});

// os
console.info(chalk.blueBright('os.platform():'), os.platform());
console.info(chalk.blueBright('os.arch():'), os.arch());
console.info(chalk.blueBright('os.cpus():'), os.cpus());
console.info(chalk.blueBright('os.freemem():'), os.freemem());
console.info(chalk.blueBright('os.totalmem():'), os.totalmem());
console.info(chalk.blueBright('os.homedir():'), os.homedir());
console.info(chalk.blueBright('os.uptime():'), os.uptime());

// events
const emitter = new EventEmitter();

emitter.on('event:anything', (data) => {
  console.info(chalk.blueBright('event:anything:'), data);
});

emitter.emit('event:anything', { a: 1 });
emitter.emit('event:anything', { b: 2 });

setTimeout(() => {
  emitter.emit('event:anything', { c: 3 });
}, 500);

// http
const PORT = Number.parseInt(process.env.PORT, 10) || 80;

/** @enum {number} */
const HTTP_STATUS_CODE = {
  InternalServerError: 500,
  NotFound: 404,
  OK: 200,
};

const extensionToContentType = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

const urlAliases = {
  '/': '/index.html',
  '/api': '/api.json',
};

function requestHandler(req, res) {
  const url = urlAliases[req.url] || req.url;
  const filePath = path.join(__dirname, 'public', url);
  const contentType = extensionToContentType[path.extname(filePath)] || '';

  fs.readFile(filePath, (readError, content) => {
    if (readError) {
      fs.readFile(
        path.join(__dirname, 'public', 'not-found.html'),
        (error, data) => {
          if (error) {
            res.writeHead(HTTP_STATUS_CODE.InternalServerError);
            res.end('Internal Server Error');
          } else {
            res.writeHead(HTTP_STATUS_CODE.NotFound, {
              'Content-Type': extensionToContentType['.html'],
            });
            res.end(data);
          }
        }
      );
    } else {
      res.writeHead(HTTP_STATUS_CODE.OK, {
        'Content-Type': contentType,
      });
      res.end(content);
    }
  });
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.info(chalk.greenBright(`server started on port ${PORT}...`));
});
