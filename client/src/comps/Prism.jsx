import data from "./Config.json";
import { AppBar, Box, Container, Tooltip } from "@mui/material";
// import { useEffect, useState } from 'react'


function Prism(props) {

    const config = data[props.page];
    // const [image, setImage] = useState(null)
    // useEffect(() => {
    //     const fetchImage = async () => {
    //         try {
    //             const response = await import(`../img/${config.logo}`)
    //             setImage(response.default)
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     }
    //     fetchImage()
    // }, [config.logo]);

    return (
        <AppBar position="static" sx={{ background: config.appBarBGColor, height: 63}}>
            <Container maxWidth="xl" display="flex">
                <Box display={"flex"} sx={{justify: "space-between"}} >
                    <Tooltip title={config.label}>
                        <Box component="img" sx={{ height: 72, margin: '6px' }} alt="pnbc logo" src={require("../img/"+config.logo)} />
                    </Tooltip>
                </Box>
            </Container>
        </AppBar>
    );
}

export default Prism;
