import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { PageContext } from "../context/CommonContext";
import Alert from "./Alert";


function triggerMail (to, cc, subject, body, page, handleAlertOpen) {
    console.log("trigger mail called! "+page);
    let _data = { to, cc, subject, body }
    let url = `${window.location.href}sendmail`;
    
    if(url.endsWith(page+"sendmail"))
        url = url.replace(page+"sendmail", "sendmail");
    if(url.endsWith(page+"/sendmail"))
        url = url.replace(page+"/sendmail", "sendmail");

    // url = url.replace('3000', '5000');
    url = url.replace('http:', 'https:');
    console.log("Email endpoint "+url+" if fails try accessing http://www.google.com/accounts/DisplayUnlockCaptcha")
    fetch(url, {
        method: "POST",
        body: JSON.stringify(_data),
        headers: {"Content-type": "application/json",
                "access-control-allow-origin" : "*"}
        })
        .then(response => response.json())
        .then(data  =>{
            console.log(data)
            if('message' in data && data['message'].includes("Email sent successfully")){
                handleAlertOpen({open: true, closeParent: true, title: "Connect request recieved", 
                    message: "Thanks for reaching out, we have received your message. \nWe'll connect with you shortly!"});
            }else{
                handleAlertOpen({open: true, closeParent: false, title: "Something went wrong", 
                    message: "Failed to receive your connect request email, please try later, aplogies for inconvinience."});
            }
        })
        .catch(err => {
            console.log(err);
            handleAlertOpen({open: true, closeParent: false, title: "Unexpected Error", 
                message: "Some error occured while receiving your query by email, please try later, aplogies for inconvinience."});
    });
}


function Connect(props) {
    const [mailContent, setMailContent] = useState(props.mailContent);
    const { page } = useContext(PageContext);

    const [alertData, setAlertData] = useState({open: false, closeParent: false, title: "", message: ""});

    const handleAlertOpen = (data) => {
        if(data){
            setAlertData(data);
        }else{
            setAlertData({...alertData, open: true});
        }
    };

    const handleAlertClose = (closeParent) => {
        setAlertData({...alertData, open: false});
        if(closeParent) props.handleClose();
    };

    function handleChange(e) {
        const { name, value } = e.target;

        switch (name) {
            case 'name':
                setMailContent({ ...mailContent, name: value });
                break;
            case 'contact':
                setMailContent({ ...mailContent, contact: value });
                break;
            case 'query':
                setMailContent({ ...mailContent, query: value });
                break;
            default:
                break;
        }
    }

    function enquire(){
        console.log("inside enquire");
        if(mailContent.name && mailContent.contact){
            let subject = mailContent.name+" wants to connect with "+page+"!"
            let body = "Dear "+page+",<br><br>Please reach out "+mailContent.name+" at "+mailContent.contact+" regarding below query:<br>"+(mailContent.query || "Sorry, empty query!!")
            triggerMail(props.tab.to, props.tab.cc, subject, body, page, handleAlertOpen);
        }else{
            console.log("invalid input");
            handleAlertOpen({open: true, closeParent: false, title: "Invalid input",
                message: "Please provide at least Name and Contact (Phone number or Email address)!"})
        }
    }

    return (
        <Dialog open={props.open} onClose={props.handleClose} maxWidth='lg'>
            <DialogTitle>{ props.tab.connectLabel || "Share below details to connect with us" }</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    sx={{ '& .MuiTextField-root': { m: 1.2, width: '42ch' },
                        display: 'flex', flexDirection: 'column' }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField id="outlined-name" label="Name" name="name" value={mailContent.name} onChange={handleChange} required />
                    <TextField id="outlined-contact" label="Contact" name="contact" value={mailContent.contact} onChange={handleChange} required />
                    <TextField id="outlined-multiline-flexible" label="Message" name="query"
                        rows={8} value={mailContent.query} onChange={handleChange} multiline />
                </Box>
            </DialogContent>
            <DialogActions sx={{color: props.themeColor}}>
                <Button variant="outlined" color="inherit" onClick={props.handleClose}>Cancel</Button>
                <Button variant="outlined" color="inherit" onClick={enquire}>Connect</Button>
            </DialogActions>
            <Alert alertData={alertData} handleAlertClose={handleAlertClose}></Alert>
        </Dialog>
    );

}

export default Connect