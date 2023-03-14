const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require("cors")

var fs = require("fs");
const multer = require('multer');
const { getVar, setVar } = require("./svc/varsSvc")
const { processFormData, deployBuild, sendMail } = require("./svc/funcSvc")

const PORT = process.env.PORT || 5000
var jsonParser = bodyParser.json()


const app = express();
const upload = multer();
const clientPath = path.join(__dirname, 'client/');

app.use(express.static(path.join(__dirname, 'client/build')))
app.use(express.static(path.join(__dirname, 'client/build_bkp')))
app.use(cors())

app.get('/test', (req, res) => {
    res.send('Hello from exp PRISM!')
});

app.get('/*', function (req, res) {
    let file = "index.html"
    let data;
    let buildDir = getVar('BUILD_DIR') || 'build';
    console.log("Current build dir - "+buildDir);

    if (req.url.includes("/configtemplate?ep=")) {
        data = fs.readFileSync(clientPath + "src/config/Config.json");
        let jsonData = JSON.parse(data);
        const configEndPoints = getVar('CONFIG_END_POINTS');
        if(Array.isArray(configEndPoints) && configEndPoints.length == 0){
            setVar('CONFIG_END_POINTS', Object.keys(jsonData));
        }

        res.set('Content-Type', 'application/json');
        res.status(200).json(jsonData[req.query['ep']]);
        return;
    } else if (req.url.endsWith("/templatesinfo")) {

        data = fs.readFileSync(clientPath +"src/config/Config.json");
        let jsonData = JSON.parse(data);
        let templatesInfo = Object.entries(jsonData).map(([key, val] = entry) => {
            return { [key]: val.label };
        });

        res.set('Content-Type', 'application/json');
        res.status(200).json(templatesInfo);
        return
    }

    res.sendFile(path.join(__dirname, 'client/'+buildDir, file));
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));


app.post('/updatetemplate', upload.any(), (req, res) => {
    let buildDir = getVar('BUILD_DIR') || 'build';
    const endPoints = getVar('END_POINTS');

    if (buildDir === 'build_bkp') { // if build_bkp then prev build already in progress
        res.status(400).json({ message: 'Failed, previous deployment in progress, please try after few minutes!' });
    } else {
        const configEndPoints = getVar('CONFIG_END_POINTS');
        if (configEndPoints && configEndPoints.includes(req.query['ep'])) {
            res.status(400).json({ message: 'Existing enpoints are only for reference, enter a different end-point value!' });
        } else {
            const result = processFormData(req); // read body and copy images
            if (result && result['template']) {
                let templatesStr = fs.readFileSync(clientPath+"src/config/Template.json");
                let templates = JSON.parse(templatesStr);

                const mergedTemplates = Object.assign(templates, result['template']);
                try {
                    fs.writeFileSync(clientPath+"src/config/Template.json", JSON.stringify(mergedTemplates, null, 2), 'utf8');
                    console.log('Updated template entry successfully');

                    endPoints.push(req.query['ep']);
                    setVar('END_POINTS', [...new Set(endPoints)]);

                    res.status(200).json({ message: 'Triggerd deployment successfully, may take around 10 minutes to reflect in the templates list.' });
                } catch (err) {
                    console.log(err);
                    res.status(400).json({ message: 'Failed to deploy site, err- ' + err });
                }
            } else {
                res.status(400).json({ message: 'Failed to process the form Data, refer logs for details!' });
            }
        }
    }
    return;
});

app.post('/triggerbuild', jsonParser, (req, res) => {
    console.log("Triggering NPM build for templateEP-", req.query['ep']);
    deployBuild(req.query['ep'], clientPath);
    if(getVar('BUILD_DIR') == 'build'){
        res.status(200).json({ message: 'Build completed successfully for EP '+req.query['ep']});
    }else{
        res.status(400).json({ message: 'Build failed for EP '+req.query['ep']});
    }
    return;
});


app.post('/sendmail', jsonParser, async (req, res) => {
    res = await sendMail(req.body, res);
    return;
})

