import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
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


function Configure(props) {
    const x = 100;
    const [template, setTemplate] = useState({});

    useEffect(() => {
        ( async() => {
            var templ = await getConfigTemplate();
            setTemplate(templ);
        })();
    }, []);

    function updateTemplate(result){
        setTemplate(result.updated_src);
    }

    function getSampleConfig(){
        console.log("inside getSampleConfig");
        getConfigTemplate();
    }
    return (
        <Dialog open={props.configureOpen} maxWidth='lg'>
            <DialogTitle>Configure new Web Template</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    sx={{ '& .MuiTextField-root': { m: 1.2, width: '42ch' },
                        display: 'flex', flexDirection: 'column' }} >
                    <TextField id="outlined-name" label="Name" name="name" value={x} required />
                    <ReactJson src={template} 
                        onEdit={updateTemplate} 
                        onAdd={updateTemplate}
                        onDelete={updateTemplate} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={props.closeConfigure} >Cancel</Button>
                <Button variant="outlined" color="inherit" onClick={getSampleConfig} >Validate</Button>
            </DialogActions>
        </Dialog>
    );
}

export default Configure