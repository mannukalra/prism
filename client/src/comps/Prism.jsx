import data from "./Config.json";
import { AppBar, Box, Container, Tab, Tabs, Tooltip } from "@mui/material";
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

function tabsPanelList(tabs, selectedIndex, page, navToHome, logoColor, connectOpen){
    return tabs.map((tab, index) => (
        <SwissComp tab={tab} value={selectedIndex} index={index} key={index} page={page} 
            navToHome={navToHome} logoColor={logoColor} connectOpen={connectOpen} />
    ));
}

function Prism(props) {

    const config = data[props.page];
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
                            <Box component="img" sx={{ height: 84, margin: '7px' }} alt="pnbc logo" src={require("../img/"+config.logo)} />
                        </Tooltip>
                        <Box sx={{ width: '100%', margin: '2.4rem', borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={selectedIndex} onChange={handleChange}
                                aria-label="prism tabs"
                                textColor="inherit"
                                TabIndicatorProps={{style: {background: config.logoColor, height: '3px'}}}>
                                {tabsList(config.tabs)}
                            </Tabs>
                        </Box>
                    </Box>
                </Container>
            </AppBar>
            {tabsPanelList(config.tabs, selectedIndex, props.page, navToHome, config.logoColor, connectOpen)}
        </Box>
    );
}

export default Prism;
