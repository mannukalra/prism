const nodemailer = require('nodemailer')
var fs = require("fs")
const path = require('path')
const { getVar, setVar } = require("./varsSvc")
const { spawnSync } = require('child_process')


const clientPath = path.join(__dirname, '../client/');


function ensureDirectoryExistence(filePath) {
    fs.mkdirSync(filePath, { recursive: true }, (err) => {
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
        // const body = request.body;
        // const items = multipart.parse(body, boundary);

        for (let item of request.files) {
            if (item.mimetype.includes('application/json') && item.fieldname && item.fieldname == 'template') {
                result['template'] = JSON.parse(item.buffer.toString());
            } else if (item.mimetype.includes('image/') || item.mimetype.includes('zip')) {
                let targetDir = clientPath+"src/img/" + request.query['ep'];
                if (!dirExists) {
                    ensureDirectoryExistence(targetDir);
                    dirExists = true;
                }
                fs.writeFileSync(targetDir + "/" + item.originalname, item.buffer);
                if (item.mimetype.includes('zip')) {
                    //TODO extract zip and cleanup
                }
            } else {
                console.log('Invalid file type - ' + item.mimetype);
            }
        }
    }
    return result;
}

function deployBuild(template, clientAbsPath){
    if (fs.existsSync(clientPath+"build") ){
        if (getVar('BUILD_DIR') == 'build')  {
            fs.rmSync(clientPath+"build_bkp", { recursive: true, force: true });

            fs.renameSync(clientPath+"build", clientPath+"build_bkp", async (err) => {
                if (err) {
                    console.log("failed to rename build dir "+err)
                    return;
                }
            });
        } else {
            fs.rmSync(clientPath+"build", { recursive: true, force: true });
        }
    }
    setVar('BUILD_DIR', 'build_bkp');
    console.log('Triggered Deployment for template '+template+" for clientPath "+clientAbsPath);

    let child;
    try{
        child = spawnSync('npm run build --prefix '+clientAbsPath, { shell: true, encoding : 'utf8' });
        // console.log(child.stdout.toString());
    }catch(error){
        console.log('Error', error);
    }
}


async function sendMail(body, response) {
    console.log('sendmail post request body:', JSON.stringify(body))
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
            response.status(200).json({ message: 'Email sent successfully ' + info.response });
        else
            response.status(400).json({ message: 'Failed to send mail! ' + info.response });
    } else {
        response.status(400).json({ message: 'Failed to send mail!' });
    }
    return response;
}


exports.processFormData = processFormData
exports.deployBuild = deployBuild
exports.sendMail = sendMail
