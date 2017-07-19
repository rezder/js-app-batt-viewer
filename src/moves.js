import * as dPos from './dpos.js';
export const PT_Card = 0;
export const PT_Cone = 1;

/**
 * loop loops through moves and filter moves based on first card index
 * and second card index second card is optional zero for not use.
 * @param {[GameMove]} moves : Moves to filter
 * @param {int} firstCardix : The card index to check on first card of a move.
 * @param {int} secondCardix : The card index to check on the second card of a move.
 * @param {function} f: the function to call if indexes match.
 */
function loop(moves,firstCardix,secondCardix, f) {
    if ((moves) && (moves.lenght > 0)) {
        for (let i = 0; i < moves.length; i++) {
            let legalMove = moves[i];
            let firstMove=legalMove.BoardMoves[0];
            let secondMove=null;
            if (firstMove.Index===firstCardix){
                if (secondCardix>0){
                    secondMove=legalMove.BoardMoves[1];
                    if (firstMove.Index===firstCardix){
                        f(legalMove,firstMove,secondMove);
                    }
                }else{
                    f(legalMove, firstMove,secondMove);
                }
            }
        }
    }
}
/**
 * findPosOnFirst finds all the new postions from the moves where the first card
 * match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @returns {[int]}  unique new positions.
 */
export function findPosOnFirst(moves,firstCardix) {
    let posSet = new Set();
    loop(moves,firstCardix,0,function(legalMove, firstMove,secondMove) {
        posSet.add(firstMove.NewPos);
    });
    return [...posSet];
}
/**
 * findOldPosOnFirst finds all the old postions on the first card of a
 * move where the first card match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @returns {[int]}  unique old positions.
 */
export function findOldPosOnFirst(moves,firstCardix) {
    let posSet = new Set();
    loop(moves,firstCardix,0,function(legalMove, firstMove,secondMove) {
        posSet.add(firstMove.OldPos);
    });
    return [...posSet];
}
/**
 * findPosOnSecond finds all the postions on the second card of a move where the
 * first card and second card match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @param {} secondCardix : Filter moves on this being
 * the second card of a move.
 * @returns {[int]}  unique new positions for the second card of a GameMove
 */
export function findPosOnSecond(moves,firstCardix,secondCardix) {
    let posSet = new Set();
    loop(moves,firstCardix,secondCardix, function(legalMove, firstMove,secondMove) {
        posSet.add(secondMove.NewPos);
    });
    return [...posSet];
}
/**
 * findOldPosOnSecond finds all the old postions on the second card
 * where the first card match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @returns {[int]}  unique old positions.
 */
export function findOldPosOnSecond(moves,firstCardix) {
    let posSet = new Set();
    loop(moves,firstCardix,0,function(legalMove, firstMove,secondMove) {
        posSet.add(secondMove.OldPos);
    });
    return [...posSet];
}

/**
 * isDeck check if the moves are a deck move.
 * WARNING this does not include scout.
 * check if the first GameMove first BoardMove moves a card from a deck.
 * @param {[GameMoves]} moves
 * @returns {bool} : true if deck is changed in the moves.
 */
export function isDeck(moves){
    if ((moves) && (moves.lenght > 0)) {
        let legalMove = moves[0];
        if ((legalMove.BoardMoves) && (legalMove.BoardMoves.length > 0)) {
            let firstMove=legalMove.BoardMoves[0];
            if ((firstMove.PieceType === PT_Card)&&(
                firstMove.OldPos === dPos.card.DeckTac || firstMove.OldPos===dPos.card.DeckTroop)){
                return true;
            }
       }
    }
    return false;
}
/**
 * Check the first Move of moves to see if it is first BoardMove is a cone move.
 * @param {[GameMoves]} moves
 * @returns {bool} true if cane move.
 */
export function isCone(moves) {
    let res = false;
    if ((moves) && (moves.lenght > 0)) {
        let legalMove = moves[0];
        if ((legalMove.BoardMoves) && (legalMove.BoardMoves.length > 0)) {
            if (legalMove.BoardMoves[0].PieceType === PT_Cone) {
                res=true;
            }
        }
    }
    return res;
}

export function mover(moves){
    if (moves){
        return moves[0].Mover;
    }else{
        return 2;
    }
}
export function findMove(moves,move){
    let ix=-1;
    for (let i=0;i<moves.length;i++){
        if (isMoveEqual(move,moves[i])){
            return ix;
        }
    }
    return ix;
}
function isMoveEqual(a,b){
    if (a.Mover!==b.mover){
        return false;
    }
    if (a.BoardMoves.length!==b.BoardMoves.length){
        return false;
    }
    for (let i=0;i<a.BoardMoves.length;i++){
        if (!isPieceMoveEqual(a.BoardMoves[i],b.BoardMoves[i])){
            return false;
        }
    }
    return true;
}
function isPieceMoveEqual(a,b){
    if(a.Type!==b.Type){
        return false;
    }
    if(a.Index!==b.Index){
        return false;
    }
    if(a.NewPos!==b.NewPos){
        return false;
    }
    if(a.OldPOs!==b.OldPos){
        return false;
    }
    return true;
}
