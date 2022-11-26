import { AppBar, Box, ButtonBase, Container, Link, Menu, MenuItem, SvgIcon, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useState, useContext } from 'react'
import SwissComp from "./SwissComp";
import { ReactComponent as PhoneMsgIcon } from "../img/icons/phone_msg.svg";
import { ReactComponent as PhoneIcon } from "../img/icons/phone.svg";
import { ReactComponent as MsgIcon } from "../img/icons/msg.svg";
import { ReactComponent as WhatsAppIcon } from "../img/icons/whatsapp-48.svg";
import { CommonContext } from '../context/CommonContext';
import { PageContext } from '../context/CommonContext';
import { Helmet } from "react-helmet-async";

const phoneOptions = [{label: "Call", icon: <PhoneIcon/>, action: 'tel:+91-'}, 
                        {label: "Text", icon: <MsgIcon/>, action: 'sms:+91-'}, 
                        {label: "Whatsapp", icon: <WhatsAppIcon/>, action: 'whatsapp://send?text=hello&phone=+91-'}];

function phoneOptionsList(phone){
    return phoneOptions.map((item, index) => (
        <MenuItem component={Link} href={item.action + phone} key={index} >
            <Tooltip title={item.label}>
                <SvgIcon viewBox="0 0 42 42" sx={{ margin: '12px', marginTop: '20px', transform: "scale(1.44)" }}>
                    {item.icon}
                </SvgIcon>
            </Tooltip>
        </MenuItem>
    ));
}

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
    
    const [anchorEl, setAnchorEl] = useState(null);
    const phoneMenuOpen = Boolean(anchorEl);
    const handleHover = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

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
                        <Box>
                            <ButtonBase sx={{height: "max-content"}} onMouseEnter={handleHover}>
                                <SvgIcon viewBox="0 0 42 42" sx={{ margin: '12px', marginTop: '28px', transform: "scale(1.08)" }}>
                                    <PhoneMsgIcon />
                                </SvgIcon>
                                <Typography sx={{ marginTop: '21px' }}>{config.phone}</Typography>
                            </ButtonBase>
                            <Menu id="phone-menu" anchorEl={anchorEl} open={phoneMenuOpen} onClose={handleClose} disablePortal={true}>
                                {phoneOptionsList(config.phone)}
                            </Menu>
                        </Box>
                    </Box>
                </Container>
            </AppBar>
            {tabsPanelList(config.tabs, selectedIndex, props.page, config.logoColor, connectOpen, navToHome)}
            <Helmet>
                <title>{config.seoTitle}</title>
                <meta name="description" content={config.seoDesc} />
                <link rel="canonical" href="" />
            </Helmet>
        </Box>
    );
}

export default Prism;
