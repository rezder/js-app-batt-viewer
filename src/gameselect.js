import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    Column,
    Cell
} from 'fixed-data-table';
export class GameSelect extends Component {
    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleBatch = this.handleBatch.bind(this);
        this.handleRow = this.handleRow.bind(this);

        this.state = {
            batchSize: 10,
            games: [],
            selectedRow: -1
        };
    }
    static propTypes = {
        noGames: PropTypes.number.isRequired,
        handleGame: PropTypes.func,
        dbFile: PropTypes.string
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.dbFile !== this.props.dbFile) {
            this.setState({
                games: [],
                selectedRow: -1
            });
        }
    }
    handleLoad() {
        let params = "file=" + this.props.dbFile+ "&no-games="+this.state.batchSize;
        let games=this.state.games
        if (games.length!==0){
            let game=games[games.length-1]
            params=params+"&player0id="+game.PlayerIDs[0]+"&player1id="+game.PlayerIDs[1]+"&ts="+encodeURIComponent(game.Time);
        }
        let http = new XMLHttpRequest();
        let url = "games/";
        http.open("POST", url, true);
        http.setRequestHeader("Content-type",
                              "application/x-www-form-urlencoded");
        let gameSelector=this
        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                let games = JSON.parse(http.responseText);
                console.log(["Games recieved: ",games])
                let selectedRow=-1
                gameSelector.setState({
                    games: games,
                    selectedRow: selectedRow
                });
            }
        };
        http.send(params);
        console.log(["handleLoad Url: ",url,"Params: ",params])
        //TODO remove test ex. games
        /*
           games = [{
           Moves: [],
           PlayerIDs: [1, 2],
           TimeStamp: "2012-07-04T18:10:00.000+09:00"
           },
           {
           Moves: [],
           PlayerIDs: [1, 2],
           TimeStamp: "2012-07-04T18:10:00.000+09:30"
           }
           ];
           this.setState({
           games: games
           });
         */
    }
    handleBatch(event) {
        this.setState({
            batchSize: event.target.value
        });
    }
    handleRow(event, index) {
        if (this.state.selectedRow !== index) {
            this.setState({
                selectedRow: index
            });
            this.props.handleGame(this.state.games[index]);
        } else {
            this.setState({
                selectedRow: -1
            });
            this.props.handleGame(null);
        }
    }

    render() {
        return (
            <div className="game-select">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <lable>Database File:</lable></td>
                            <td style={{textAlign:"right"}}>
                                <output>{this.props.dbFile}</output>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>No. Games:</label>
                            </td>
                            <td style={{textAlign:"right"}}>
                                <output>{this.props.noGames}</output>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Batch Size:</label>
                            </td>
                            <td>
                                <input type="number"
                                       min="1"
                                       max="100"
                                       name="batchs-size"
                                       value={this.state.batchSize}
                                       onChange={this.handleBatch}
                                />
                                <button type="button"
                                        disabled={(this.props.noGames===0)}
                                        onClick={this.handleLoad}
                                >Load</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Table
                    rowHeight={40}
                    headerHeight={40}
                    rowsCount={this.state.games.length}
                    width={660}
                    height={400}
                    onRowClick={this.handleRow}
                >
                    <Column
                        header={<Cell>Player 1</Cell>}
                        cell={<PlayerCell data={this.state.games}
                                               player="0"
                        />}
                        width={100}
                    />
                    <Column
                        header={<Cell>Player 2</Cell>}
                        cell={<PlayerCell data={this.state.games}
                                               player="1"
                        />}
                        width={100}
                    />
                    <Column
                        header={<Cell>TimeStamp</Cell>}
                        cell={<TextCell data={this.state.games}
                                             field="Time"
                        />}
                        width={400}
                    />
                    <Column
                        header={<Cell></Cell>}
                        cell={<SelectCell selectedRow={this.state.selectedRow}/>}
                        width={40}
                    />
                </Table>
            </div>
        );
    }
}
class SelectCell extends React.Component {
    render() {
        const {
            rowIndex,
            selectedRow,
            ...props
        } = this.props;
        return (
            <Cell {...props}>
                <input type="checkbox" checked={rowIndex===selectedRow}/>
            </Cell>
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

class PlayerCell extends React.Component {
    render() {
        const {
            rowIndex,
            player,
            data,
            ...props
        } = this.props;
        let id = data[rowIndex]["PlayerIDs"][player];
        return (
            <Cell {...props}>
                {id}
            </Cell>
        );
    }
}
