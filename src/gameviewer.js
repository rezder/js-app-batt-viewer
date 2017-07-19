import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    BattSvg,
    VIEW_God,
    VIEW_Watch,
    VIEW_Player0,
    VIEW_Player1
} from './battsvg.js';
import * as dPos from './dpos.js';
import * as dCard from './dcard.js';

export class GameViewer extends Component {
    constructor(props) {
        super(props);
        this.handleCheckBox = this.handleCheckBox.bind(this);
        this.state = initializeState(props);
    }
    static propTypes={
        poss: PropTypes.array,//Battleline game positions
        playerIDs: PropTypes.arrayOf(PropTypes.number),
        handleRow: PropTypes.func

    }
    componentWillReceiveProps(nextProps, undef) {
        if (nextProps.poss !== this.props.poss) {
            let initState = initializeState(nextProps);
            delete initState.view;
            this.setState(initState);
        }
    }
    handleCheckBox(view) {
        this.setState({
            view: view,
            isNew: true
        });
    }
    handleRow(isAdd) {
        let poss = this.props.poss;
        let row = this.state.row;
        if (isAdd) {
            row = row + 1;
        } else {
            row = row - 1;
        }
        let updIsAdd = true;
        let updIsSub = true;
        if (row === 0) {
            updIsSub = false;
        }
        if (row === poss.length - 1) {
            updIsAdd = false;
        }
        console.log(["Setting new row on gameViewer:", row]);
        this.setState({
            row: row,
            isAdd: updIsAdd,
            isSub: updIsSub,
            isNew: false
        });
        if (this.props.handleRow) {
            this.props.handleRow(row);
        }
    }
    createCheckBox(text, view) {
        text = text + ":";
        return (
            <label>
                {text}
                <input
                    type="checkbox"
                    checked={this.state.view===view}
                    onChange={(event)=>this.handleCheckBox(view)}
                />
            </label>
        );
    }
    createPlayerCheckBox(player) {
        if (this.props.playerIDs) {
            return this.createCheckBox(this.props.playerIDs[player],
                                       player);
        } else {
            return this.createCheckBox(player, player);
        }
    }
    render() {
        let posView = null;
        if (this.props.poss) {
            posView = calcPosView(this.props.poss[this.state.row], this
                .state
                .view);
        } else {
            posView = calcPosView(defaultPos(), this.state.view);
        }
        let names = ["0", "1"];
        if (this.props.playerIDs) {
            names[0] = this.props.playerIDs[0].toString();
            names[1] = this.props.playerIDs[1].toString();
        }
        return (
            <div className="game-viewer">
                <BattSvg
                    cardPos={posView.CardPos}
                    conePos={posView.ConePos}
                    lastMover={posView.LastMover}
                    moves={posView.Moves}
                    view={posView.View}
                    noPlayerHandTroops={posView.NoTroops}
                    noPlayerHandTacs={posView.NoTacs}
                    scoutReturnPlayer={posView.PlayerReturned}
                    scoutReturn1Card={posView.FirstCardReturned}
                    scoutReturn2Card={posView.SecondCardReturned}
                    names={names}
                    isNew={this.state.isNew}
                />

                <div>
                    <div>
                        <button type="button"
                                disabled={!this.state.isSub}
                                onClick={(event)=>this.handleRow(false)}
                        >&#60;</button>
                        <text>{this.state.row}</text>
                        <button type="button"
                                disabled={!this.state.isAdd}
                                onClick={(event)=>this.handleRow(true)}
                        >&#62;</button>
                    </div>
                    <fieldset>
                        <legend >View</legend>
                        {this.createCheckBox("God",VIEW_God)}
                        {this.createCheckBox("Watch",VIEW_Watch)}
                        {this.createPlayerCheckBox(0)}
                        {this.createPlayerCheckBox(1)}
                    </fieldset>
                </div>
            </div>
        );
    }
}

/**
 * calcPosView calculate the view of a battleline game position.
 * @param {[pos]} pos: The game position.
 * @param {number} view: The view VIEW_
 * @returns {} The position view.
 * @throws {} Error if view does not exist.
 */
function calcPosView(pos, view) {
    let posView = null;
    switch (view) {
        case VIEW_God:
            posView = calcPosView_God(pos);
            break;
        case VIEW_Watch: //TODO
            posView = calcPosView_Watch(pos);
            break;
        case VIEW_Player0:
            posView = calcPosView_Player(pos, view);
            break;
        case VIEW_Player1:
            posView = calcPosView_Player(pos, view);
            break;
        default:
            throw new Error("View does not exist");
    }
    return posView;
}

/**
 * calcPosView_God calculate the god view.
 * @param {} pos: The game position.
 * @returns {} The postion view.
 */
function calcPosView_God(pos) {
    let posView = {};
    posView.CardPos = pos.CardPos;
    posView.ConePos = pos.ConePos;
    posView.LastMover = pos.LastMover;
    posView.LastMoveType = pos.LastMoveType;
    posView.View = VIEW_God;
    posView.NoTroops = [0, 0];
    posView.NoTacs = [0, 0];
    posView.PlayerReturned = pos.PlayerReturned;
    posView.FirstCardReturned = pos.FirstCardReturned;
    posView.SecondCardReturned = pos.SecondCardReturned;
    return posView;
}

/**
 * calcPosView_Player calculate a player view.
 * @param {gamePos} pos: The position.
 * @param {number} view: The player view VIEW_Player0-1.
 * @returns {posView} The position view.
 */
function calcPosView_Player(pos, view) {
    let posView = {};
    let diff = calcPosViewPlayer(pos, view);
    posView.CardPos = diff.cardPos;
    posView.ConePos = pos.ConePos;
    posView.LastMover = pos.LastMover;
    posView.LastMoveType = pos.LastMoveType;
    posView.View = view;
    posView.NoTroops = diff.noTroops;
    posView.NoTacs = diff.noTacs;
    posView.PlayerReturned = pos.PlayerReturned;
    posView.FirstCardReturned = diff.firstCard;
    posView.SecondCardReturned = diff.secondCard;
    posView.Moves = pos.Moves;
    return posView;
}

/**
 * calcPosView_Watch calculates the watcher view.
 * @param {pos} pos The game position.
 * @returns {} The position view.
 */
function calcPosView_Watch(pos) {
    let posView = {};
    let cardPos = [0];
    let noTroops = [0, 0];
    let noTacs = [0, 0];
    let firstCard = 0;
    let secondCard = 0;
    for (let cardix = 1; cardix < pos.CardPos.length; cardix++) {
        let playerHand = -1;
        if (pos.CardPos[cardix] === dPos.card.Players[0].Hand) {
            playerHand = 0;
        } else if (pos.CardPos[cardix] === dPos.card.Players[1].Hand) {
            playerHand = 1;
        }
        if (playerHand !== -1) {
            if (dCard.isTroop(cardix)) {
                noTroops[playerHand] = noTroops[playerHand] + 1;
                cardPos[cardix] = dPos.card.DeckTroop;
            } else {
                noTacs[playerHand] = noTacs[playerHand] + 1;
                cardPos[cardix] = dPos.card.DeckTac;
            }
        } else {
            cardPos[cardix] = pos.CardPos[cardix];
        }
        if (pos.FirstCardReturned === cardix || pos.SecondCardReturned ===
            cardix) {
            if (pos.CardPos[cardix] === dPos.card.DeckTroop) {
                if (firstCard === cardix) {
                    firstCard = dCard.BACKTroop;
                } else {
                    secondCard = dCard.BACKTroop;
                }
            } else if (pos.CardPos[cardix] === dPos.card.DeckTac) {
                if (firstCard === cardix) {
                    firstCard = dCard.BACKTac;
                } else {
                    secondCard = dCard.BACKTac;
                }
            } else {
                if (firstCard === cardix) {
                    firstCard = 0;
                } else {
                    secondCard = 0;
                }
            }
        }
    }
    posView.CardPos = cardPos;
    posView.ConePos = pos.ConePos;
    posView.LastMover = pos.LastMover;
    posView.LastMoveType = pos.LastMoveType;
    posView.View = VIEW_Watch;
    posView.NoTroops = noTroops;
    posView.NoTacs = noTacs;
    posView.PlayerReturned = pos.PlayerReturned;
    posView.FirstCardReturned = firstCard;
    posView.SecondCardReturned = secondCard;
    posView.Moves = pos.Moves;
    return posView;

}

/**
 * calcPosViewPlayer calculates the changed fields
 * of a player postion view.
 * @param {pos} pos. The battleline postion.
 * @param {number} player: The player index.
 * @returns {posView} The postion view.
 */
function calcPosViewPlayer(pos, player) {
    let cardPos = [0];
    let noTroops = [0, 0];
    let noTacs = [0, 0];
    let firstCard = pos.FirstCardReturned;
    let secondCard = pos.SecondCardReturned;
    let opp = player + 1;
    if (opp > 1) {
        opp = 0;
    }
    for (let cardix = 1; cardix < pos.CardPos.length; cardix++) {
        let isReturned = (pos.FirstCardReturned === cardix || pos.SecondCardReturned ===
                          cardix);
        if (pos.CardPos[cardix] === dPos.card.Players[opp].Hand) {
            if (!isReturned || (isReturned && pos.PlayerReturned === opp)) {
                if (dCard.isTroop(cardix)) {
                    noTroops[opp] = noTroops[opp] + 1;
                    cardPos[cardix] = dPos.card.DeckTroop;
                } else {
                    noTacs[opp] = noTacs[opp] + 1;
                    cardPos[cardix] = dPos.card.DeckTac;
                }
            } else {
                cardPos[cardix] = pos.CardPos[cardix];
            }
            if (isReturned && pos.PlayerReturned === opp) {
                if (firstCard === cardix) {
                    firstCard = 0;
                } else {
                    secondCard = 0;
                }
            }
        } else {
            cardPos[cardix] = pos.CardPos[cardix];
            if (isReturned && pos.PlayerReturned === opp) {
                if (pos.CardPos[cardix] === dPos.card.DeckTroop) {
                    if (firstCard === cardix) {
                        firstCard = dCard.BACKTroop;
                    } else {
                        secondCard = dCard.BACKTroop;
                    }

                } else if (pos.CardPos[cardix] === dPos.card.DeckTac) {
                    if (firstCard === cardix) {
                        firstCard = dCard.BACKTac;
                    } else {
                        secondCard = dCard.BACKTac;
                    }
                } else if (pos.CardPos[cardix] !== dPos.card.Player[player].Hand) {
                    if (firstCard === cardix) {
                        firstCard = 0;
                    } else {
                        secondCard = 0;
                    }
                }
            }
        }
    }

    return {
        cardPos: cardPos,
        noTroops: noTroops,
        noTacs: noTacs,
        firstCard: firstCard,
        secondCard: secondCard
    };
}
/**
 * initializeState return the init state.
 * @param {[]} props The properties.
 * @returns {state} Return the state.
 */
function initializeState(props) {
    let isAdd = false;
    if ((props.poss) && props.poss.length > 0) {
        isAdd = true;
    }
    let state = {
        row: 0,
        isAdd: isAdd,
        isSub: false,
        view: VIEW_God,
        isNew: true
    };
    return state;
}
/**
 * defaultPos setup the default game position,
 * to display something nice when no game have been
 * selected.
 * @returns {pos} The game postion.
 */
function defaultPos() {
    let cardPos = [];
    for (let i = 0; i < 61; i++) {
        cardPos[i] = dPos.card.DeckTroop;
    }
    for (let i = 0; i < 10; i++) {
        cardPos[61 + i] = dPos.card.DeckTac;
    }
    let conePos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let lastMover = 0;
    let lastMoveType = 0;
    let moves = null;
    return {
        CardPos: cardPos,
        ConePos: conePos,
        LastMover: lastMover,
        LastMoveType: lastMoveType,
        PlayerReturned: 2,
        FirstCardReturned: 0,
        SecondCardReturned: 0,
        Moves: moves
    };
}
