import { AppBar, Box, Container, SvgIcon, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useState, useContext } from 'react'
import SwissComp from "./SwissComp";
import { ReactComponent as PhoneIcon } from "../img/phone_in_talk.svg";
import { CommonContext } from '../context/CommonContext';
import { PageContext } from '../context/CommonContext';

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
        <PageContext.Provider value={{page}} key={index}>
            <SwissComp tab={tab} value={selectedIndex} index={index}
                logoColor={logoColor} connectOpen={connectOpen} navToHome={navToHome} />
        </PageContext.Provider>
    ));
}

function Prism(props) {

    const config = props.config;
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [connectOpen, setConnectOpen] = useState(false);
    const { isMobile } = useContext(CommonContext);

    const handleChange = (event, newSelection) => {
        setConnectOpen(false);
        setSelectedIndex(newSelection);
    };

    const navToHome = () =>{
        setConnectOpen(true);
        setSelectedIndex(0);
    }

    return (
        <Box sx={{ width: isMobile ? 'fit-content' : 'auto' }}>
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
                            <SvgIcon viewBox="0 0 42 42" sx={{ margin: '21px', marginRight: '12px', transform: "scale(1.08)" }}>
                                <PhoneIcon />
                            </SvgIcon>
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
