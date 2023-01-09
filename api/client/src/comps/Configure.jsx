import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Link, MenuItem, Tab, Tabs, TextField, Tooltip } from "@mui/material";
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

function publishTemplate(endPoint, template, files){ 
    const formData = new FormData();
    formData.append('template', new Blob([JSON.stringify({[endPoint]: template})], {type: "application/json"}));

    for(let i in files) {
        if(typeof files[i] === 'object'){
            formData.append('images', files[i]); // appending all attachments as images
        }
    };
    let url = "/api/updatetemplate?ep="+endPoint;
    fetch(url, {
        method: 'post',
        body: formData
    });
    //TODO handle response
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

    function handleChange(e) {
        const { name, value } = e.target;
        switch (name) {
            case 'endPoint':
                setEndPoint(value);
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
    };

    function triggerPublish(){
        publishTemplate(endPoint, template, files);
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
                            sx={{height: '0.5rem', width: '12rem' }} select required >
                                {templatesInfo.map((option) => (
                                    <MenuItem key={Object.keys(option)[0]} value={Object.keys(option)[0]}>
                                        {Object.values(option)[0]}
                                    </MenuItem>
                                ))}
                        </TextField>
                        <Link href={'/api/'+sourceTemplateEP} target='_blank' variant='caption' >Refer</Link>
                        <TextField id="outlined-endpoint" label="Your EndPoint" name="endPoint" size="small"
                            value={endPoint} onChange={handleChange} sx={{height: '0.5rem'}} required />
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
                <Tooltip title="Select multiple image files or a single zip file with all images">
                    <Button variant="outlined" color="inherit" component="label"
                        sx={{ marginLeft: "3rem" }}
                    >Select Images
                        <input type="file" hidden multiple accept='application/zip, image/jpeg, image/png' acceptCharset='UTF-8' onChange={handleCapture} />
                    </Button>
                </Tooltip>
                <Tooltip title="Will deploy your website, may take few mintues before you could try it out.">
                    <Button variant="outlined" color="inherit" onClick={triggerPublish} >Publish</Button>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default Configure