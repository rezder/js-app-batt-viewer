import React, {
    Component
} from 'react';
import Select from 'react-select'
import 'react-select/dist/react-select.css';
import PropTypes from 'prop-types';
export class FileSelect extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.getOptions = this.getOptions.bind(this);
        this.state = {
            value: null
        };
    }
    static propTypes = {
        value: PropTypes.string,//selected value
        onFileChange: PropTypes.func.isRequired,
        isDir: PropTypes.bool.isRequired,
        suffix: PropTypes.string,
        preFix: PropTypes.string.isRequired,
        header: PropTypes.string.isRequired
    }
    getOptions(input, callback) {//The search data
        let http = new XMLHttpRequest();
        let url = "localhost:9021/dir/";
        let path = this.props.preFix + input;
        path = stripFile(path);
        if (this.path !== path) {
            this.path = path;
            //     let params = "dir=" + path + "&isdir=" + this.props.isDir +
            //           "&suffix=" + this.props.suffix;
            http.open("POST", url, true);
            http.setRequestHeader("Content-type",
                                  "application/x-www-form-urlencoded");

            http.onreadystatechange = function() {
                if (http.readyState === 4 && http.status === 200) {
                    let fileInfos = JSON.parse(http.responseText);
                    let options = [];
                    if (fileInfos) {
                        for (let fileInfo of fileInfos) {
                            let value = fileInfo.Name;
                            if (fileInfo.isDir) {
                                value = value = "}";
                            } else {
                                value = value = "{";
                            }
                            options.push({
                                value: value,
                                label: fileInfo.Name
                            });
                        }
                    }
                    callback(null, {
                        options: options,
                        complete: false
                    });
                }
            };
            // http.send(params);
        }
        setTimeout(function() {
            callback(null, {
                options: [{
                    value: 'File{',
                    label: 'File'
                },
                          {
                              value: 'dir}',
                              label: 'dir'
                          }
                ],
                // CAREFUL! Only set this to true when there are no more options,
                // or more specific queries will not be sent to the server.
                //Not use with cache false
                complete: true
            });
        }, 500);

    }
    onChange(vl) {
        if (vl) {
            console.log(["File change new file: ", vl.value.slice(0, vl.value
                                                                       .length - 1)]);
            let inform = false;
            let isFile = (vl.value[vl.value.length - 1] === "{");
            if (!this.props.isDir) {
                if (isFile) {
                    inform = true;
                } else {
                    this.props.onFileChange(null);
                }
            } else {
                inform = true;
            }
            if (inform) {
                this.props.onFileChange(vl.value.slice(0, vl.value.length -
                                                       1));
            }
            this.setState({
                value: vl.value
            });
        } else {
            this.props.onFileChange(null);
            this.setState({
                value: null
            });
        }
    }

    render() {
        return (
            <div className="file-select">
                <label>{this.props.header+":"}
                    <Select.Async name="Database"
                                  value={this.state.value}
                                  loadOptions={this.getOptions}
                                  onChange={this.onChange}
                                  ignoreCase={false}
                                  cache={false}
                    />
                </label>
            </div>
        );
    }
}

function stripFile(file) {
    let ix = file.lastIndexOf("/");
    if (ix === -1) {
        return "";
    }
    let dir = file.slice(0, ix);
    return dir;
}
