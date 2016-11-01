var express = require('express');
var ws      = require('ws');
var http    = require('http');
var path    = require('path');
var theExpressApp      = express();
var theHttpServer      = http.createServer();
var theWebSocketServer = new ws.Server({
                            server: theHttpServer, verifyClient: function() {return players.length < 2}});

// Code to setup the Express app (middleware, routes) can go here.
theExpressApp.use(express.static(path.join(__dirname, 'client-side')));

var players = [];

function sendNotAcceptedMessage(websocket, reason){
  websocket.send(JSON.stringify({messageType: "CHOICE NOT ACCEPTED", reason: reason}));
  websocket.close();
}

function getUserIndex(websocket){
  var player = players.find((player) => player.socket == websocket);
  return players.indexOf(player);
}

function sendWinnerAndLoserMessage(winner, loser){
  var winnerMessage = {messageType: "WIN",
                       ownScore: winner.score + 1,
                       opponentScore: loser.score,
                       opponentName: loser.userName};
  var loserMessage = {messageType: "LOSE",
                      ownScore: loser.score,
                      opponentScore: winner.score + 1,
                      opponentName: winner.userName};
  winner.socket.send(JSON.stringify(winnerMessage));
  loser.socket.send(JSON.stringify(loserMessage));
}

function sendTieMessage(player, opponent){
  player.socket.send(JSON.stringify({messageType: "TIE"}));
  opponent.socket.send(JSON.stringify({messageType: "TIE"}));
}

function determineWinner(choicePlayer, choiceOpponent){
  //            r   p   s
  var table = [[0,  1, -1],  //r
               [-1, 0,  1],  //p
               [1, -1,  0]]; //s
  var choiceToId = {"Rock": 0, "Paper": 1,"Scissors": 2};
  return table[choiceToId[choicePlayer]][choiceToId[choiceOpponent]];
}

function onPlayerLeaves(websocket){
  var playerIndex = getUserIndex(websocket);
  var opponentIndex = playerIndex == 0 ? 1 : 0;
  var opponent = players[opponentIndex];
  opponent.socket.send(JSON.stringify({messageType: "OPPONENT LEFT", opponentName: opponent.userName}));
  players.splice(playerIndex, 1);
}



theWebSocketServer.on('connection', function connection(websocket){
  console.log("CONNECTION TO CLIENT!");
  players.push({socket: websocket, score: 0});

  websocket.on("message", function incoming(message){
    console.log('MESSAGE RECEIVED: ', message);
    var messageObject = JSON.parse(message);
    var userName = messageObject.userName;

    if (messageObject.messageType == "CHOICE"){
      var playerIndex = getUserIndex(websocket);
      var oldPlayerData = players[playerIndex];
      var player = {socket: websocket, userName: userName, choice: messageObject.choice, score: oldPlayerData.score};
      var opponentIndex = playerIndex == 0 ? 1 : 0;
      var opponent = players[opponentIndex];
      players[playerIndex] = player;

      if (opponent) {
        if (opponent.choice) {
          var newPlayerScore = player.score;
          var newOpponentScore = opponent.score;
          switch(determineWinner(messageObject.choice, opponent.choice)) {
            case 1:
              console.log("opponent is the winner");
              sendWinnerAndLoserMessages(opponent, player);
              newOpponentScore = newOpponentScore+1;
              break;
            case -1:
              console.log("player is the winner");
              sendWinnerAndLoserMessages(player, opponent);
              newPlayerScore = newPlayerScore+1;
              break;
            case 0:
              console.log("its a tie");
              sendTieMessage(opponent, player);
              break;
            default:
            console.log("Nobody wins?");
          }
          players[playerIndex] = {socket: websocket, userName: userName, score: newPlayerScore};
          players[opponentIndex] = {socket: opponent.socket, userName: opponent.userName, score: newOpponentScore};
          console.log(players);
        } else {
          websocket.send(JSON.stringify({messageType: "CHOICE ACCEPTED"}));
          opponent.socket.send(JSON.stringify({messageType: "OPPONENT CHOICE", opponentName: userName}));
        }
      }
    } else {
      sendNotAcceptedMessage(websocket, "This messageType is not accepted");
      websocket.close();
    }
  });

  websocket.on('close', function () {
    console.log('CONNECTION CLOSED.');
    onPlayerLeaves(websocket);
  });
});

theHttpServer.on('request', theExpressApp);
theHttpServer.listen( 3000,
                      function() {
                        console.log("The Server is lisening on port 3000.")
                     });
