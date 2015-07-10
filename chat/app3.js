var server = require('http').createServer(function(req,res){
    fs.readFile('index.html',function(error,data){
		res.writeHead(200,{'Content-Type':'text/html'});
		res.end(data);
	});
}).listen(8001,function(){
	console.log('Server Running Start');
});;
var io     = require('socket.io').listen(server);
var nicklist = {};
var nickidlist = {};
io.set('log level',2);
//소켓 서버 이벤트를 연결합니다.
io.sockets.on('connection',function(socket){
	socket.on('systemIn',function(data){
		if(data.name)
		{
			//최초 입장시 아이디/소켓코드 저장
			nicklist[data.name] = socket.nickname = data.name;
			nickidlist[data.name] = socket.id;
			io.sockets.emit('systemIn',data);
			io.sockets.emit('systemList',nicklist);
		}
	});
	socket.on('message',function(data){
		if(data.type == 'poblic')
		{
			io.sockets.emit('message',data);
		}
		else
		{
			//귓속말 처리
			io.sockets.sockets[nickidlist[data.name]].emit('message',data);
			io.sockets.sockets[nickidlist[data.type]].emit('message',data);
		}
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