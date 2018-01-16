// Tian Qi Jiang 101020433

// load necessary modules
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
var board = require('./makeBoard');
var user = {};

var level = 4;
const ROOT = "./public_html"
// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');

function handleRequest(req, res){

    //process the request
	console.log(req.method+" request for: "+req.url);

    //parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;

    if (urlObj.pathname==="/memory/intro"){
		// increase level by 2 if user has won game 
		if (urlObj.query.username in user){
			level += 2;
			var game = {gameBoard: board.makeBoard(level)}
			game.difficulty = level;
		}else{
			// create gameboard of size 4 
        	var game = {gameBoard: board.makeBoard(4)};
	   		game.difficulty = 4;
		}
        user[urlObj.query.username] = game;
		console.log(user[urlObj.query.username]);
		// respond with difficulty to use in forloops for displaying game
        respond(200, JSON.stringify({boardSize: game.difficulty}));

    }else if(urlObj.pathname==="/memory/card"){
		// create instance of card clicked by user
		var card = user[urlObj.query.username];
		// get number based on row and column indexes from client
		var num = card.gameBoard[urlObj.query.row][urlObj.query.col];
		user[urlObj.query.username] = card;
		// respond with number at tile clicked
		respond(200, JSON.stringify(num));

    }else{
        fs.stat(filename,function(err, stats){
			if(err){   //try and open the file and handle the error, handle the error
				respondErr(err);
			}else{
				if(stats.isDirectory())	filename+="/index.html";
		
				fs.readFile(filename,"utf8",function(err, data){
					if(err)respondErr(err);
					else respond(200,data);
				});
			}
		});	
    }
    //locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
}//end handle request