import data from "./Config.json";
import { AppBar, Box, Button, Card, CardActions, CardContent, CardMedia, Container, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useState } from 'react'


function TabPanel(tabPanelProps) {
    const { children, heading, bgImage, value, index, ...other } = tabPanelProps;
    
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`prism-tabpanel-${index}`}
        aria-labelledby={`prism-tab-${index}`}
        {...other}
      >
        {value === index && (
        //   <Box sx={{ p: 3, bgcolor: "#E0E0E0", minHeight: '82vh'}}>
        //     <H1>{heading}</H1>
        //     <Typography>{children}</Typography>
        //   </Box>
        <Card sx={{ minHeight: "88vh" }}>
             <CardContent>
             {bgImage &&   
             <CardMedia
                component="img"
                height="720"
                image={require("../img/"+bgImage)}
                alt="green iguana"
                />}
                <Typography variant="h3" component="div">
                    {children}
                </Typography>
                <Typography variant="body2">
                    {heading}
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
        <TabPanel heading={tab.name} bgImage={tab.bgImage} value={selectedIndex} index={index}>{tab.content}</TabPanel>
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
