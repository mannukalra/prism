var fs = require("fs")
var mime = require('mime-types')
const {getVar, setVar} = require("../svc/envSvc")


module.exports = async function (context, req) {
    let file = "index.html"
    let data;
    let buildDir = getVar('BUILD_DIR') || 'build';
    context.log("Current build dir - "+buildDir);

    const endPoints = getVar('END_POINTS');
    if (req.url.endsWith('/api') || endPoints.some((ep) => req.url.endsWith('/'+ep))) {
        try {
            data = fs.readFileSync(__dirname + "/client/"+buildDir+"/" + file);
            context.log('GET ' + __dirname + "/client/"+buildDir+"/" + file);
            let contentType = mime.lookup(file)
            context.res = { status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType } };
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {} };
        }

    } else if (req.url.includes("/configtemplate?ep=")) {

        data = fs.readFileSync(__dirname + "/client/src/config/Config.json");
        let jsonData = JSON.parse(data);
        const configEndPoints = getVar('CONFIG_END_POINTS');
        if(Array.isArray(configEndPoints) && configEndPoints.length == 0){
            setVar('CONFIG_END_POINTS', Object.keys(jsonData));
        }
        context.res = { status: 200, body: jsonData[req.query['ep']], headers: { 'Content-Type': "application/json" } };

    } else if (req.url.endsWith("/templatesinfo")) {

        data = fs.readFileSync(__dirname + "/client/src/config/Config.json");
        let jsonData = JSON.parse(data);
        let templatesInfo = Object.entries(jsonData).map(([key, val] = entry) => {
            return { [key]: val.label };
        });
        context.res = { status: 200, body: templatesInfo, headers: { 'Content-Type': "application/json" } };
    } else if (req.url.includes("/api/")) {

        file = req.url.substring(req.url.indexOf("/api/") + 5);
        try {
            data = fs.readFileSync(__dirname + "/client/"+buildDir+"/" + file);
            // context.log('GET ' + __dirname + "/client/"+buildDir+"/" +  file);
            var contentType = mime.lookup(file)
            context.res = { status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType } };
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {} };
        }

    }
}

