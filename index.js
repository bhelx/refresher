var http    = require('http'),
    io      = require('socket.io'),
    fs      = require('fs'),
    nstatic = require('node-static');

var Refresher = function (config) {

  this.config = config;
  var file = new(nstatic.Server)(config.root);

  this.server = http.createServer(function (req, res) {
    req.addListener('end', function () {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile(__dirname + '/public' + '/index.html', function (err, data) {
          res.end(data, 'utf8');
        });
      } else {
        file.serve(req, res);
      }
    });
  });

};

Refresher.prototype.listen = function () {

  this.server.listen(this.config.port, null);
  console.log('Server Running :)');

  io = io.listen(this.server);

  io.sockets.on('connection', function (client) {
    console.log('Web Socket connected');
  });

  var index = this.config.root + '/index.html';
  fs.watchFile(index, function (curr, prev) {
    if (curr.mtime > prev.mtime) {
      io.sockets.emit('reload', { reload: true });
      console.log(curr);
    }
  });

  io.configure(function () {
    io.disable('log');
  });

};

module.exports = Refresher;
