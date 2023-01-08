var fs = require("fs")
var mime = require('mime-types')
const nodemailer = require('nodemailer')
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const multipart = require('parse-multipart-data');
const {execSync} = require('child_process');

//TODO read from config
const endPoints = ['/api', '/pnbc', '/o2s', '/simarhunar', '/o2s2'];


module.exports = async function (context, req) {
    let file = "index.html"
    let data;

    if (endPoints.some((ep) => req.url.endsWith(ep))) {
        try {
            data = await readFileAsync(__dirname + "/client/build/" + file);
            context.log('GET ' + __dirname + "/client/build/" + file);
            let contentType = mime.lookup(file)
            context.res = { status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType } };
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {} };
        }

    } else if (req.url.includes("/configtemplate?ep=")) {

        data = await readFileAsync(__dirname + "/client/src/config/Config.json");
        let jsonData = JSON.parse(data);
        context.res = { status: 200, body: jsonData[req.query['ep']], headers: { 'Content-Type': "application/json" } };

    } else if (req.url.endsWith("/templatesinfo")) {

        data = await readFileAsync(__dirname + "/client/src/config/Config.json");
        let jsonData = JSON.parse(data);
        let templatesInfo = Object.entries(jsonData).map(([key, val] = entry) => {
            return { [key]: val.label };
        });
        context.res = { status: 200, body: templatesInfo, headers: { 'Content-Type': "application/json" } };
    } else if (req.url.includes("/updatetemplate?ep=") && req.body) {

        const result = processFormData(req); // read raw body
        if (result && result['template']) {
            let templatesStr = await readFileAsync(__dirname + "/client/src/config/Template.json");
            let templates = JSON.parse(templatesStr);

            const mergedTemplates = Object.assign(templates, result['template']);
            try {
                fs.writeFileSync(__dirname + "/client/src/config/Template.json", JSON.stringify(mergedTemplates, null, 2), 'utf8');
                console.log('Updated template entry successfully');
                
                execSync('npm run build --prefix "'+__dirname + '/client/"');//, {stdio: 'inherit'});
                console.log('Deployed the build successfully');
                context.res = { status: 200, body: { message: 'Deployed your build successfully' } };
            } catch (err) {
                console.error(err);
                context.res = { status: 400, body: { message: 'Failed to deploy site, err- ' + err } };
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

    } else if (req.url.includes("/api/")) {

        file = req.url.substring(req.url.indexOf("/api/") + 5);
        try {
            data = await readFileAsync(__dirname + "/client/build/" + file);
            // context.log('GET ' + __dirname + "/client/build/" +  file);
            var contentType = mime.lookup(file)
            context.res = { status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType } };
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {} };
        }

    }
}


function ensureDirectoryExistence(filePath) {
    fs.mkdir(filePath, { recursive: true }, (err) => {
        if (err) {
            console.log("dir already exists!");
        }
    });
}


function processFormData(request) {
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
                    ensureDirectoryExistence(targetDir);
                    dirExists = true;
                }
                fs.writeFileSync(targetDir + "/" + item.filename, item.data);
                if (item.type.includes('zip')) {
                    //TODO extract zip and cleanup
                }
            } else {
                console.log('Invalid file type - '+ item.type);
            }
        }
    }
    return result;
}

