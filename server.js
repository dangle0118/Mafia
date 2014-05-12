var express = require('express'),
  routes = require('./routes'),
  mongoose = require('mongoose'),
  http = require('http'),
  path = require('path'),
  methodOverride = require('method-override');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

mongoose.connect('mongodb://localhost/Mafia');


app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + 'views');
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.get('*', routes.index);

require('./app/socket')(io, mongoose);

server.listen(app.get('port'), function () {
  console.log('Express server listenning on port ' + app.get('port'));
});

exports.io = io;