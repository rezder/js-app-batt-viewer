import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    Shade,
    Spinner,
    Pattern,
    MiddleLine,
} from './compsvg.js';
import {
    Cone,
    Name,
    Deck,
    Player,
    ButtonPanel
} from './battcompsvg.js';
import * as dPos from './dpos.js';
import * as dCard from './dcard.js';
import * as mv from './moves.js';
import * as dMoveType from './dmovetype.js';

export const VIEW_God = 3;
export const VIEW_Watch = 2;
export const VIEW_Player0 = 0;
export const VIEW_Player1 = 1;
export const NONE_Player=2

export class BattSvg extends Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
        this.missHandler = this.missHandler.bind(this);
        this.buttonHandler=this.buttonHandler.bind(this);
        this.state = this.calcInitState(props);
    }
    static defaultProps = {
        cardHeight: 67,
        cardWidth: 50,
        cardStroke: 3,
        groupStroke: 2,
        space: 3,
        groupHStep: 26,
        groupVStep: 20,
        noPlayerHandTroops: [0, 0],
        noPlayerHandTacs: [0, 0],
        scoutReturnPlayer: [NONE_Player],
        scoutReturn1Card: 0,
        scoutReturn2Card: 0,
        winner: NONE_Player
    };
    static propTypes = {
        cardHeight: PropTypes.number.isRequired,
        cardWidth: PropTypes.number.isRequired,
        cardStroke: PropTypes.number.isRequired,
        groupStroke: PropTypes.number.isRequired, // the stroke for the card group frame
        space: PropTypes.number.isRequired, //minimum space between items
        groupHStep: PropTypes.number.isRequired, // Horisontal move of card in group.
        groupVStep: PropTypes.number.isRequired, // Vertival move of card in group.
        cardPos: PropTypes.array.isRequired,
        conePos: PropTypes.array.isRequired,
        lastMover: PropTypes.number.isRequired,
        lastMoveType: PropTypes.number.isRequired,
        moves: PropTypes.array,
        winner: PropTypes.number.isRequired,
        view: PropTypes.number.isRequired, // VIEV_
        isNew: PropTypes.bool.isRequired, // if false it asumes a move have caused the change to positions
        noPlayerHandTroops: PropTypes.array.isRequired,
        noPlayerHandTacs: PropTypes.array.isRequired,
        scoutReturnPlayer: PropTypes.number.isRequired,
        scoutReturn1Card: PropTypes.number.isRequired,
        scoutReturn2Card: PropTypes.number.isRequired,
        names: PropTypes.array.isRequired, // name of players.
        moveHandler: PropTypes.func // This function is called with a move index to make a move.
    }

    clickHandler(p) {
        console.log(p.pointer);
        console.log(pp(p.e, this.svg));//TODO select card, move cone and create card move.
        // create cone move is outside, that is a problem as parent can only listent for change.
        // we a listenter or button inside the svg.//Maybe make all move button inside and
        // only display them when move handler is present. Pass active when move is pressent,
        //Give-Up when mover and have moves and pause always(when handler present).
        //shade disable every thing
    }
    missHandler(e) {
        console.log(pp(e, this.svg));
    }
    buttonHandler(text){
        console.log(text)
        //TODO buttom handler
    }
    /**
     *componentWillReceiveProps updates state when props change.
     * I try not to update objects but replace them when they have
     * change to improve speed, when compare for change.
     * @param {} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.isNew !== this.props.isNew ||
            nextProps.conePos !== this.props.conePos ||
            nextProps.cardPos !== this.props.cardPos
        ){
            let props=this.props;
            let prevState=this.state
            let upd = {};
            if (nextProps.isNew) {
                upd = this.calcInitState(nextProps);
            } else {
                upd.isSending = false;
                upd.handCardPointer = null;
                upd.flagCardPointer = null;
                if (!prevState.conePos.every((v, i) => v ===
                    nextProps.conePos[i])) {
                    upd.conePos = nextProps.conePos;
                } else {
                    let cardDiffs = diffCardPos(props.cardPos,
                                                nextProps.cardPos);
                    if (cardDiffs.length > 0) {
                        upd.markedPointers = [];
                        upd.posCards = [];
                        for (let cards of prevState.posCards) {
                            upd.posCards.push(cards);
                        }
                        for (let diff of cardDiffs) {
                            upd.markedPointers.push(diff.pointer);
                            let addList = upd.posCards[diff.pointer
                                                           .pos];
                            upd.posCards[diff.pointer.pos] =
                                addList.concat(
                                    [diff.pointer.ix]);

                            let removeList = upd.posCards[diff.oldPos];
                            let updList = [];
                            for (let cardix of removeList) {
                                if (cardix !== diff.pointer.ix) {
                                    updList.push(cardix);
                                }
                            }
                            upd.posCards[diff.oldPos] = updList;
                        }
                    }
                }
            }
            this.setState(upd);
        }

    }
    calcInitState(props) {
        let state = {};
        state.markedPointers = null;
        state.handCardPointer = null;
        state.flagCardPointer = null;
        state.conePos = props.conePos;
        let posCards = [];
        for (let i = 0; i < dPos.card.Size; i++) {
            posCards.push([]);
        }
        for (let i = 1; i < props.cardPos.length; i++) {
            posCards[props.cardPos[i]].push(i);
        }
        state.posCards = posCards;
        state.isSending = false;
        return state;
    }
    createDesign() {
        let design = {
            space: this.props.space,
            cardHeight: this.props.cardHeight,
            cardWidth: this.props.cardWidth,
            cardStroke: this.props.cardStroke,
            groupStroke: this.props.groupStroke,
            groupVStep: this.props.groupVStep,
            groupHStep: this.props.groupHStep
        };
        let dSpace = 2 * design.space;
        let cone = design.cardWidth / 2;
        let height = 2 * (3 * design.space + 2 * dSpace + 6 * design.groupStroke +
                          1.5 * cone +
                          3 * design.cardHeight + 4 * design.groupVStep);
        let width = 12 * dSpace + 22 * design.groupStroke + 11 * design.cardWidth;
        design.height = height;
        design.width = width;
        return design;
    }
    render() {
        let design = this.createDesign();
        let view = this.props.view;
        let moves = this.props.moves;
        let winner=this.props.winner;
        let lastMover = this.props.lastMover;
        let lastMoveType=this.props.lastMoveType;
        let names = this.props.names;
        let noPlayerHandTroops = this.props.noPlayerHandTroops;
        let noPlayerHandTacs = this.props.noPlayerHandTacs;

        let handler = null;
        let buttonHandler =null;

        if ((view === VIEW_Player1) || (view === VIEW_Player0)) {
            handler = this.clickHandler;
            buttonHandler= this.buttonHandler
        }

        let mover = mv.mover(moves);

        let isDeckMove = false;
        let isScoutMove = false;
        if ((mover === view) &&
            (handler) &&
            (moves)
        ) {
            isDeckMove = mv.isDeck(moves)
            if (!isDeckMove){
                if ((this.state.handCardPointer) &&
                    this.state.handCardPointer.ix === dCard.TCScout) {
                    let deckMovePos = mv.findOldPosOnSecond(moves, dCard.TCScout)
                    if (deckMovePos.length > 0) {
                        isScoutMove = true;
                    }
                }
            }

        }
        let deckY = design.height / 2 - (design.cardHeight / 2);
        let deckXRight = design.width - 2 * design.space - design.cardWidth;
        let nameX = 20;
        let nameY = 40;
        return (
            <svg version="1.1"
                 id="battlelineSvg"
                 viewBox={[0,0,design.width,design.height]}
                 ref={(svg) => this.svg = svg}
                 onClick={this.missHandler}
            >
                <Pattern />
                <g id ="layer1">
                    <g transform={"translate("+nameX+","+nameY+")"} >
                        {createName(topPlayer(view),moves,lastMover,names)}
                    </g>
                    <g transform={"translate("+nameX+","+(design.height - nameY)+")"} >
                        {createName(opp(topPlayer(view)),moves,lastMover,names)}
                    </g>
                    <MiddleLine height={design.height} width={design.width}/>
                    {conesCreate(this.state.conePos,
                                 mover,
                                 moves,
                                 view,
                                 handler,
                                 design)}
                    <g transform={"translate("+deckXRight+","+deckY+")"}>
                        {createDeck(this.state.posCards,
                                    dPos.card.DeckTac,
                                    this.props.noPlayerHandTacs,
                                    handler,
                                    design,
                                    isScoutMove,
                                    isDeckMove
                        )}
                    </g>
                    <g transform={"translate("+2*design.space+","+deckY+")"}>
                        {createDeck(this.state.posCards,
                                    dPos.card.DeckTroop,
                                    this.props.noPlayerHandTroops,
                                    handler,
                                    design,
                                    isScoutMove,
                                    isDeckMove
                        )}
                    </g>
                    <g transform={"matrix(-1,0,0,-1,"+design.width+","+design.height/2+")"}>
                        {createPlayer(this.state,
                                      moves,
                                      mover,
                                      view,
                                      noPlayerHandTacs,
                                      noPlayerHandTroops,
                                      true,
                                      topPlayer(view),
                                      handler,
                                      design)}
                    </g>
                    <g transform={"translate(0,"+design.height/2+")"}>
                        {createPlayer(this.state,
                                      moves,
                                      mover,
                                      view,
                                      noPlayerHandTacs,
                                      noPlayerHandTroops,
                                      false,
                                      opp(topPlayer(view)),
                                      handler,
                                      design)}
                    </g>
                    {createButtonPanel(buttonHandler,winner,view,lastMoveType,moves,design)}
                    {createSpinner(this.state.isSending,this.state.spinnerX,this.state.spinnerY)}
                    {createShade(winner,lastMoveType,design.height,design.width)}
                </g>
            </svg>
        );
    }
}
function diffCardPos(oldCardPos,newCardPos){
    let diffs=[];
    for (let i=0;i<oldCardPos.length;i++){
        if(oldCardPos[i]!==newCardPos[i]){
            diffs.push({pointer:dPos.Pointer.Card(newCardPos[i],i),
                        oldPos:oldCardPos[i]
            })
        }
    }
    return diffs
}

/**
 * pp return the click point in the view box from
 * a event.
 * @param {event} event
 * @param {svg} svg
 * @returns {point} point
 */
function pp(event, svg) {
    let point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(svg.getScreenCTM()
                                     .inverse());
    return point;
}

function createButtonPanel(handler,winner,view,lastMoveType,moves,design){
    let viewPlayer=NONE_Player
    let isViewPlayer=false
    if (view===VIEW_Player0||view===VIEW_Player1){
        isViewPlayer=true
        viewPlayer=view
    }

    let handy = design.height / 2 - 2 * design.space - 2 * design.groupStroke -
                design.cardHeight;
    let y=handy + design.height/2
    let handx = (design.width - 8 * design.groupHStep - 2 * design.groupStroke -
                 design.cardWidth) / 2;
    let handWidth = design.cardWidth + (design.groupStroke * 2) + (
        8 * design.groupHStep);
    let x=handx + handWidth + design.space*2
    return (
        <g transform={"translate("+x+","+y+")"}>
            <ButtonPanel
                handler={handler}
                isWinner={winner!==NONE_Player}
                isGiveUp={lastMoveType===dMoveType.GiveUp}
                isViewPlayer={isViewPlayer}
                viewPlayer={viewPlayer}
                moves={moves}
            />
        </g>
    )
}

function createDeck(posCards, pos,noHiddens, svgHandler, design, isScoutMove, isDeckMove) {
    let deck = posCards[pos];
    let handler = null;
    if (isScoutMove || (isDeckMove && deck.length > 0)) {
        handler = svgHandler;
    }
    return (
        <Deck pos={pos}
              deck={deck}
              noHidden={noHiddens[0] + noHiddens[1]}
              handler={handler}
              height={design.cardHeight}
              width={design.cardWidth}
              stroke={design.cardStroke}
        />
    );
}

class PlayerCards {
    constructor() {
        this.Hand = [];
        this.Dish = [];
        this.Flags = [];
        for (let i = 0; i < 9; i++) {
            this.Flags[i] = [];
        }
    }
}

function createPlayer(state, moves, mover, view, noPlayerHandTacs,
                      noPlayerHandTroops, isReverse, player, svgHandler, design) {
    let handPointer = state.handCardPointer;
    let flagPointer = state.flagCardPointer;
    let handler = svgHandler;
    let isMover = mover === player;
    let posCards = state.posCards;
    let isOpp = (!isMover && ((view === VIEW_Player0) || (view === VIEW_Player1)));

    let playerCards = new PlayerCards();
    playerCards.Hand = posCards[dPos.card.Players[player].Hand];
    playerCards.Dish = posCards[dPos.card.Players[player].Dish];
    for (let i = 0; i < dPos.card.Players[player].Flags.length; i++) {
        playerCards.Flags[i] = posCards[dPos.card.Players[player].Flags[i]];
    }

    if (isReverse &&
        isOpp &&
        (handler) &&
        (state.handCardPointer) &&
        ((handPointer.ix === dCard.TCTraitor) ||
         (handPointer.ix === dCard.TCDeserter))
    ) {
        handPointer = null;
        flagPointer = null;
        handler = null;
        moves = null;
    }
    let markedPointers = null;
    if (state.markedPointers) {
        if (dPos.player(state.markedPointers[0].pos) === player) {
            markedPointers = state.markedPointers;
        }
    }
    return (
        <Player player={player}
                markedPointers={markedPointers}
                playerCards={playerCards}
                handler={handler}
                isReverse={isReverse}
                isMover={isMover}
                moves={moves}
                handCardPointer={handPointer}
                flagCardPointer={flagPointer}
                design={design}
                isOpp={isOpp}
                noHandTroops={noPlayerHandTroops[player]}
                noHandTacs={noPlayerHandTacs[player]}
        />
    );
}

function createName(player, moves, lastMover, names) {
    let mover = lastMover;
    if (moves) {
        mover = mv.mover(moves);
    }
    return (
        <Name name={names[player]}
              isMover={mover===player}
        />
    );
}

function conesCreate(conePos, mover, moves, view, svgHandler, design) {
    let size = design.cardWidth / 2;
    let diff = 3 * design.space + 4 * design.groupStroke + 2 * design.cardHeight +
               4 * design.groupVStep + size;
    let poss = conePos;
    let moveables = [false, false, false, false, false, false, false, false,
                     false,
                     false
    ];
    let handler = null;
    if ((handler) &&
        (moves) &&
        (mover === view) &&
        (mv.isCone(moves))
    ) {
        handler = svgHandler;
        let legalMove = moves[moves.length - 1];
        for (let i; i < legalMove.BoardMoves; i++) {
            let move = legalMove.BoardMoves[i];
            moveables[move.Index] = true;
        }
    }
    let cones = [];
    let start = 4 * design.space + 2 * design.groupStroke + design.cardWidth +
                design.groupStroke + design.cardWidth / 2;
    let step = 2 * design.groupStroke + design.cardWidth + 2 * design.space;

    for (let i = 0; i < 9; i++) {
        let ix = i + 1;
        cones.push(
            <Cone x={step*i+start}
                  key={ix}
                  pos={poss[ix]}
                  isMoveable={moveables[ix]}
                  ix={ix}
                  handler={handler}
                  height={design.height}
                  diff={diff}
                  size={size}
                  topPlayer={topPlayer(view)}
            />
        );
    }
    return cones;
}

function createSpinner(isSending, spinnerX, spinnerY) {
    return (
        <Spinner x={spinnerX}
                 y={spinnerY}
                 on={isSending}
        />
    );
}

function createShade(winner,lastMoveType, height, width) {
    let on = (winner!==NONE_Player)|| lastMoveType===dMoveType.GiveUp
    console.log(["Sade on: ",on,"LastMoveType",lastMoveType])
    return (
        <Shade
            height={height}
            width={width}
            on={on}
        />
    );
}
function topPlayer(view){
    if (view===VIEW_Player1){
        return 0
    }
    return 1
}
function opp(player){
    let opp = player + 1;
    if (opp > 1) {
        opp = 0;
    }
    return opp
}
