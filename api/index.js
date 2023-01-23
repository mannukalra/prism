var fs = require("fs")
var mime = require('mime-types')
const nodemailer = require('nodemailer')
const multipart = require('parse-multipart-data');
const { spawnSync, spawn } = require("child_process");


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
        context.res = { status: 200, body: jsonData[req.query['ep']], headers: { 'Content-Type': "application/json" } };

    } else if (req.url.endsWith("/templatesinfo")) {

        data = fs.readFileSync(__dirname + "/client/src/config/Config.json");
        let jsonData = JSON.parse(data);
        let templatesInfo = Object.entries(jsonData).map(([key, val] = entry) => {
            return { [key]: val.label };
        });
        context.res = { status: 200, body: templatesInfo, headers: { 'Content-Type': "application/json" } };
    } else if (req.url.includes("/updatetemplate?ep=") && req.body) {

        if(buildDir === 'build'){ // if build_bkp then prev build already in progress
            const result = processFormData(req, context); // read body and copy images
            if (result && result['template']) {
                let templatesStr = fs.readFileSync(__dirname + "/client/src/config/Template.json");
                let templates = JSON.parse(templatesStr);

                const mergedTemplates = Object.assign(templates, result['template']);
                try {
                    fs.writeFileSync(__dirname + "/client/src/config/Template.json", JSON.stringify(mergedTemplates, null, 2), 'utf8');
                    context.log('Updated template entry successfully');

                    endPoints.push(req.query['ep']);
                    setVar('END_POINTS', [...new Set(endPoints)]);
                    
                    deployBuildSync(req.query['ep'], context);
                    context.res = { status: 200, body: { message: 'Deployed your build successfully' } };
                } catch (err) {
                    context.log(err);
                    context.res = { status: 400, body: { message: 'Failed to deploy site, err- ' + err } };
                }
            }
        }else{
            context.res = { status: 400, body: { message: 'Failed, previous deployment in progress, please try after few minutes!' } };
        }
    } else if (req.url.endsWith("/sendmail")) {
        context.log("sendmail -", JSON.stringify(req.body));

        let mailOptions = {
            from: 'araidarome@gmail.com',
            to: req.body.to,
            subject: req.body.subject,
            html: req.body.body,
            cc: req.body.cc
        };

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'araidarome@gmail.com',
                pass: Buffer.from("aWt0Ym9ia2Jwa2hwYXdlbg==", 'base64').toString('ascii')
            }
        });


        let info = await transporter.sendMail(mailOptions);

        if (info) {
            if (info.accepted?.length > 0)
                context.res = { status: 200, body: { message: 'Email sent successfully ' + info.response } };
            else
                context.res = { status: 400, body: { message: 'Failed to send mail! ' + info.response } };
        } else {
            context.res = { status: 400, body: { message: 'Failed to send mail!' } };
        }

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

function deployBuildSync(template, context){
    if (fs.existsSync(__dirname + "/client/build") ){
        if (getVar('BUILD_DIR') == 'build')  {
            fs.rmSync(__dirname + "/client/build_bkp", { recursive: true, force: true });

            fs.renameSync(__dirname + "/client/build", __dirname + "/client/build_bkp", async (err) => {
                if (err) {
                    context.log("failed to rename build dir "+err)
                    return;
                }
            });
        } else {
            fs.rmSync(__dirname + "/client/build", { recursive: true, force: true });
        }
    }

    setVar('BUILD_DIR', 'build_bkp');
    context.log('Triggered Deployment for template '+template);

    let output;
    try{
        output = spawnSync('npm', ['run', 'build', '--prefix "'+__dirname + '/client/"'], { shell: true, encoding : 'utf8' });
    }catch(error){
        context.log('spawnSync Error', error);
    }finally{
        if (fs.existsSync(__dirname + "/client/build/static") ){
            setVar('BUILD_DIR', 'build');
        }
    }
    
    if(output && output.stdout){
        context.log("output.stdout: \n" +output.stdout);
        if (output.status == 0) {
            context.log(`child process exited successfully with code ${output.status}`);
            setVar('BUILD_DIR', 'build');
        } else {
            context.log(`child process closed with code ${output.status}`);
        }
    }
    
}

function deployBuild(template, context){
    if (fs.existsSync(__dirname + "/client/build") ){
        if (getVar('BUILD_DIR') == 'build')  {
            fs.rmSync(__dirname + "/client/build_bkp", { recursive: true, force: true });

            fs.renameSync(__dirname + "/client/build", __dirname + "/client/build_bkp", async (err) => {
                if (err) {
                    context.log("failed to rename build dir "+err)
                    return;
                }
            });
        } else {
            fs.rmSync(__dirname + "/client/build", { recursive: true, force: true });
        }
    }
    setVar('BUILD_DIR', 'build_bkp');
    context.log('Triggered Deployment for template '+template);

    let child;
    try{
        child = spawn('npm run build --prefix "'+__dirname + '/client/"', { shell: true, encoding : 'utf8' });
        child.on('exit', (code) => {
            context.log("Build process exited with code >>>>>> "+code);
        });
        child.on("close", (code) => {
            if(code == 0){
                setVar('BUILD_DIR', 'build');
            }
            context.log(`child process closed with code ${code}`);
        });
        child.stdout.on('data', function(data) {
            context.log('Build----- stdout: ' + data);
        });
        child.stderr.on("data", (data) => {
            context.log(`Build----- warning/error: ${data}`);
        });
    }catch(error){
        context.log('Error', error);
    }finally{
        if (fs.existsSync(__dirname + "/client/build/static") ){
            setVar('BUILD_DIR', 'build');
        }
    }  
}


function ensureDirectoryExistence(filePath, context) {
    fs.mkdirSync(filePath, { recursive: true }, (err) => {
        if (err) {
            context.log("dir already exists!");
        }
    });
}


function processFormData(request, context) {
    let contentType = request.headers['content-type'];
    const contentTypeArray = contentType.split(';').map(item => item.trim());
    const boundaryPrefix = 'boundary=';
    let boundary = contentTypeArray.find(item => item.startsWith(boundaryPrefix));
    let result = null;

    if (boundary) {
        boundary = boundary.slice(boundaryPrefix.length).trim();
        result = {}
        let dirExists = false;
        const body = request.body;
        const items = multipart.parse(body, boundary);
        
        for (let item of items) {
            if (item.type.includes('application/json') && item.name && item.name == 'template') {
                    result['template'] = JSON.parse(item.data);
            } else if (item.type.includes('image/') || item.type.includes('zip')) {
                let targetDir = __dirname + "/client/src/img/" + request.query['ep'];
                if (!dirExists) {
                    ensureDirectoryExistence(targetDir, context);
                    dirExists = true;
                }
                fs.writeFileSync(targetDir + "/" + item.filename, item.data);
                if (item.type.includes('zip')) {
                    //TODO extract zip and cleanup
                }
            } else {
                context.log('Invalid file type - '+ item.type);
            }
        }
    }
    return result;
}

function getVar(key){
    data = fs.readFileSync(__dirname + "/env.json");
    let jsonData = JSON.parse(data);
    if(key === 'BUILD_DIR' && jsonData[key] != 'build'){
        if (fs.existsSync(__dirname + "/client/build/static") ){
            setVar('BUILD_DIR', 'build');
            return 'build';
        }
    }else if(key === 'END_POINTS' && jsonData[key].length == 0){
        data = fs.readFileSync(__dirname + "/client/src/config/Config.json");
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

