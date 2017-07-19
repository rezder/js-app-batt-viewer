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

export class MoveAnalyzer extends Component {
    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleCalc = this.handleCalc.bind(this);
        this.state = {
            isCalc: false,
            stdOutFile: null
        };
    }
    static propTypes = {
        playerIDs: PropTypes.arrayOf(PropTypes.number),
        posMoves: PropTypes.array //Possible moves for a player

    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.posMoves !== this.props.posMoves) {
            if (nextProps.posMoves) {
                let moves = nextProps.posMoves;
                let stdOutFile = this.state.stdOutFile;
                let isCalc = checkCalc(stdOutFile, moves);
                this.setState({
                    isCalc: isCalc
                });
            }
        }
    }
    handleLoad(modelDir) {
        this.setState({
            modelDir: modelDir
        });
        let http = new XMLHttpRequest();
        let url = "localhost:9021/model/";
        // let params = "model=" + modelDir;
        http.open("POST", url, true);
        http.setRequestHeader("Content-type",
            "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                let file = JSON.parse(http.responseText);
                let moves = this.props.posMoves;
                let isCalc = checkCalc(file, moves);
                this.setState({
                    stdOutFile: file,
                    isCalc: isCalc
                });

            }
        };
        //http.send(parms);
        this.state = { //TODO remove
            isCalc: true,
            stdOutFile: "test.file"
        };
    }
    handleCalc() {
        let http = new XMLHttpRequest();
        let url = "localhost:9021/model";
        //let params = "model=" + this.state.modelDir+"&calc=true";
        http.open("POST", url, true);
        http.setRequestHeader("Content-type",
            "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                let probs = JSON.parse(http.responseText);
                let moves = this.props.posMoves;
                //this is not perfect but do not want to carry the calc id
                // model game and moveix
                if ((probs) && (moves) && moves.length === probs.length) {
                    this.setState({
                        probs: probs
                    });
                }
            }
            //http.send(parms);
            //TODO remove
            let probs = [];
            let moves = this.props.posMoves;
            for (let i = 0; i < moves.length; i++) {
                probs.push(0.54333);
            }
            this.setState({
                probs: probs
            });
        };
    }

    render() {
        return (
            <div className="move-analyzer">
                <div>
                    <MoveViewer
                        moves={this.props.posMoves}
                        playerIDs={this.props.playerIDs}
                    />
                    <button type="button"
                            onClick={this.handleCalc}
                            disabled={!this.state.isCalc}>
                        Calc
                    </button>
                </div>
                <ModelSelect handleLoad={this.handleLoad}/>
                <FileMonitor stdOutFile={this.state.stdOutFile}/>
            </div>

        );
    }
}

/**
 * checkCalc checks if the calculation button should be
 * active.
 * @param {string} file stdOutFile from tensorflow model.
 * @param {[move]} moves: possible moves.
 * @returns {bool} true if active.
 */
function checkCalc(file, moves) {
    let isCalc = false;
    if ((file) && (moves)) {
        if (moves[0].MoveType === dMoveType.Hand ||
            moves[0].MoveType === dMoveType.Scout1) {
            isCalc = true;
        }
    }
    return isCalc;
}
class FileMonitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timer: null,
            content: null
        };
        this.requestFile = this.requestFile.bind(this);
    }
    static propTypes = {
        stdOutFile: PropTypes.string
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.stdOutFile !== this.props.stdOutFile) {
            if (this.state.timer) {
                clearInterval(this.state.timer);
            }
            let timer = null;
            if (nextProps.stdOutFile) {
                this.requestFile();
                timer = setInterval(this.requestFile, 5000);
            }
            this.setState({
                timer: timer
            });
        }
    }
    requestFile() {
        let http = new XMLHttpRequest();
        let stdOutFile = this.props.stdOutFile;
        let url = "localhost:9021/modelStOut/";
        if (stdOutFile) {
            //let params="file="+stdOutFile;
            http.open("Post", url, true);
            http.setRequestHeader("Content-type",
                "application/x-www-form-urlencoded");

            http.onreadystatechange = function() {
                if (http.readyState === 4 && http.status === 200) {
                    let text = JSON.parse(http.responseText);
                    this.setState({
                        content: text
                    });
                }
            };
            // http.send(params);
        }
        this.setState({
            content: "Test data"
        }); //TODO Remove
        console.log("Request file");
    }

    render() {
        return (
            <textarea
                className="file-monitor"
                rows={15}
                cols={80}
                wrap="on"
                readOnly={true}
            >{this.state.content}
            </textarea>
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
        return (
            <div className="model-select">
                <FileSelect
                    header="Model Directory"
                    value={this.state.selected}
                    onFileChange={this.handleSelect}
                    isDir={true}
                    suffix=""
                    preFix="/home/rho/"
                />
                <button type="button"
                        disabled={(!this.state.selected)}
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
        playerIDs:PropTypes.arrayOf(PropTypes.number)
    }
    render() {
        let moves = this.props.moves;
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
