import data from "./Config.json";
import { AppBar, Box, Container, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useState } from 'react'


function TabPanel(tabPanelProps) {
    const { children, value, index, ...other } = tabPanelProps;
    
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`prism-tabpanel-${index}`}
        aria-labelledby={`prism-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3, bgcolor: "#E0E0E0", minHeight: '82vh'}}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
}



function a11yProps(index) {
    return {
      id: `prism-tab-${index}`,
      'aria-controls': `prism-tabpanel-${index}`,
    };
}

function tabsList(tabs){
    return tabs.map((tab, index) => (
        <Tab label={tab.name} {...a11yProps(index)} />
    ));
}

function tabsPanelList(tabs, selectedIndex){
    return tabs.map((tab, index) => (
        <TabPanel value={selectedIndex} index={index}>{tab.name}</TabPanel>
    ));
}

function Prism(props) {

    const config = data[props.page];
    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleChange = (event, newSelection) => {
        setSelectedIndex(newSelection);
    };

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
            {/* <TabPanel value={value} index={0}>
                Item One
            </TabPanel>
            <TabPanel value={value} index={1}>
                Item Two
            </TabPanel>
            <TabPanel value={value} index={2}>
                Item Three
            </TabPanel> */}
            {tabsPanelList(config.tabs, selectedIndex)}
        </Box>
    );
}

export default Prism;
