import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";


function triggerMail (to, cc, subject, body, page, closeConnect) {
    console.log("trigger mail called!")
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
                closeConnect();
                alert("Thanks for reaching out, we have recieved your message. \nWe'll connect with you shortly!");
            }else
                alert("Failed to send your connect request mail, please try later, aplogies for inconvinience.");
        })
        .catch(err => {
            console.log(err)
            alert("Some error occured while sending mail, please try later, aplogies for inconvinience.");
    });
}


function Connect(props) {
    const [mailContent, setMailContent] = useState(props.mailContent);

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
            let subject = mailContent.name+" wants to connect with "+props.page+"!"
            let body = "Dear "+props.page+",<br><br>Please reach out "+mailContent.name+" at "+mailContent.contact+" regarding below query:<br>"+(mailContent.query || "Sorry, empty query!!")
            triggerMail(props.tab.to, props.tab.cc, subject, body, props.page, props.handleClose);
        }else{
            console.log("invalid input");
            alert("Please provide at least Name and Contact (Phone number or Email address)!")
        }
    }

    return (
        <Dialog open={props.open} onClose={props.handleClose} maxWidth='lg'>
            <DialogTitle>{props.label}</DialogTitle>
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
            <DialogActions sx={{color: props.logoColor}}>
                <Button variant="outlined" color="inherit" onClick={props.handleClose}>Cancel</Button>
                <Button variant="outlined" color="inherit" onClick={enquire}>Connect</Button>
            </DialogActions>
        </Dialog>
    );

}

export default Connect