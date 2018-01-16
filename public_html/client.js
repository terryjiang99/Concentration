// Tian Qi Jiang 101020433

// global variables to manage tile state and properties 
var user;
var difficulty;
var prevTile;
var prevNum;
var twoFlipped = false;
var pairs = 0;
var guess = 0;

// function: initGame 
// called to initialize new instance of a game
// source: from tutorial 6
function initGame(){
	$.ajax({
		method:"GET",
		url:"/memory/intro",
		data:{'username': user},
		success:displayGame,
		dataType:'json'
	});
}
// user prompt for name
// source: from tutorial 6
$(document).ready(function(){
    user = window.prompt("Enter your name: ");
	initGame();
});

// displayGame: creates gameboard on client side
// source: from tutorial 6
function displayGame(data){
	// set difficulty from server response
	difficulty = data.boardSize;
	// clear gameboard
	$("#gameBoard").empty();
	
	for (var i = 0; i < data.boardSize; i++){
		// create new row every loop
		var row = $("<tr></tr>");
		for (var j = 0; j < data.boardSize; j++){
			// set div for each row and column with boolean true if card is flipped
			var div = $("<div class='tileDown' data-isFlipped='"+false+"' data-row='"+i+"' data-col='"+j+"'></div>");
			div.click(chooseTile);
			row.append(div);
		}
		$("#gameBoard").append(row);
	}
}

// chooseTile: send get request to client for number underneath tile clicked
// source: from tutorial 6
function chooseTile(){
	// selected holds clicked tile properties
	var selected = $(this);
	$.ajax({
		method:"GET",
		url:"/memory/card",
		// data holds number underneath tile from server response
		data:{'username':user, 'row':selected.data('row'), 'col':selected.data('col')},
		// function to access data and call flip function
		success:function clickTile(data){
			flipTile(data, selected);
		},
		dataType:'json'
	});
}

// flipTile: called everytime user clicks on a tile to check and match tiles
function flipTile(data, currTile){
	// if two cards are currently flipped, do nothing
	if(twoFlipped === true){
		return;
	}
	// if no tiles are active and face down, flip tile, 
	else if(prevTile === undefined){
		prevTile = currTile;
		prevNum = data;
		prevTile.data('isFlipped', true);
		prevTile.attr("class", "tileUp");
		prevTile.html("<span>" +data+ "</span>");
	}
	// if card clicked is already flipped, do nothing
	else if(currTile.data('isFlipped') == true){
		return;
	}
	// one card is active and tile clicked is face down,
	else {
		// flip tile and change properties
		currTile.attr("class", "tileUp");
		currTile.html("<span>" +data+ "</span>");
		twoFlipped = true;
		currTile.data('isFlipped', true);
		// if the two tiles match, deactivate both cards and leave face up
		if(prevNum === data){
			prevTile = undefined;
			prevNum = 0;
			pairs++;
			guess++;
			twoFlipped = false;
			// if game is over, alert guesses and start new game
			if(pairs === difficulty*difficulty / 2){
				setTimeout(function(){
					alert(guess+" guesses were made.");
					initGame();
					guess = 0;
					pairs = 0;
				}, 500);
			}
		// if the two tiles do not match, flip both tiles down
		}else{
			// timeout to see cards before flipping down
			setTimeout(function(){
				prevTile.attr("class", "tileDown");
				currTile.attr("class", "tileDown");
				prevTile.data('isFlipped', false);
				currTile.data('isFlipped', false);
				prevTile = undefined;
				prevNum = 0;
				
				guess++;
				twoFlipped = false;
			}, 750);
		}
	}
}
