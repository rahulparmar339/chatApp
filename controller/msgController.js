var mongoose = require('mongoose');

var chatSchema=mongoose.Schema({
	  groupName : String,
	  nick: String,
	  msg: String,
	  created : {type: Date, default: Date.now}
	});
var Chat = mongoose.model('Message',chatSchema);
users = {};
// console.log(Chat);

module.exports = function(io){
	//console.log(io);

	return io.sockets.on('connection',function(socket){

		var query=Chat.find({});
		query.sort('-created').limit(8).exec(function(err,docs){
			if(err) throw err;
			// console.log('sending old msgs');
			//socket.emit('load old msgs', docs);
		});
	  
		socket.on('new user',function(data,callback){
			// console.log('in new user');
			if(data.nickname in users){
				callback(false);
			}
			else{
				callback(true);
				socket.groupname=data.groupname;
				socket.nickname=data.nickname;
				users[socket.nickname]= socket.id;
				var newUser= new Chat({groupName: data.groupname ,nick : data.nickname ,msg :"im "+data.nickname});
				newUser.save(function(err){
					if(err) throw err;
					// console.log(data.nickname+" added in "+data.groupname);
					updateNicknames(data.groupname);
				});
				
			}
		});
		function updateNicknames(groupname){
			Chat.find({groupName:groupname},function(err,data){
				// console.log(Object.keys(users));
				var map = {};
				for(var i=0;i<data.length;i++){
					// console.log("dfdsfs dfsssfs sfsfgsf      " +data[i].nick);
					if(data[i].nick in users)
					{
						map[data[i].nick]=1;
					}
				}
				var array=Object.keys(map);
				for(var i=0;i<array.length;i++){
						//console.log(i);
						io.to(users[array[i]]).emit('usernames',array);
					}
				});
			//io.sockets.emit('usernames', Object.keys(users));
		}
		socket.on('send message',function(data,callback){
			// console.log(data);
			var msg = data.trim();
			if(msg.substr(0,3)=='/w '){
				msg = msg.substr(3);
				var ind= msg.indexOf(' ');
				if(ind != -1){
					var name = msg.substr(0,ind);
					var msg=msg.substr(ind+1);
					if(name in users){
						if(name==socket.nickname){
							callback('hey! It\'s you!!! You can\'t whisper to yourself!!!');
						}
						else{
							io.to(users[name]).emit('whisper',{msg : msg , nick : socket.nickname });
							msg=msg+' ( sent to '+name+' )';
							io.to(users[socket.nickname]).emit('mywhisper',{msg : msg  , nick : socket.nickname });
							// console.log('whispers');
						}	
					}
					else{
						callback('Error! Enter a valid username');
					}
					
				}
				else{
					callback('Error! Please enter a message for your whisper');
				}
			}
			else{
				var message=data;
				Chat.find({groupName: socket.groupname},function(err,data){
					var map = {};
					for(var i=0;i<data.length;i++){
						// console.log("dfdsfs dfsssfs sfsfgsf      " +data[i].nick);
						if(data[i].nick in users)
						{
							map[data[i].nick]=1;
						}
					}
					var array=Object.keys(map);
					for(var i=0;i<array.length;i++){
							if(!message)
								break;
							if(array[i].localeCompare(socket.nickname)==0){
								// console.log("ishan's"+i);
								io.to(users[array[i]]).emit('my new message',{msg : message , nick : socket.nickname });
							}
							else{
							io.to(users[array[i]]).emit('new message',{msg : message , nick : socket.nickname });
							}
					}
				});
				//sendnewMsg({msg: data,groupname: socket.groupname});
			}
		});
		function sendnewMsg(data){
			
		}
		socket.on('disconnect',function(data){
			if(!socket.nickname) return;
			delete users[socket.nickname];
			updateNicknames(socket.groupname);
		});
	});
}
