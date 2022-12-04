var fs = require("fs")
var mime = require('mime-types')
const nodemailer = require('nodemailer')
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);


module.exports = async function (context, req) {
    var file = "index.html"
    let data;
    if(req.url.endsWith("/api") || req.url.endsWith("/pnbc") || req.url.endsWith("/o2s")|| req.url.endsWith("/simarhunar")){
        try {
            data = await readFileAsync(__dirname + "/client/build/" +  file);
            context.log('GET ' + __dirname + "/client/build/" +  file);
            var contentType = mime.lookup(file) 
            context.res = {status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType }};
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {}};  
        }
    }else if(req.url.endsWith("/sendmail")){
        console.log(JSON.stringify(req.body));
        //TODO const bodyParser = require('body-parser'); var jsonParser = bodyParser.json()
        var mailOptions = {
            from: 'araidarome@gmail.com',
            to: req.body.to,
            subject: req.body.subject,
            html: req.body.body,
            cc: req.body.cc
            };

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'araidarome@gmail.com',
                pass: Buffer.from("aWt0Ym9ia2Jwa2hwYXdlbg==", 'base64').toString('ascii')
            }
        });
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                context.res = { status: 400, body:{ message: 'Failed to send mail! error '+error}};
            } else {
                console.log('Email sent: ' + info.response);
                context.res = { status: 200, body:{ message: "Email sent successfully "+info.response}};
            }
        });
    }else if(req.url.includes("/api/")){
        file = req.url.substring(req.url.indexOf("/api/") + 5);
        try {
            data = await readFileAsync(__dirname + "/client/build/" +  file);
            context.log('GET ' + __dirname + "/client/build/" +  file);
            var contentType = mime.lookup(file) 
            context.res = {status: 200, body: data, isRaw: true, headers: { 'Content-Type': contentType }};
        } catch (err) {
            context.log.error('ERROR', err);
            context.res = { status: 404, body: "Not Found.", headers: {}};  
        }
        
    }
}

