//Requerimos el modelo creado, el paquete de nuestra BD
var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets;

//Conectamos a mongoDB (chat)
mongo.connect('mongodb://127.0.0.1/chat', function(err, db){
	if(err) throw err;
	
	//Conectamos con la BD. Para inputs y mensajes
	client.on('connection', function(socket){
		
		//Coleccion de la BD, de mensajes
		var col = db.collection('messages'),
			sendStatus = function(s){
				socket.emit('status', s);		
			};
		
		//Emitir los mensajes
		col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
			if(err) throw err;
			socket.emit('output', res);
		});
		
		//Esperar a los input, lo que escribimos
		socket.on('input', function(data){
			var name= data.name,
				message= data.message,
				whitespacePattern= /^\$/;
			
			//Caracteres especiales
			if(whitespacePattern.test(name) || whitespacePattern.test(message)){
				sendStatus('Debes escribir un nombre y un mensaje para chatear');
			} else {
				//metemos a la coleccion de la BD
				col.insert({name: name, message: message}, function(){
					
					//Emitir mensajes a los clientes
					client.emit('output', [data]);
					
					sendStatus({
						message: "Mensaje enviado",
						clear: true
					});
				});				
			}
		});
	});
});