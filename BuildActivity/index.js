/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 * 
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */

var fs = require("fs")
const path = require('path');
const { PowerShell } = require('node-powershell');
const {getVar, setVar} = require("../svc/varsSvc")

module.exports = async function (context) {
    await triggerBuild(context.bindings.name, context);
    return `Congratulations on building your template for endpoint- ${context.bindings.name}!`;
};


const triggerBuild = async(template, context) => {
    const homePath = path.join(__dirname, '..');
    if (fs.existsSync(homePath + "/client/build")) {
        if (getVar('BUILD_DIR') == 'build') {
            fs.rmSync(homePath + "/client/build_bkp", { recursive: true, force: true });

            fs.renameSync(homePath + "/client/build", homePath + "/client/build_bkp", (err) => {
                if (err) {
                    context.log("failed to rename build dir " + err)
                    return;
                }
            });
        } else {
            fs.rmSync(homePath + "/client/build", { recursive: true, force: true });
        }
    }
    setVar('BUILD_DIR', 'build_bkp');
    context.log('Triggering deployment for template ' + template);

    //initialize PowerShell instance
    const ps = new PowerShell({
        debug: true,
        executableOptions: {
        '-ExecutionPolicy': 'Bypass',
        '-NoExit': true,
        '-NoProfile': true
        }
    });

    try{
        const clientPath = homePath+"\\client";
        // const scriptPath = clientPath+"\\buildClient.ps1"
        context.log("Building NPM on clientPath ------------", clientPath);
        const buildCommand = PowerShell.command`npm run build --prefix ${clientPath}`;
        // const buildCommand = PowerShell.command`Start-Process -FilePath powershell.exe -Args '${scriptPath} ${clientPath}'`
        // const buildCommand = PowerShell.command`Start-Job -ScriptBlock {& ${scriptPath} ${clientPath}}`
        await ps.invoke(buildCommand);
    } catch (error) {
        context.log("build error- ", error);
    } finally {
        // setTimeout(function() {
        await ps.dispose();
        // }, 15000);
    }
}
