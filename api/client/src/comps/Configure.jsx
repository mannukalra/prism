import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ReactJson from 'react-json-view';

async function getConfigTemplate() {
    console.log("getConfigTemplate called! ");
    let url = "/api/configtemplate";//`${window.location.href}configtemplate`;

    const response = await fetch(url);
    const template = await response.json();
    return template;
    // fetch(url, {
    //     method: "GET",
    //     headers: {"Content-type": "application/json", "access-control-allow-origin" : "*"}})
    //     .then(response => {
    //         console.log(response);
    //         response.json();
    //     })
    //     .then(data  =>{
    //         console.log(data);
    //     }).catch(err => {
    //         console.log("Some error occured getConfigTemplate- "+ err);
    // });
}

function publishTemplate(template, file){ 
    const formData = new FormData();
    formData.append('template', JSON.stringify(template));
    formData.append('file', file,  Object.keys(template)[0]+".zip");

    fetch('/api/updatetemplate', {
        method: 'post',
        headers: {'Content-Type': 'multipart/form-data', 'Accept': 'application/json', 'type':'formData'},
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
    const [template, setTemplate] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [errorText, setErrorText] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        ( async() => {
            var templ = await getConfigTemplate();
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
            setErrorText("Invalid Input Attempt!");
        }
    }

    const handleCapture = ( e ) => {
        setFile(e.target.files[0]);
    };

    function triggerPublish(){
        publishTemplate(template, file);
    }

    function getSampleConfig(){
        console.log("inside getSampleConfig");
        getConfigTemplate();
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
                    <Tabs value={selectedIndex} onChange={changeTab} aria-label="Json editor tabs" >
                        <Tab label="Json" key={0} {...a11yProps(0)}/>
                        <Tab label="Raw" key={1} {...a11yProps(1)}/>
                    </Tabs>
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
                        <TextField id="outlined-multiline-flexible" label="At your own risk" name="plain editor"
                            error= {errorText}
                            helperText= {errorText}
                            value={JSON.stringify(template, null, 2)} inputProps={{style: {fontSize: 12}}}
                            onChange={updateTemplateFromRaw} fullWidth multiline />
                        </pre>
                    </div>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={props.closeConfigure} >Cancel</Button>
                <Button variant="outlined" color="inherit" component="label"
                    sx={{ marginLeft: "3rem" }}
                    >Select File
                    <input type="file" hidden onChange={handleCapture} />
                </Button>
                <Button variant="outlined" color="inherit" onClick={triggerPublish} >Publish</Button>
            </DialogActions>
        </Dialog>
    );
}

export default Configure