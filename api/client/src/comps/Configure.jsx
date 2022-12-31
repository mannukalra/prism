import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Link, MenuItem, Tab, Tabs, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ReactJson from 'react-json-view';


async function fetchConfigTemplate(ep, setTemplate) {
    console.log("fetchConfigTemplate called! ");
    let url = "/api/configtemplate?ep="+ep;//`${window.location.href}configtemplate`;

    const response = await fetch(url);
    const template = await response.json();
    if(setTemplate)
        setTemplate(template);
    else
        return template;
}

async function getTemplatesInfo() {
    console.log("getTemplatesInfo called! ");
    let url = "/api/templatesinfo";

    const response = await fetch(url);
    const templatesInfo = await response.json();
    console.log(templatesInfo);
    return templatesInfo;
}

function publishTemplate(template, files){ 
    const formData = new FormData();
    formData.append('template', new Blob([JSON.stringify(template)], {type: "application/json"}));

    for(let i in files) {
        formData.append('images', files[i]); // appending image one by one for the same key
    };
    // formData.append('file', file,  Object.keys(template)[0]+".zip");

    fetch('/api/updatetemplate', {
        method: 'post',
        headers: {'Accept': 'application/json', 'type':'formData'},
        body: formData
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
    const [endpoint, setEndpoint] = useState('demo');
    const [templatesInfo, setTemplatesInfo] = useState([{ 'ss': 'Save Our Soil'}]);
    const [sourceTemplateEP, setSourceTemplateEP] = useState('ss');
    const [template, setTemplate] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [errorText, setErrorText] = useState(null);
    const [files, setFiles] = useState(null);

    function handleChange(e) {
        const { name, value } = e.target;
        switch (name) {
            case 'endpoint':
                setEndpoint(value);
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
    }, []);

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
    };

    function triggerPublish(){
        publishTemplate(template, files);
    }

    function getSampleConfig(){
        console.log("inside getSampleConfig");
        fetchConfigTemplate();
    }

    const changeTab = (event, newSelection) => {
        setSelectedIndex(newSelection);
    };

    return (
        <Dialog open={props.configureOpen} fullWidth maxWidth='lg'>
            <DialogTitle>Configure new Web Template</DialogTitle>
            <DialogContent>
                <Box component="form"
                    sx={{ '& .MuiTextField-root': { m: 1.2 },
                        display: 'flex', flexDirection: 'column' }} >
                    <Grid container direction='row' sx={{position: 'fixed', height: '42px'}} >
                        <Tabs value={selectedIndex} onChange={changeTab} aria-label="Json editor tabs" >
                            <Tab label="Json" key={0} {...a11yProps(0)}/>
                            <Tab label="Raw" key={1} {...a11yProps(1)}/>
                        </Tabs>
                        <TextField id="outlined-sourceTemplateEP" label="Source Template" size="small"
                            name="sourceTemplateEP" value={sourceTemplateEP} onChange={handleChange} 
                            sx={{height: '0.5rem', width: '12rem' }} select required >
                                {templatesInfo.map((option) => (
                                    <MenuItem key={Object.keys(option)[0]} value={Object.keys(option)[0]}>
                                        {Object.values(option)[0]}
                                    </MenuItem>
                                ))}
                        </TextField>
                        <Link href={'/api/'+sourceTemplateEP} target='_blank' variant='caption' >Refer</Link>
                        <TextField id="outlined-endpoint" label="Your EndPoint" name="endpoint" size="small"
                            value={endpoint} onChange={handleChange} sx={{height: '0.5rem'}} required />
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
                <Button variant="outlined" color="inherit" onClick={props.closeConfigure} >Cancel</Button>
                <Button variant="outlined" color="inherit" component="label"
                    sx={{ marginLeft: "3rem" }}
                    >Select File
                    <input type="file" hidden multiple accept='application/zip, image/jpeg, image/png' onChange={handleCapture} />
                </Button>
                <Button variant="outlined" color="inherit" onClick={triggerPublish} >Publish</Button>
            </DialogActions>
        </Dialog>
    );
}

export default Configure