module.exports = function(io, mongoose) {
  var User = mongoose.model('user', {
  	userName: String
  });
  var Game = mongoose.model('game', {
  	roomName: String, 
  	gameCap: Number,
  	currentPlayers: Array,
  	gameRoles: Array
  });
  
  io.sockets.on('connection', onConnection);

  function onConnection(client) {
    console.log('new client connected: ' + client.id);

    client.on('new player', onNewPlayer);
    client.on('create game', onCreateGame);


    function onNewPlayer(data) {
      User.find({'userName': data.userName}, function (err, user) {
      	if (user.length !== 0 ) {
					  client.emit('new player', {status: 'error', msg: 'username existed'});      
      	} else {
      		User.create({
      			userName: data.userName
      		}, function (err, user) {
      				if (err) {
      					client.emit('new player', { status: 'error', msg: 'cannot create'});
      				} else {
      					client.emit('new player', {status: 'success', username: user.userName, id: user._id});      
      				}
      			})
      	}
      });
    }
	
		function onCreateGame(data) {
			console.log('new game:' + client.id);
			roomID = roomID + 1;
			client.emit('create game', {status: 'success', roomName: data.roomName,
																		gameID: roomID, gameCap: data.gameCap,
																		currentPlayers: [client.id], 
																		gameRoles: data.gameChar });		
		}    




  }


}