import { AppBar, Box, ButtonBase, Container, Link, Menu, MenuItem, SvgIcon, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useState, useContext, useRef, useEffect } from 'react'
import SwissComp from "./SwissComp";
import { ReactComponent as PhoneMsgIcon } from "../img/icons/phone_msg.svg";
import { ReactComponent as PhoneIcon } from "../img/icons/phone.svg";
import { ReactComponent as MsgIcon } from "../img/icons/msg.svg";
import { ReactComponent as WhatsAppIcon } from "../img/icons/whatsapp-48.svg";
import { CommonContext } from '../context/CommonContext';
import { PageContext } from '../context/CommonContext';
import { Helmet } from "react-helmet-async";
import template from "../config/Template.json";
import Alert from "./Alert";

const phoneOptions = [{label: "Call", icon: <PhoneIcon/>, action: 'tel:+91-', webAction: 'tel:+91-'}, 
                        {label: "Text", icon: <MsgIcon/>, action: 'sms:+91-'}, 
                        {label: "Whatsapp", icon: <WhatsAppIcon/>, action: 'whatsapp://send?text=hello&phone=+91-', webAction: 'https://web.whatsapp.com/send?phone=91' }];

function phoneOptionsList(phone, isMobile){
    return phoneOptions.map((item, index) => (
        <MenuItem component={Link} disabled={!isMobile && !item.webAction} target={ isMobile ? "_self" : "_blank" }
            href={isMobile ? item.action + phone : item.webAction + phone} key={index} >
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

function tabsPanelList(tabs, selectedIndex, page, themeColor, navToTab, itemRef, seoTitle, appBarBGColor){
    return tabs.map((tab, index) => (
        <PageContext.Provider value={{page, seoTitle}} key={index}>
            <SwissComp id={"tabView"+index } tab={tab} selectedIndex={selectedIndex} currIndex={index} themeColor={themeColor}
             navToTab={navToTab}  itemRef={itemRef} isLastItem={index+1 === tabs.length} appBarBGColor={appBarBGColor}/>
        </PageContext.Provider>
    ));
}

function Prism(props) {

    const config = props.config;
    const itemRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { isMobile } = useContext(CommonContext);
    const [alertData, setAlertData] = useState({open: Object.keys(template).includes(props.page), closeParent: false, title: "Hello from PRISM", message: "Congratulations on building your template with us. \n To get rid of this popup window on launch and to make your changes premanent please notify mkmandeepkalra@gmail.com regarding your endpoint!"});
    debugger;
    useEffect(() => {
        if (itemRef && itemRef.current) {
          window.scrollTo({
            top: itemRef.current.offsetTop - 96,
            behavior: "smooth"
          });
        }
    });
    
    const [anchorEl, setAnchorEl] = useState(null);
    const phoneMenuOpen = Boolean(anchorEl);
    const handleHover = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (event, newSelection) => {
        setSelectedIndex(newSelection);
    };

    const navToTab = (index) =>{
        setSelectedIndex(index);
    }

    const handleAlertClose = () => {
        setAlertData({...alertData, open: false});
    }

    return (
        <Box sx={{ width: isMobile ? 'fit-content' : 'auto' }}>
            <AppBar position="sticky" sx={{ background: config.appBarBGColor, height: '84px'}}>
                <Container maxWidth="xl" display="flex">
                    <Box display={"flex"} sx={{justify: "space-between"}} >
                        <Tooltip title={config.label}>
                            <Box component="img" sx={{ height: 84, margin: '7px' }} alt="logo" src={require("../img/"+props.page+"/"+config.logo)} />
                        </Tooltip>
                        <Box sx={{ width: '100%', margin: '2.4rem', borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={selectedIndex} onChange={handleChange}
                                aria-label="prism tabs"
                                textColor="inherit"
                                TabIndicatorProps={{style: {background: config.themeColor, height: '3px'}}}>
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
                            <Menu id="phone-menu" anchorEl={anchorEl} open={phoneMenuOpen} onClose={handleClose} disablePortal={false} disableScrollLock={false}>
                                {phoneOptionsList(config.phone, isMobile)}
                            </Menu>
                        </Box>
                    </Box>
                </Container>
            </AppBar>
            <div>
                {tabsPanelList(config.tabs, selectedIndex, props.page, config.themeColor, navToTab, itemRef, config.seoTitle, config.appBarBGColor)}
            </div>
            <Helmet>
                <title>{config.seoTitle}</title>
                <meta name="description" content={config.seoDesc} />
                <link rel="canonical" href="" />
            </Helmet>
            <Alert alertData={alertData} handleAlertClose={handleAlertClose}></Alert>
        </Box>
    );
}

export default Prism;
