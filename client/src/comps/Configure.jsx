import { Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, LinearProgress, Link, MenuItem, Tab, Tabs, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import ReactJson from 'react-json-view';
import Alert from "./Alert";
import { isMobile } from "react-device-detect";

const proxy = "";//"http://localhost:5000";

async function fetchConfigTemplate(ep, setTemplate) {
    console.log("fetchConfigTemplate called! ");
    let url = "/configtemplate?ep="+ep;//`${window.location.href}configtemplate`;

    const response = await fetch(proxy+url);
    const template = await response.json();
    if(setTemplate)
        setTemplate(template);
    else
        return template;
}

async function getTemplatesInfo() {
    console.log("getTemplatesInfo called! ");
    let url = "/templatesinfo";

    const response = await fetch(proxy+url);
    const templatesInfo = await response.json();
    console.log(templatesInfo);
    return templatesInfo;
}

async function triggerBuild(endPoint, setBackDropOpen, handleAlertOpen){
    let url = "/triggerbuild?ep="+endPoint;
    
    const response = await fetch(proxy+url, {method: 'post'});
    const buildStatus = await response.json();

    setBackDropOpen(false);
    let closeParent = false;
    let title = "Something went wrong!"
    if(buildStatus['message'] && buildStatus['message'].includes('successfully')){
        closeParent = true;
        title = "Deployment Successful";
    }
    handleAlertOpen({open: true, closeParent, title, message: buildStatus['message']+". Please refresh the page if your end-point/template doesn't reflect on Prism Home!"});
    console.log("buildStatus >>>>>>>>>> ", buildStatus);
}

function publishTemplate(endPoint, template, files, setBackDropOpen, handleAlertOpen){ 
    const formData = new FormData();
    formData.append('template', new Blob([JSON.stringify({[endPoint]: template})], {type: "application/json"}));

    for(let i in files) {
        if(typeof files[i] === 'object'){
            formData.append('images', files[i]); // appending all attachments as images
        }
    };
    let url = "/updatetemplate?ep="+endPoint;
    fetch(proxy+url, { method: 'post', body: formData})
        .then(response => {
            console.log(response);
            return response.json();
        }).then(data  =>{
            data = data['json'] ? JSON.parse(data['json']) : data;
            let title = "Something went wrong!"
            if('message' in data){
                if(data['message'].includes("successfully")){
                    triggerBuild(endPoint, setBackDropOpen, handleAlertOpen);
                }
                console.log(data['message']);
            }else{
                setBackDropOpen(false);
                handleAlertOpen({open: true, closeParent: false, title, message: "Failed to deploy your template, refer logs for details!"});
            }
        })
        .catch(err => {
            console.log(err);
            setBackDropOpen(false);
            handleAlertOpen({open: true, closeParent: false, title: "Unexpected error", message: "Some error occured while deployment, refer logs for details!"});
    });
};

function a11yProps(index) {
    return {
      id: `prism-tab-${index}`,
      'aria-controls': `prism-tabpanel-${index}`,
    };
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


function Configure(props) {
    const [endPoint, setEndPoint] = useState('');
    const [templatesInfo, setTemplatesInfo] = useState([{ 'ss': 'Save Our Soil'}]);
    const [sourceTemplateEP, setSourceTemplateEP] = useState('ss');
    const [template, setTemplate] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [errorText, setErrorText] = useState(null);
    const [files, setFiles] = useState(null);
    const [selectedFileNames, setSelectedFileNames] = useState(null);

    const [backDropOpen, setBackDropOpen] = useState(false);
    const [buildInProgress, setBuildInProgress] = useState(false);
    const [alertData, setAlertData] = useState({open: false, closeParent: false, title: "", message: ""});
    const [epHelperText, setEPHelperText] = useState(null);

    const handleAlertOpen = (data) => {
        if(data){
            setAlertData(data);
        }else{
            setAlertData({...alertData, open: true});
        }
    };

    const handleAlertClose = (closeParent) => {
        setAlertData({...alertData, open: false});
        if(closeParent) props.closeConfigure();
    };

    function handleChange(e) {
        const { name, value } = e.target;
        switch (name) {
            case 'endPoint':
                setEndPoint(value.replace(/[^a-z0-9]/gi, ''));
                if(value) setEPHelperText(null);
                break;
            case 'sourceTemplateEP':
                setSourceTemplateEP(value);
                fetchConfigTemplate(value, setTemplate);
                break;
            default:
                break;
        }

    }

    useEffect(() => {
        ( async() => {
            const tempsInfo = await getTemplatesInfo();
            setTemplatesInfo(tempsInfo);
            const templ = await fetchConfigTemplate(sourceTemplateEP);
            setTemplate(templ);
        })();
    }, [sourceTemplateEP]);

    function updateTemplate(result){
        setTemplate(result.updated_src);
    }

    function updateTemplateFromRaw(e){
        if(isJsonString(e.target.value)){
            setTemplate(JSON.parse(e.target.value));
            setErrorText(null);
        }else{
            setErrorText("Try to Copy/paste valid Json!");
        }
    }

    const handleCapture = ( e ) => {
        setFiles(e.target.files);
        let fileNames = Array.from(e.target.files).map(item =>{
            return item['name'];
        }).join(', ');
        if(fileNames)
            setSelectedFileNames("Selected Files:- "+ fileNames);

        console.log(selectedFileNames);
    };

    function hookTillBuildCompletion(url){
        setBuildInProgress(true);
        try {
            const timer = setInterval(async () => {
              const res = await fetch(proxy+url);
              const respBody = await res.json();//"runtimeStatus": "Completed"
              if( respBody['runtimeStatus'] && respBody['runtimeStatus'] === "Completed"){
                console.log("Build runtimStatus is now Completed, clearing the interval!")
                setBuildInProgress(false);
                clearInterval(timer);
              }
              console.log("Current Build runtimStatus ", respBody['runtimeStatus']);
            }, 30000);
        } catch(e) {
            console.log(e);
        }
    }

    function triggerPublish(){
        if(endPoint){
            setBackDropOpen(true);
            publishTemplate(endPoint, template, files, setBackDropOpen, handleAlertOpen, hookTillBuildCompletion);
            setTimeout(() =>{
                if(backDropOpen){
                    setBackDropOpen(false);
                    handleAlertOpen({open: true, closeParent: true, title: "Request timed out",
                        message: "Unable to receive publish confirmation. Try refreshing page in sometime to verify your template status!"})
                }
            }, 42000);
        }else{
            setEPHelperText("Please provide valid EndPoint value");
        }
    }

    const changeTab = (event, newSelection) => {
        setSelectedIndex(newSelection);
    };

    return (
        <Dialog open={props.configureOpen} fullWidth maxWidth='lg'>
            <DialogTitle>
                <Tooltip placement="top-start"
                    title={<h1>Edit below json content as per your requirements, select multiple images or single zip file with all images and PUBLISH.</h1>}>
                    <p>Configure new Web Template</p>
                </Tooltip>
            </DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ '& .MuiTextField-root': { m: 1.2 },
                        display: 'flex', flexDirection: 'column' }} >
                    <Grid container direction='row' sx={{position: 'fixed', height: '42px'}} >
                        <Tabs value={selectedIndex} onChange={changeTab} aria-label="Json editor tabs" >
                            <Tab label="Json" key={0} {...a11yProps(0)}/>
                            <Tab label="Raw" key={1} {...a11yProps(1)}/>
                        </Tabs>
                        <TextField id="outlined-sourceTemplateEP" label="Source Template" size="small"
                            name="sourceTemplateEP" value={sourceTemplateEP} onChange={handleChange} 
                            sx={{height: '0.5rem', width: isMobile ? '8rem' : '12rem' }} select required >
                                {templatesInfo.map((option) => (
                                    <MenuItem key={Object.keys(option)[0]} value={Object.keys(option)[0]}>
                                        {Object.values(option)[0]}
                                    </MenuItem>
                                ))}
                        </TextField>
                        <Link href={'/'+sourceTemplateEP} target='_blank' variant='caption' >Refer</Link>
                        <TextField id="outlined-endpoint" label="Your EndPoint" name="endPoint" size="small"
                            error={epHelperText} helperText={epHelperText}
                            value={endPoint} onChange={handleChange} sx={{height: '0.5rem', width: isMobile ? '8rem' : '12rem'}} required />
                    </Grid>
                    <Grid style={{marginTop: '3rem'}}>
                        <div role="tabpanel" value={selectedIndex} hidden={selectedIndex !== 0}>
                            <ReactJson src={template} 
                                onEdit={updateTemplate} 
                                onAdd={updateTemplate}
                                onDelete={updateTemplate}
                                displayDataTypes={false}
                                displayObjectSize={false}
                                style={{ marginTop: "1rem" }}/>
                        </div>
                        <div role="tabpanel" value={selectedIndex} hidden={selectedIndex !== 1}>
                            <pre>
                            <TextField id="outlined-multiline-flexible" label="Valid Json only" name="plain editor"
                                error= {errorText}
                                helperText= {errorText}
                                value={JSON.stringify(template, null, 2)} inputProps={{style: {fontSize: 12}}}
                                onChange={updateTemplateFromRaw} fullWidth multiline />
                            </pre>
                        </div>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                { buildInProgress && 
                <Box sx={{ width: '42%' }}>
                    <Tooltip title={<h1>Previous Deployment build is in progress, please wait for completion before next Publish/Deploy!</h1>}>
                        <LinearProgress />
                    </Tooltip>
                </Box>}
                <Button variant="outlined" color="inherit" 
                    onClick={props.closeConfigure} sx={{ marginLeft: "1rem" }}>
                        Cancel
                </Button>
                <Tooltip placement="top-start"
                    title={selectedFileNames ? <h2>{selectedFileNames}</h2> : "Select multiple image files or a single zip file with all images"}>
                    <Button variant="outlined" color="inherit" component="label"
                        sx={{ marginLeft: "3rem" }}
                    >Select Images
                        <input type="file" hidden multiple accept='application/zip, image/jpeg, image/png'
                            acceptCharset='UTF-8' onChange={handleCapture} />
                    </Button>
                </Tooltip>
                <Tooltip title="Will deploy your website, may take few mintues before you could try it out.">
                    <Button variant="outlined" color="inherit" onClick={triggerPublish} >Publish</Button>
                </Tooltip>
            </DialogActions>
            <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={backDropOpen} >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Alert alertData={alertData} handleAlertClose={handleAlertClose}></Alert>
        </Dialog>
    );
}

export default Configure