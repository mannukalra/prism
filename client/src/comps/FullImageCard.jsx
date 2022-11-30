import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { useState } from "react";
import Connect from "./Connect";



function FullImageCard(props){
    const [connectOpen, setConnectOpen] = useState(false);
    const { tab, logoColor } = props;

    const handleOpenConnect = () => {
        setConnectOpen(true);
    };
    
    const handleCloseConnect = () => {
        setConnectOpen(false);
    };

    return (
        <Card sx={{position: "relative", margin: ".7rem" }}>
            <CardMedia
                component="img"
                image={require("../img/"+tab.bgImage)}
                alt="green iguana"
                sx={{position: "absolute", width: "100%", minHeight: "76vh" }}
            />
            <CardContent sx={{position: "relative", color: logoColor, backgroundColor: "rgba(0,0,0,.12)", minHeight: "56vh" }}>
              <Typography variant="h3" fontWeight="720" component="p" sx={{ color: logoColor }} >
                {tab.content}
              </Typography>
            </CardContent>
            <CardActions sx={{position: "relative", alignItems: "center", justifyContent: "center",
                color: logoColor, backgroundColor: "rgba(0,0,0,.12)" }}>
              <Button size="xlarge" color="inherit" variant="outlined" onClick={handleOpenConnect}
                sx={{marginBottom: "7rem", fontSize: '24px', borderWidth: "3px"}}>
                {tab.connectText}
              </Button>
              <Connect 
                label="Get in touch for queries or estimates"
                mailContent={{name: "", contact: "", query: ""}}
                open={connectOpen}
                handleClose={handleCloseConnect}
                tab={tab}
                logoColor={logoColor} />
            </CardActions>
        </Card>
    );
}

export default FullImageCard;