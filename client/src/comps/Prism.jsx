import { AppBar, Box, Container, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useState } from 'react'
import SwissComp from "./SwissComp";



function a11yProps(index) {
    return {
      id: `prism-tab-${index}`,
      'aria-controls': `prism-tabpanel-${index}`,
    };
}

function tabsList(tabs){
    return tabs.map((tab, index) => (
        <Tab label={tab.name} key={index} {...a11yProps(index)} />
    ));
}

function tabsPanelList(tabs, selectedIndex, page, logoColor, connectOpen, navToHome){
    return tabs.map((tab, index) => (
        <SwissComp tab={tab} value={selectedIndex} index={index} key={index} page={page} 
            logoColor={logoColor} connectOpen={connectOpen} navToHome={navToHome} />
    ));
}

function Prism(props) {

    const config = props.config;
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [connectOpen, setConnectOpen] = useState(false);
    const handleChange = (event, newSelection) => {
        setConnectOpen(false);
        setSelectedIndex(newSelection);
    };

    const navToHome = () =>{
        setConnectOpen(true);
        setSelectedIndex(0);
    }

    return (
        <Box>
            <AppBar position="static" sx={{ background: config.appBarBGColor, height: '84px'}}>
                <Container maxWidth="xl" display="flex">
                    <Box display={"flex"} sx={{justify: "space-between"}} >
                        <Tooltip title={config.label}>
                            <Box component="img" sx={{ height: 84, margin: '7px' }} alt="logo" src={require("../img/"+config.logo)} />
                        </Tooltip>
                        <Box sx={{ width: '100%', margin: '2.4rem', borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={selectedIndex} onChange={handleChange}
                                aria-label="prism tabs"
                                textColor="inherit"
                                TabIndicatorProps={{style: {background: config.logoColor, height: '3px'}}}>
                                {tabsList(config.tabs)}
                            </Tabs>
                        </Box>
                        <Tooltip title="Mobile & Whatsapp +91">
                            <Box component="img" sx={{ height: 28, margin: '21px', marginRight: '10px' }} alt="phone logo" src={require("../img/phone_in_talk.png")} />
                        </Tooltip>
                        <Typography sx={{ marginTop: '21px' }}>{config.phone}</Typography>
                    </Box>
                </Container>
            </AppBar>
            {tabsPanelList(config.tabs, selectedIndex, props.page, config.logoColor, connectOpen, navToHome)}
        </Box>
    );
}

export default Prism;
