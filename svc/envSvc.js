var fs = require("fs")
const path = require('path');

function getVar(key){
    data = fs.readFileSync(__dirname + "/env.json");
    let jsonData = JSON.parse(data);

    const apiPath = path.join(__dirname, '..');
    if(key === 'BUILD_DIR' && jsonData[key] != 'build'){
        if (fs.existsSync(apiPath + "/client/build/static") ){
            setVar('BUILD_DIR', 'build');
            return 'build';
        }
    }else if(key === 'END_POINTS' && jsonData[key].length == 0){
        data = fs.readFileSync(apiPath + "/client/src/config/Config.json");
        let jsonData = JSON.parse(data);
        let keys = Object.keys(jsonData);
        setVar('END_POINTS', keys);
        return keys;
    }

    return jsonData[key];
}

function setVar(key, value){
    data = fs.readFileSync(__dirname + "/env.json");
    let jsonData = JSON.parse(data);
    jsonData[key] = value;
    fs.writeFileSync(__dirname + "/env.json", JSON.stringify(jsonData, null, 2), 'utf8');
}

exports.setVar = setVar
exports.getVar = getVar