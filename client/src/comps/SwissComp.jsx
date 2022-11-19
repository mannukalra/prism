import {Button, Card, CardActions, CardContent, Paper, Grid, CardHeader, CardMedia, Typography } from "@mui/material";
import FullImageCard from "./FullImageCard";


function textItems(list){
    return list.map((item, index) => (
        <Paper key={index} sx={{fontSize: 36, margin: ".5rem", padding: ".5rem", minWidth: "84%"}}>
            <Typography variant="h4" color="text.secondary" component="div" marginLeft="2rem">
                {item}
            </Typography>
        </Paper>
    ));
}

function cardItems(list, page){
    return list.map((item, index) => (
        <Card key={index} sx={{ margin: ".5rem", width: "44%" }}>
            <CardHeader
                title={item.label}
                subheader={item.desc}
            />
            <CardMedia
                component="img"
                height="300"
                image={require("../img/"+page+"/"+item.image)}
                alt="Paella dish"
            />
        </Card>
    ));
}

function SwissComp(props) {
    const { tab, value, index, page, logoColor, connectOpen, navToHome, ...other } = props;
    
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`prism-tabpanel-${index}`}
        aria-labelledby={`prism-tab-${index}`}
        {...other}
      >
        {value === index && (
            tab.bgImage ? 
            <FullImageCard tab={tab} page={page} logoColor={logoColor} connectOpen={connectOpen}/> :
            <Card sx={{ minHeight: "85vh", background: "#E7EBF0", margin: ".8rem" }}>
                <CardContent>
                    { tab.content && <Typography variant="h4" color="text.secondary" component="div" marginLeft="3rem">{ tab.content }</Typography> }
                    <Grid container 
                            direction={tab.direction ? tab.direction : "column"}
                            alignItems="center"
                            justifyContent="center"
                            sx={{}}>
                        { tab.cardItems && cardItems(tab.cardItems, page) }
                        { tab.textItems && textItems(tab.textItems) }
                    </Grid>
                </CardContent>
                <CardActions sx={{alignItems: "center", justifyContent: "center"}}>
                    <Button size="large" sx={{color: logoColor}} onClick={navToHome}>Learn More</Button>
                </CardActions>
            </Card>
        )}
      </div>
    );
}

export default SwissComp;