var fs = require("fs")
const multipart = require('parse-multipart-data');
// const { exec } = require("child_process");
const nodemailer = require('nodemailer')
const { getVar, setVar } = require("../svc/envSvc")
const path = require('path');
const { PowerShell } = require('node-powershell');


module.exports = async function (context, req) {
    context.log('build trigger function processed a request.');

    const apiPath = path.join(__dirname, '../api');
    let buildDir = getVar('BUILD_DIR') || 'build';
    const endPoints = getVar('END_POINTS');

    if (req.url.includes("/triggerbuild?ep=")) {
        triggerBuild(req.query['ep'], apiPath, context);
        context.res = { status: 200, body: { message: 'Triggerd NPM build, may take few minutes to reflect in the templates list.' } };
    } else if (req.url.includes("/updatetemplate?ep=") && req.body) {

        if (buildDir === 'build_bkp') { // if build_bkp then prev build already in progress
            context.res = { status: 400, body: { message: 'Failed, previous deployment in progress, please try after few minutes!' } };
        } else {
            const configEndPoints = getVar('CONFIG_END_POINTS');
            if (configEndPoints && configEndPoints.includes(req.query['ep'])) {
                context.res = { status: 400, body: { message: 'Existing enpoints are only for reference, enter a different end-point value!' } };
            } else {
                const result = processFormData(req, apiPath, context); // read body and copy images
                if (result && result['template']) {
                    let templatesStr = fs.readFileSync(apiPath + "/client/src/config/Template.json");
                    let templates = JSON.parse(templatesStr);

                    const mergedTemplates = Object.assign(templates, result['template']);
                    try {
                        fs.writeFileSync(apiPath + "/client/src/config/Template.json", JSON.stringify(mergedTemplates, null, 2), 'utf8');
                        context.log('Updated template entry successfully');

                        endPoints.push(req.query['ep']);
                        setVar('END_POINTS', [...new Set(endPoints)]);

                        context.res = { status: 200, body: { message: 'Triggerd deployment successfully, may take few minutes to reflect in the templates list.' } };
                    } catch (err) {
                        context.log(err);
                        context.res = { status: 400, body: { message: 'Failed to deploy site, err- ' + err } };
                    }
                }
            }
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

    }
}


function triggerBuild(template, apiPath, context) {
    if (fs.existsSync(apiPath + "/client/build")) {
        if (getVar('BUILD_DIR') == 'build') {
            fs.rmSync(apiPath + "/client/build_bkp", { recursive: true, force: true });

            fs.renameSync(apiPath + "/client/build", apiPath + "/client/build_bkp", (err) => {
                if (err) {
                    context.log("failed to rename build dir " + err)
                    return;
                }
            });
        } else {
            fs.rmSync(apiPath + "/client/build", { recursive: true, force: true });
        }
    }
    setVar('BUILD_DIR', 'build_bkp');
    context.log('Triggering deployment for template ' + template);

    //initialize PowerShell instance
    const ps = new PowerShell({ executionPolicy: 'Bypass', noProfile: true });
    ps.invoke('npm run build --prefix ' + apiPath + '/client/').then(response => {
        context.log('Build----- stdout: ', response);
    }).catch(err => {
        context.log(`Build----- warning/error: ${err}`);
    });

    // try{
    //     let child = exec(apiPath +'\\buildClient.ps1', { shell: 'powershell.exe' });
    //     console.log('Triggered deployment for template '+template);
    //     child.on('exit', (code) => {
    //         console.log("Build process exited with code >>>>>> "+code);
    //     });
    //     child.stdout.on('data', function(data) {
    //         console.log('Build----- stdout: ' + data);
    //     });
    //     child.stderr.on("data", (data) => {
    //         console.log(`Build----- warning/error: ${data}`);
    //     });
    // }catch(error){
    //     console.log('Error occured while launching build script - ', error);
    // }
}



function ensureDirectoryExistence(filePath, context) {
    fs.mkdirSync(filePath, { recursive: true }, (err) => {
        if (err) {
            context.log("dir already exists!");
        }
    });
}


function processFormData(request, apiPath, context) {
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
                let targetDir = apiPath + "/client/src/img/" + request.query['ep'];
                if (!dirExists) {
                    ensureDirectoryExistence(targetDir, context);
                    dirExists = true;
                }
                fs.writeFileSync(targetDir + "/" + item.filename, item.data);
                if (item.type.includes('zip')) {
                    //TODO extract zip and cleanup
                }
            } else {
                context.log('Invalid file type - ' + item.type);
            }
        }
    }
    return result;
}

