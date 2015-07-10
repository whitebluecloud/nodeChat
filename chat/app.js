
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , request = require('request')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var nicklist = {};
var nickidlist = {};

app
    .get('/', function(req, res){
         res.render('index.ejs');
    })
    .get('/users', user.list)
    .get('/board', function(req, res){
        
    });
app.setMaxListeners(2);
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server);
io.configure(function () {
    io.set('transports', [
                'websocket'
                , 'flashsocket'
                , 'htmlfile'
                , 'xhr-polling'
                , 'jsonp-polling'
    ]);
    io.set("polling duration", 20);
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('log level', 1); 
});
io.setMaxListeners(2);
//Configure socket.io
        io.sockets.on('connection',function(socket){
            socket.on('systemIn',function(data){
                if(data.name)
                {
                    //최초 입장시 아이디/소켓코드 저장
                    nicklist[data.name] = socket.nickname = data.name;
                    nickidlist[data.name] = socket.id;
                    console.log(nicklist);
                    io.sockets.emit('systemIn',data);
                    io.sockets.emit('systemList',nicklist);
                }
            });
            socket.on('message',function(data){
                socket.broadcast.emit('message', data);
                socket.emit('messageMe',data);
        
            //귓속말 처리
        //    io.sockets.sockets[nickidlist[data.name]].emit('message',data);
        //	io.sockets.sockets[nickidlist[data.type]].emit('message',data);
        });
            socket.on('imageWrite',function(data){
                    socket.broadcast.emit('imageWrite', data);
                    socket.emit('imageWriteMe', data);
                console.log(data);
            });
            //퇴장 처리
            socket.on('disconnect',function(){
                if(socket.nickname){
                    socket.broadcast.emit('systemOut',{name:socket.nickname});
                    delete nicklist[socket.nickname];
                    io.sockets.emit('systemList',nicklist);
                }
            });
        });