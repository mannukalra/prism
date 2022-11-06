import {Button, Card, CardActions, CardContent, CardMedia, Typography, Paper, Grid } from "@mui/material";
import FullImageCard from "./FullImageCard";


function listItems(list){
    return list.map((item, index) => (
        <Paper key={index} sx={{fontSize: 36, maxWidth: "80%", margin: "1rem", padding: "1.5rem"}}>{item}</Paper>
    ));
}

function SwissComp(props) {
    const { tab, value, index, page, ...other } = props;
    
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`prism-tabpanel-${index}`}
        aria-labelledby={`prism-tab-${index}`}
        {...other}
      >
        {value === index && (
            tab.bgImage ? <FullImageCard tab={tab} page={page} /> :
            <Card sx={{ minHeight: "88vh"}}>
                <CardContent>
                    <Typography variant="h3" component="div">
                        {tab.content}
                    </Typography>
                    
                    {
                        tab.list && 
                        <Grid container 
                            direction="column"
                            alignItems="center"
                            justifyContent="center">
                            {listItems(tab.list)}
                        </Grid>
                    }

                    <Typography variant="body2">
                        {tab.name}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small">Learn More</Button>
                </CardActions>
            </Card>
        )}
      </div>
    );
}

export default SwissComp;