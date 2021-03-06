import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    BattSvg,
    VIEW_God,
    VIEW_Watch,
    VIEW_Player0,
    VIEW_Player1,
    NONE_Player,
    DefaultViewPos
} from './battsvg.js';
import * as dPos from './dpos.js';
import * as dCard from './dcard.js';

export class GameViewer extends Component {
    constructor(props) {
        super(props);
        this.handleCheckBox = this.handleCheckBox.bind(this);
        this.state = initializeState(props);
    }
    static propTypes = {
        poss: PropTypes.array, //Battleline game positions
        playerIDs: PropTypes.arrayOf(PropTypes.number),
        handleRow: PropTypes.func

    }
    componentWillReceiveProps(nextProps) {
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
            posView =CalcPosView(this.props.poss[this.state.row], this
                .state
                .view);
        } else {
            posView = CalcPosView(DefaultViewPos(), this.state.view);
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
                    lastMoveType={posView.LastMoveType}
                    moves={posView.Moves}
                    winner={posView.Winner}
                    view={posView.View}
                    noPlayerHandTroops={posView.NoTroops}
                    noPlayerHandTacs={posView.NoTacs}
                    scoutReturnPlayer={posView.PlayerReturned}
                    scoutReturnCards={posView.CardsReturned}
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
 * CalcPosView calculate the view of a battleline game position.
 * @param {[pos]} pos: The game position.
 * @param {number} view: The view VIEW_
 * @returns {} The position view.
 * @throws {} Error if view does not exist.
 */
export function CalcPosView(pos, view) {
    let posView = null;
    switch (view) {
        case VIEW_God:
            posView = pos;
            break;
        case VIEW_Watch:
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
    posView.LastMoveIx = pos.LastMoveIx;
    posView.View = VIEW_God;
    posView.NoTroops = pos.NoTroops;
    posView.NoTacs = pos.NoTacs;
    posView.PlayerReturned = pos.PlayerReturned;
    posView.CardsReturned = pos.CardsReturned;
    posView.Winner = pos.Winner;
    posView.Moves = pos.Moves
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
    posView.LastMoveIx = pos.LastMoveIx;
    posView.View = view;
    posView.NoTroops = diff.noTroops;
    posView.NoTacs = diff.noTacs;
    posView.PlayerReturned = pos.PlayerReturned;
    posView.CardsReturned = [diff.firstCard, diff.secondCard];
    posView.Moves = pos.Moves;
    posView.Winner = pos.Winner;
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
        if (pos.CardsReturned[0] === cardix || pos.CardsReturned[1] ===
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
    posView.LastMoveIx = pos.LastMoveIx;
    posView.View = VIEW_Watch;
    posView.NoTroops = noTroops;
    posView.NoTacs = noTacs;
    posView.PlayerReturned = pos.PlayerReturned;
    posView.CardsReturned = [firstCard, secondCard];
    posView.Moves = pos.Moves;
    posView.Winner = pos.Winner;
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
    let firstCard = pos.CardsReturned[0];
    let secondCard = pos.CardsReturned[1];
    let opp = player + 1;
    if (opp > 1) {
        opp = 0;
    }
    for (let cardix = 1; cardix < pos.CardPos.length; cardix++) {
        let isReturned = (pos.CardsReturned[0] === cardix || pos.CardsReturned[1] ===
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
                } else if (pos.CardPos[cardix] !== dPos.card.Players[player].Hand) {
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
