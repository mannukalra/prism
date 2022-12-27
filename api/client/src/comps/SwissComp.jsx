import {Button, Card, CardActions, CardContent, Paper, Grid, CardHeader, CardMedia, Typography, AppBar } from "@mui/material";
import { useContext } from "react";
import { PageContext } from "../context/CommonContext";
import FullImageCard from "./FullImageCard";


function textItems(list){
    return list.map((item, index) => (
        <Paper key={index} sx={{fontSize: 36, margin: ".5rem", padding: "1rem", minWidth: "84%"}}>
            <Typography variant="h4" color="text.secondary" component="div" marginLeft="2rem">
                {item}
            </Typography>
        </Paper>
    ));
}

function cardItems(list, page){
    return list.map((item, index) => (
        <Card key={index} sx={{ margin: ".5rem", width: item.src ? item.width ? item.width : "84%": "44%" }}>
            <CardHeader
                title={item.label}
                subheader={item.desc}
            />
            { item.src ?
                <CardMedia component="iframe" title={item.label} height="300" src={item.src} allowFullScreen="allowFullScreen" frameBorder="0" />
              : <CardMedia
                    component="img"
                    height="300"
                    image={require("../img/"+page+"/"+item.image)}
                    alt="Paella dish"
                />
            }
        </Card>
    ));
}

function SwissComp(props) {
    const { tab, selectedIndex, currIndex, logoColor, navToTab, itemRef, isLastItem, appBarBGColor, ...other } = props;
    const { page, seoTitle } = useContext(PageContext); 

    const navToHome = (event) => {
        document.getElementById('tabView0')?.scrollIntoView({ behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth',});
        // event.target.blur();
        document.getElementById('prism-tab-0')?.focus();
        navToTab(0);
    }
    
    return (
      <div
        role="tabpanel"
        id={`prism-tabpanel-${currIndex}`}
        aria-labelledby={`prism-tab-${currIndex}`}
        {...other}
        ref={selectedIndex === currIndex ? itemRef : null}
      >
        {(
            tab.bgImage ? 
            <FullImageCard tab={tab} logoColor={logoColor} page={page} /> :
            <Card sx={{ background: "#E7EBF0", margin: ".7rem" }}>
                <Typography variant="h4" color="text.secondary" sx={{ marginLeft: "3rem", marginTop: "1rem"}}>
                    {tab.name}
                </Typography>
                <CardContent>
                    { tab.content && <Typography variant="h4" color="text.secondary" 
                        component="div" marginLeft="3rem" sx={{whiteSpace: "pre-line"}}>
                        { tab.content }
                    </Typography> }
                    <Grid container 
                            direction={tab.direction ? tab.direction : "column"}
                            alignItems="center"
                            justifyContent="center"
                            sx={{}}>
                        { tab.cardItems && cardItems(tab.cardItems, page) }
                        { tab.textItems && textItems(tab.textItems) }
                    </Grid>
                </CardContent>
                { isLastItem &&
                    <>
                        <CardActions sx={{alignItems: "center", justifyContent: "center"}}>
                            <Button size="xlarge" sx={{color: logoColor, marginBottom: '1.5rem', fontSize: '18px', cursor: 'pointer'}} onClick={navToHome}>Scroll Top</Button>
                        </CardActions>
                        <AppBar position="fixed" sx={{ top: 'auto', bottom: 0, background: appBarBGColor }}>
                            <Typography variant="caption" align="center" >&copy;{"2022 "+seoTitle+"."}</Typography>
                        </AppBar>
                    </>
                }
            </Card>
        )}
      </div>
    );
}

export default SwissComp;