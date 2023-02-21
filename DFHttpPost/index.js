var fs = require("fs")
const multipart = require('parse-multipart-data');
const nodemailer = require('nodemailer')
const { getVar, setVar } = require("../svc/varsSvc")
const path = require('path');
const df = require("durable-functions");

module.exports = async function (context, req) {

    const apiPath = path.join(__dirname, '..');
    let buildDir = getVar('BUILD_DIR') || 'build';
    const endPoints = getVar('END_POINTS');
    
    switch (req.params.functionName) {
        case "triggerbuild": 
            context.log("Triggering NPM build for templateEP-", req.query['ep']);
            const client = df.getClient(context);
            const instanceId = await client.startNew("DFOrchestrator", undefined, req.query['ep']);

            context.log(`Started orchestration with ID = '${instanceId}'.`);
            return client.createCheckStatusResponse(context.bindingData.req, instanceId);
        case "updatetemplate":
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

                            context.res = { status: 200, body: { message: 'Triggerd deployment successfully, may take around 10 minutes to reflect in the templates list.' } };
                        } catch (err) {
                            context.log(err);
                            context.res = { status: 400, body: { message: 'Failed to deploy site, err- ' + err } };
                        }
                    } else {
                        context.res = { status: 400, body: { message: 'Failed to process the form Data, refer logs for details!' } };
                    }
                }
            }
            break;
        case "sendmail":
            context.log("sendmail -", JSON.stringify(req.body));
            context.res = await sendMail(req.body);
            break;
        default:
            context.log(`Unknown post call for orchestration function = '${req.params.functionName}'.`);
    }
    return context.res;
};


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


async function sendMail(body) {
    let response = {}

    const senderMailId = 'araidarome@gmail.com';
    let mailOptions = {
        from: senderMailId,
        to: body.to,
        subject: body.subject,
        html: body.body,
        cc: body.cc
    };

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderMailId,
            pass: Buffer.from("aWt0Ym9ia2Jwa2hwYXdlbg==", 'base64').toString('ascii')
        }
    });

    let info = await transporter.sendMail(mailOptions);

    if (info) {
        if (info.accepted?.length > 0)
            response = { status: 200, body: { message: 'Email sent successfully ' + info.response } };
        else
            response = { status: 400, body: { message: 'Failed to send mail! ' + info.response } };
    } else {
        response = { status: 400, body: { message: 'Failed to send mail!' } };
    }
    return response;
}
