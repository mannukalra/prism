
const { PowerShell } = require('node-powershell');

const powershellInstance = async () => {
    const ps = new PowerShell({
        debug: false,
        executableOptions: {
        '-ExecutionPolicy': 'Bypass',
        '-NoProfile': true
        }
    });

    try{
        const buildCommand = PowerShell.command`npm run build --prefix D:\\DND\\VSCode\\prism\\api\\client`;
        const result = await ps.invoke(buildCommand);
        console.log(result);
    } catch (error) {
    console.error(error);
    } finally {
    await ps.dispose();
    }
}

// (async () => {
//     console.log('========== playground ==========');
//     await powershellInstance();
// })();
