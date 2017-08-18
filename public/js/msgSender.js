
var socket=io.connect();
var $nickForm = $('#setNick');
var $nickError = $('#nickError');
var $nickBox =  $('#nickname');
var $users = $('#users');
var $messageForm= $('#send-message');
var $messageBox= $('#message');
var $chat = $('#chat');
var $groupName = $('#groupName').html();
$nickError.hide();

$nickForm.submit(function(e){
	e.preventDefault();
	socket.emit('new user', {groupname: $groupName, nickname: $nickBox.val()},function(data){
			if(data){
				$('#nickWrap').hide();
				$('#contentWrap').show();
			}
			else{
				$nickError.show();
				$nickError.html('<p class="alert alert-danger"> That username is already taken!! Try another one </p>');
			}
		});
		$nickBox.val('');
});
socket.on('usernames',function(data){
	// console.log($groupName+" "+data);
	var html = '';
	for(var i=0;i<data.length;i++){
		html += '<p id="user_name">'+data[i]+ '<span id="green_dot">  &#9673; </span></p>';
	}
	$users.html(html);
});

$messageForm.submit(function(e){
	// console.log('hello');
	e.preventDefault();

	socket.emit('send message',$messageBox.val(),function(data){
		$chat.append('<span class="error">'+ data  + "</span><br/>");
	});
	$messageBox.val('');
});

socket.on('load old msgs',function(docs){
	for(var i=docs.length-1 ;i>=0;i--){
		displayMsg(docs[i]);
	}
});

socket.on('new message',function(data){
	// console.log(data);
	displayMsg(data);
});

socket.on('mywhisper',function(data){
	// console.log(data);
	displaymywMsg(data);
});

socket.on('my new message',function(data){
	// console.log(data);
	displaymyMsg(data);
});


function displayMsg(data){
	var temp='<b>'+ data.nick +': </b>' +data.msg ;
	$chat.append('<span class="msg">' +temp+ "</span><br/>");
}

function displaymyMsg(data){
	$chat.append('<span class="mymsg">' + '&#8688 ' +data.msg+ "</span><br/>");
}

function displaymywMsg(data){
	$chat.append('<span class="mywmsg">' + '&#8688 ' +data.msg+ "</span><br/>");
}
socket.on('whisper',function(data){
	$chat.append('<span class="whisper"><b>'+ data.nick +': </b>' +data.msg + "</span><br/>");
});