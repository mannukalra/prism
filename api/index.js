var fs = require("fs")
var mime = require('mime-types')
const nodemailer = require('nodemailer')
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const endPoints = ['/api', '/pnbc', '/o2s', '/simarhunar'];


module.exports = async function (context, req) {
    let file = "index.html"
    let data;

    if ( endPoints.some((ep) => req.url.endsWith(ep))) {
        try {
            data = await readFileAsync(__dirname + "/client/build/" +  file);
            context.log('GET ' + __dirname + "/client/build/" +  file);
            let contentType = mime.lookup(file) 
            context.res = {status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType }};
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {}};  
        }

    } else if (req.url.endsWith("/configtemplate")) {
        data = await readFileAsync(__dirname + "/client/src/Config.json");
        let jsonData = JSON.parse(data);
        context.res = {status: 200, body: jsonData, headers: { 'Content-Type': "application/json" }};
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
                context.res = { status: 200, body:{ message: 'Email sent successfully '+info.response}};
            else
                context.res = { status: 400, body:{ message: 'Failed to send mail! '+info.response} };
        } else {
            context.res = { status: 400, body:{ message: 'Failed to send mail!'} };
        }
        
    } else if (req.url.includes("/api/")) {

        file = req.url.substring(req.url.indexOf("/api/") + 5);
        try {
            data = await readFileAsync(__dirname + "/client/build/" +  file);
            // context.log('GET ' + __dirname + "/client/build/" +  file);
            var contentType = mime.lookup(file) 
            context.res = {status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType }};
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {}};  
        }
        
    }
}


