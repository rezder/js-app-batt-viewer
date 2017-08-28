import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    Column,
    Cell
} from 'fixed-data-table';
import 'fixed-data-table/dist/fixed-data-table.css';
import {
    FileSelect
} from './fileselect.js';
import * as dPos from './dpos.js';
import * as dCard from './dcard.js';
import * as dMoveType from './dmovetype.js';
import {
    CalcPosView
} from './gameviewer.js'

export class MoveAnalyzer extends Component {
    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleCalc = this.handleCalc.bind(this);
        this.state = {
            isCalc: false,
            probs:null,
            modelDir:null
        };
    }
    static propTypes = {
        playerIDs: PropTypes.arrayOf(PropTypes.number),
        gamePos: PropTypes.object // The movers view to be able to calculate the prob for moves

    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.gamePos !== this.props.gamePos) {
            if (nextProps.gamePos.Moves) {
                let moves = nextProps.gamePos.Moves;
                let isCalc = checkCalc(moves,this.state.modelDir);
                this.setState({
                    isCalc: isCalc,
                    probs:null
                });
            }
        }
    }
    handleLoad(modelDir) {
        let http = new XMLHttpRequest();
        let url = "model/";
        let params = "model=" + modelDir;
        http.open("POST", url, true);
        http.setRequestHeader("Content-type",
                              "application/x-www-form-urlencoded");
        let moveAnalyzer=this
        let newDir =modelDir
        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                console.log(["handleLoad Recieve: ",http.responseText])
                let isCalc=false
                if (moveAnalyzer.props.gamePos){
                    let moves = moveAnalyzer.props.gamePos.Moves;
                    isCalc = checkCalc(moves,newDir);
                }
                moveAnalyzer.setState({
                    isCalc: isCalc,
                    modelDir: newDir
                });

            }
        };
        http.send(params);
        console.log(["handleLoad Url: ",url,"Params: ",params])
        //TODO remove ex. monitor
        /// let isCalc=false
        //   if(this.props.gamePos){
        //       isCalc=true
        //  }
        //  this.state = {
        //     isCalc: isCalc,
        // };

    }
    handleCalc() {
        let http = new XMLHttpRequest();
        let url = "model/";
        let jsonMoverView=encodeURIComponent(JSON.stringify(this.props.gamePos))
        let params = "model=" + this.state.modelDir+"&mover-view="+jsonMoverView;
        http.open("POST", url, true);
        http.setRequestHeader("Content-type",
                              "application/x-www-form-urlencoded");
        let moveAnalyzer=this
        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                console.log(["handleCalc Recieve: ",http.responseText])
                let probs = JSON.parse(http.responseText);
                let moves = moveAnalyzer.props.gamePos.Moves;
                //this is not perfect but we do not want to carry the calc id
                // model game and moveix
                if ((probs) && (moves) && moves.length === probs.length) {
                    moveAnalyzer.setState({
                        probs: probs
                    });
                }
            }
        };
        http.send(params);
        console.log(["handleCalc Url: ",url,"Params: ",params])
        //TODO remove test ex. Probs
        //let probs = [];
        //let moves = this.props.gamePos.Moves;
        //for (let i = 0; i < moves.length; i++) {
        //   probs.push(0.54333);
        //}
        //console.log(["setting state probs:",probs])
        //this.setState({
        //   probs: probs
        // });
    }

    render() {
        let moves = null
        if (this.props.gamePos) {
            moves = this.props.gamePos.Moves
        }
        return (
            <div className="move-analyzer">
                <div>
                    <MoveViewer
                        moves={moves}
                        probs={this.state.probs}
                        playerIDs={this.props.playerIDs}
                    />
                    <button type="button"
                            onClick={this.handleCalc}
                            disabled={!this.state.isCalc}>
                        Calc
                    </button>
                </div>
                <ModelSelect handleLoad={this.handleLoad}/>
                <StdMonitor modelDir={this.state.modelDir}/>
            </div>

        );
    }
}

/**
 * checkCalc checks if the calculation button should be
 * active.
 * @param {[move]} moves: possible moves.
 * @returns {bool} true if active.
 */
function checkCalc(moves,modelDir) {
    let isCalc = false;
    console.log(["check calc Moves:",moves])
    if ((moves)&&(modelDir)) {
        if (moves[0].MoveType === dMoveType.Hand ||
            moves[0].MoveType === dMoveType.Scout1) {
            isCalc = true;
        }
    }
    return isCalc;
}
class StdMonitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timer: null,
            content:""
        };
        this.requestStd = this.requestStd.bind(this);
    }
    static propTypes = {
        modelDir: PropTypes.string
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.modelDir !== this.props.modelDir) {
            if (this.state.timer) {
                clearInterval(this.state.timer);
            }
            let timer = null;
            if (nextProps.modelDir) {
                this.requestStd(nextProps.modelDir);
                timer = setInterval(this.requestStd, 5000);
            }
            this.setState({
                timer: timer
            });
        }
    }
    requestStd(modelDir) {
        let http = new XMLHttpRequest();
        if (!modelDir){
            modelDir=this.props.modelDir
        }
        let url = "model/";
        if (modelDir) {
            let params="model="+modelDir+"&std-out=true";
            http.open("Post", url, true);
            console.log(["requestStd Recieve: ",http.responseText])
            http.setRequestHeader("Content-type",
                                  "application/x-www-form-urlencoded");
            let stdMonitor=this
            http.onreadystatechange = function() {
                if (http.readyState === 4 && http.status === 200) {
                    console.log(["FileMonitor recive: ",http.responseText])
                    let text = JSON.parse(http.responseText).StdOut;
                    stdMonitor.setState({
                        content: text
                    });
                }
            };
            http.send(params);
            console.log(["request std Url: ",url,"Params: ",params])

        }else{
            this.setState({
                content: ""
            });
        }
        //TODO remove test ex. stdout content
        //this.setState({
        //  content: "Test data"
        //});
        //console.log("Request file");
    }

    render() {
        return (
            <textarea
                className="std-monitor"
                rows={15}
                cols={80}
                wrap="on"
                readOnly={true}
                value={this.state.content}
            />
        );
    }
}
class ModelSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null, // selected model directory.
            loaded: null // loaded model directory.
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
    }
    static propTypes = {
        handleLoad: PropTypes.func // Listner for new load value
    }

    handleSelect(dir) {
        this.setState({
            selected: dir
        });
    }
    handleLoad() {
        let selected = this.state.selected;
        if (selected !== this.state.loaded) {
            this.setState({
                loaded: selected
            });
            if (this.props.handleLoad) {
                this.props.handleLoad(selected);
            }
        }
    }
    render() {
        let isDisable=!this.state.selected
        return (
            <div className="model-select">
                <FileSelect
                    header="Select Model"
                    value={this.state.selected}
                    onFileChange={this.handleSelect}
                    isDir={true}
                    suffix=""
                    preFix="/home/rho/"
                />
                <button type="button"
                        disabled={isDisable}
                        onClick={this.handleLoad}
                >Load</button>
                <label>Loaded Model:
                    <output>{this.state.loaded}</output>
                </label>
            </div>
        );
    }
}

class MoveViewer extends Component {
    static proptybes = {
        moves: PropTypes.array,
        playerIDs: PropTypes.arrayOf(PropTypes.number)
    }

    render() {
        let moves = this.props.moves

        let probs = this.props.probs;
        let ids = this.props.playerIDs;
        let data = [];
        if (moves) {
            for (let i = 0; i < moves.length; i++) {
                let move = moves[i];
                if (move.Moves) {
                    for (let bpMove of move.Moves) {
                        let row = {
                            id: ids[move.Mover].toString(),
                            moveType: dMoveType.text(move.MoveType)
                        };
                        if (bpMove.BoardPiece === 0) {
                            row.boardPiece = dCard.text(bpMove.Index);
                            row.newPos = dPos.card.text(bpMove.NewPos);
                            row.oldPos = dPos.card.text(bpMove.OldPos);
                        } else {
                            row.boardPiece = "Cone " + bpMove.Index;
                            row.newPos = "None";
                            if (bpMove.NewPos !== dPos.cone.None) {
                                row.newPos = ids[move.Mover].toString();
                            }
                            row.oldPos = "None";
                            if (bpMove.OldPos !== dPos.cone.None) {
                                row.newPos = ids[move.Mover].toString();
                            }
                        }
                        row.prob = "0";
                        if (probs) {
                            row.prob = probs[i].toString();
                        }
                        data.push(row);
                    }
                } else {
                    data.push({
                        id: ids[move.Mover].toString(),
                        moveType: dMoveType.text(move.MoveType),
                        boardPiece: "",
                        oldPos: "",
                        newPos: "",
                        prob: "0"
                    });
                }
            }
        }
        return (
            <Table className="move-viewer"
                   rowHeight={40}
                   headerHeight={40}
                   rowsCount={data.length}
                   width={770}
                   height={400}
            >
                <Column
                    header={<Cell>Player ID</Cell>}
                    cell={<TextCell
                              data={data}
                                   field="id"
                    />}
                    width={125}
                />
                <Column
                    header={<Cell>Move Type</Cell>}
                    cell={<TextCell
                              data={data}
                                   field="moveType"
                    />}
                    width={125}
                />
                <Column
                    header={<Cell>Board Piece</Cell>}
                    cell={<TextCell
                              data={data}
                                   field="boardPiece"
                    />}
                    width={125}
                />
                <Column
                    header={<Cell>Old Position</Cell>}
                    cell={<TextCell
                              data={data}
                                   field="oldPos"
                    />}
                    width={135}
                />
                <Column
                    header={<Cell>New Position</Cell>}
                    cell={<TextCell
                              data={data}
                                   field="newPos"
                    />}
                    width={135}
                />
                <Column
                    header={<Cell>Probability</Cell>}
                    cell={<TextCell
                              data={data}
                                   field="prob"
                    />}
                    width={125}
                />
            </Table>
        );
    }
}
class TextCell extends React.Component {
    render() {
        const {
            rowIndex,
            field,
            data,
            ...props
        } = this.props;
        return (
            <Cell {...props}>
                {data[rowIndex][field]}
            </Cell>
        );
    }
}
/**
 * CalcMoverView calculate the movers view
 * @param {PosView} godView the god view.
 * @returns {PosView} mover view.
 */
export function CalcMoverView(godView) {
    if (godView.Moves) {
        return CalcPosView(godView, godView.Moves[0].Mover)
    } else {
        return godView
    }
}
