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
    httpCallBack(options){
        this.myOptions=options
    }
    getOptions(input, callback) {//The search data
        let http = new XMLHttpRequest();
        let url = "dir/";
        let preFix=this.props.preFix
        let path = preFix + input;
        path = stripFile(path);
        if (this.path !== path) {
            this.path = path;
            let params = "dir=" + path + "&isdir=" + this.props.isDir +
                         "&suffix=" + this.props.suffix;
            http.open("POST", url, true);
            http.setRequestHeader("Content-type",
                                  "application/x-www-form-urlencoded");
            let fileSelector=this
            http.onreadystatechange = function() {
                if (http.readyState === 4 && http.status === 200) {
                    let fileInfos = JSON.parse(http.responseText);
                    console.log(["getOptions Recieve object: ",fileInfos])
                    let options = [];
                    if (fileInfos) {
                        for (let fileInfo of fileInfos) {
                            let value = fileInfo.Name;
                            if (fileInfo.IsDir) {
                                value = value + "/";
                            }
                            let label=value
                            if (path.length>=preFix.length){
                                label=path.slice(preFix.length)+"/"+value
                            }
                            value=path+"/"+value
                            options.push({
                                value: value,
                                label: label
                            });
                        }
                    }
                    fileSelector.myOptions=options
                    callback(null, {
                        options: options,
                        complete: false
                    });
                }
            };
            http.send(params);
            console.log(["getOptions Url: ",url,"Params: ",params])
        }else{
            callback(null, {
                options: this.myOptions,
                complete: false
            });
        }
        //TODO remove dir content example
        /*setTimeout(function() {
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
         */
    }
    onChange(vl) {
        if (vl) {
            console.log(["File change new file: ", vl]);
            let inform = false;
            let isFile = (vl.value[vl.value.length - 1] !== "/");
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
                console.log(["App File change new file: ", vl.value]);
                this.props.onFileChange(vl.value);
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
            <fieldSet className="file-select">
                <legend>{this.props.header}</legend>
                <Select.Async name="Database"
                              value={this.state.value}
                              loadOptions={this.getOptions}
                              onChange={this.onChange}
                              ignoreCase={false}
                              autoload={true}
                />
            </fieldSet>
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
