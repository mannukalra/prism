import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";


function FullImageCard(props){
    return (
        <Card sx={{position: "relative", minHeight: "84vh", margin: ".7rem"}}>
            <CardMedia
                component="img"
                image={require("../img/"+props.tab.bgImage)}
                alt="green iguana"
                sx={{position: "absolute", width: "100%"}}
            />
            <CardContent sx={{position: "relative", backgroundColor: "transparent", 
                color: "#82B04D", backgroundColor: "rgba(0,0,0,.12)", minHeight: "75vh" }}>
              <Typography gutterBottom variant="h5" component="h2">
                {props.tab.name}
              </Typography>
              <Typography variant="h3" component="p" sx={{ color: "#82B04D" }} >
                {props.tab.content}
              </Typography>
            </CardContent>
            <CardActions sx={{position: "relative", color: "#ffffff", backgroundColor: "rgba(0,0,0,.12)" }}>
              <Button size="small" color="inherit" variant="outlined">
                Share
              </Button>
              <Button size="small" color="inherit" variant="outlined">
                Learn More
              </Button>
            </CardActions>
        </Card>
    );
}

export default FullImageCard;