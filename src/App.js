import React, {
    Component
} from 'react';
import logo from './rezder1.svg';
import './App.css';

import {
    FileSelect
} from './fileselect.js'
import {
    GameSelect
} from './gameselect.js'
import {
    GameViewer
} from './gameviewer.js'
import {
    MoveAnalyzer,
    CalcMoverView
} from './moveanalyzer.js'

import * as dPos from './dpos.js';
import * as dCard from './dcard.js';
class App extends Component {
    constructor(props) {
        super(props)
        this.onDbFileChange = this.onDbFileChange.bind(this)
        this.handleGame = this.handleGame.bind(this)
        this.handlePos = this.handlePos.bind(this)
        this.state = {
            dbFile: null,
            noGames: 0,
            gamePoss: null,
            gamePlayerIDs: null,
            gamePos: null

        }
    }
    handlePos(posix) {
        let pos = this.state.gamePoss[posix];
        if (pos){
            pos=CalcMoverView(pos)
        }
        this.setState({
            gamePos: pos
        })
    }
    handleGame(game) {

        if (game){
            let http = new XMLHttpRequest();
            let url = "games/";
            let params = "file=" + this.state.dbFile+"&player0id="+game.PlayerIDs[0]+"&player1id="+game.PlayerIDs[1]+"&ts="+encodeURIComponent(game.Time);
            http.open("POST", url, true);
            http.setRequestHeader("Content-type",
                                  "application/x-www-form-urlencoded");
            let batt=this
            http.onreadystatechange = function() {
                if (http.readyState === 4 && http.status === 200) {
                    console.log(["handleGame Recieve: ",http.responseText])
                    let gamePoss = JSON.parse(http.responseText);
                    let gamePlayerIDs = game.PlayerIDs;
                    let gamePos = gamePoss[0];
                    batt.setState({
                        gamePoss: gamePoss,
                        gamePlayerIDs: gamePlayerIDs,
                        gamePos: gamePos
                    });
                }
            };
            http.send(params);
            console.log(["handleGame Url: ",url,"Params: ",params])
        }else{
            let state={
                gamePoss: null,
                gamePlayerIDs:null,
                gamePos:null
            }
            this.setState(state)
        }

        //TODO remove test ex. gamePoss

        //let gamePoss = gameViewerTestDataPos();
        //let gamePlayerIDs = game.PlayerIDs;
        //let gamePos = gamePoss[0];
        //if (gamePos){
         //   gamePos=CalcMoverView(gamePos)
        //}
        //this.setState({
         //   gamePoss: gamePoss,
          //  gamePlayerIDs: gamePlayerIDs,
        //    gamePos: gamePos
       // });
       // console.log(['Game changed new', game, gamePos]);
    }
    moveHandler(moveix) {}
    onDbFileChange(file) {
        this.setState({
            dbFile: file
        });
        if (file) {
            let http = new XMLHttpRequest();
            let url = "games/";
            let params = "file=" + file;
            http.open("POST", url, true);
            http.setRequestHeader("Content-type",
                                  "application/x-www-form-urlencoded");
            let batt=this
            http.onreadystatechange = function() {
                if (http.readyState === 4 && http.status === 200) {
                    console.log(["onDbFileChange Recieve: ",http.responseText])
                    let noGames = JSON.parse(http.responseText).NoGames;
                    batt.setState({
                        noGames: noGames
                    });
                }
            }
            http.send(params);
            console.log(["onDbFileChange Url: ",url,"Params: ",params])
            //TODO remove test noGames
            //this.setState({
              //  noGames: 2
            //});
        } else {
            this.setState({
                noGames: 0
            });
        }
    }

    render() {
        console.log(["Render App state game pos: ", this.state.gamePos])
        let cardPos = []
        for (let i = 0; i < 61; i++) {
            cardPos[i] = dPos.card.DeckTroop
        }
        for (let i = 0; i < 10; i++) {
            cardPos[61 + i] = dPos.card.DeckTac
        }
        cardPos[61] = dPos.card.Players[1].Hand
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Battleline Game Viewer</h2>
                </div>
                <FileSelect
                    header="Select Database"
                    value={this.state.dbFile}
                    onFileChange={this.onDbFileChange}
                    isDir={false}
                    suffix=""
                    preFix="/home/rho/"
                />
                <fieldset>
                    <legend>Select Game</legend>
                    <GameSelect
                        dbFile={this.state.dbFile}
                        noGames={this.state.noGames}
                        handleGame={this.handleGame}
                    />
                </fieldset>
                <fieldset id="move-analyzer-id">
                    <legend>Move Analyzer</legend>
                    <MoveAnalyzer playerIDs={this.state.gamePlayerIDs}
                                  gamePos={this.state.gamePos}
                    />
                </fieldset>

                <fieldset id="game-viewer-id">
                    <legend>Game view</legend>
                    <GameViewer
                        poss={this.state.gamePoss}
                        handleRow={this.handlePos}
                        playerIDs={this.state.gamePlayerIDs}
                    />
                </fieldset>
            </div>
        );
    }
}

export default App;



function gameViewerTestDataPos() {
    let poss = [];
    let cardPos = [];
    let hands = [
        [],
        []
    ];
    for (let i = 0; i < 61; i++) {
        cardPos[i] = dPos.card.DeckTroop
    }
    for (let i = 0; i < 10; i++) {
        cardPos[61 + i] = dPos.card.DeckTac
    }
    for (let i = 1; i < 8; i++) {
        cardPos[i] = dPos.card.Players[0].Hand
        hands[0].push(i);
        cardPos[i + 10] = dPos.card.Players[1].Hand
        hands[1].push(i + 10);
    }
    let conePos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let lastMover = 0;
    let lastMoveType = 0;
    let playerReturned = 2;
    let cardsReturned =[0,0];
    let mover = 1;
    let winner= 2;//NONE_Player
    let view=3;//VIEW_God
    let moves = gameViewerTestDataMoveHand(mover, hands[mover]);
    poss.push({
        CardPos: cardPos,
        ConePos: conePos,
        LastMover: lastMover,
        LastMoveType: lastMoveType,
        PlayerReturned: playerReturned,
        CardsReturned:cardsReturned,
        Moves: moves,
        Winner: winner,
        View: view,
    });
    let move = moves[0].Moves[0];
    let newCardPos = []
    for (let i = 0; i < cardPos.length; i++) {
        newCardPos[i] = cardPos[i];
    }
    newCardPos[move.Index] = move.NewPos
    lastMover = mover
    lastMoveType = 3
    moves = gameViewerTestDataMoveDeck(mover)
    poss.push({
        CardPos: newCardPos,
        ConePos: conePos,
        LastMover: lastMover,
        LastMoveType: lastMoveType,
        PlayerReturned: playerReturned,
        CardsReturned:cardsReturned,
        Moves: moves,
        Winner:winner,
        View: view,
    });

    return poss;
}

function gameViewerTestDataMoveDeck(mover) {
    let gameMoves = [];
    gameMoves.push({
        Mover: mover,
        MoveType: 2,
        Moves: [{
            BoardPiece: 0,
            Index: dCard.BACKTroop,
            NewPos: dPos.card.Players[mover].Hand,
            OldPos: dPos.card.DeckTroop
        }]
    });
    gameMoves.push({
        Mover: mover,
        MoveType: 2,
        Moves: [{
            BoardPiece: 0,
            Index: dCard.BACKTac,
            NewPos: dPos.card.Players[mover].Hand,
            OldPos: dPos.card.DeckTac
        }]
    });
    return gameMoves;
}

function gameViewerTestDataMoveHand(player, hand) {
    let gameMoves = [];
    for (let flag = 0; flag < 9; flag++) {
        for (let card of hand) {
            gameMoves.push({
                Mover: player,
                MoveType: 3,
                Moves: [{
                    BoardPiece: 0,
                    Index: card,
                    OldPos: dPos.card.Players[player].Hand,
                    NewPos: dPos.card.Players[player].Flags[
                        flag]
                }]
            });
        }
    }
    return gameMoves;
}
