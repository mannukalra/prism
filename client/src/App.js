import Prism from './comps/Prism';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import prismLogo from './prism.png';
import './App.css';
import main from "./config/Config.json";
import template from "./config/Template.json";
import { useState } from 'react';
import { CommonContext } from './context/CommonContext';
import Configure from './comps/Configure';
import { Button, Grid, Card, CardHeader, CardMedia, Tooltip } from '@mui/material';
import { isMobile } from "react-device-detect";
import { Box } from '@mui/system';

const data = Object.assign(main, template);
const videos = [{title: "Edit template demo", src: "0Kw4ehhaJbg"}, {title: "Template text/json edit deep-dive", src: "0Kw4ehhaJbg"}, {title: "Dummy", src: "2xhQ2xnQwNI"}];

function links(data){
  return Object.keys(data).map((item, index) => (
    <div key={index} style={{whiteSpace: 'nowrap', marginBottom: ".3rem", alignContent: "left"}}>
      <Link className="App-link" to={"/"+item} target="_blank">
        {data[item].label}
      </Link>
    </div>
  ));
}

function anchors(data){
  return Object.keys(data).map((item, index) => (
    <div key={index} style={{whiteSpace: 'nowrap', marginBottom: ".3rem"}}>
      <a className="App-link" href={ data[item].url ? data[item].url : null } target="_blank" rel="noopener noreferrer">
        { data[item].url ? data[item].label : '-'}
      </a>
    </div>
  ));
}

function routes(data){
  return Object.keys(data).map((item, index) => (
      <Route key={"prism-home-"+index} path={"/"+item} 
        element={
          <CommonContext.Provider value={{ isMobile }}>
            <Prism page={item} config={data[item]} />
          </CommonContext.Provider>
        }/>
  ));
}

function videoCards(){
  return videos.map((item, index) => (
    <Card key={index} sx={{ margin: ".5rem", minWidth: isMobile ? "96%" : "63%" }}>
      <CardHeader
        subheader={item.title}
      />
      <CardMedia component="iframe" height="300" src={"https://www.youtube.com/embed/"+item.src} allowFullScreen="allowFullScreen" frameBorder="0" />
    </Card>
  ));
}

let PrismHome = () => {
  const [configureOpen, setConfigureOpen] = useState(false);
  
  function openConfigure(){
    setConfigureOpen(true);
  }

  function closeConfigure(){
    setConfigureOpen(false);
  }

  return (
    <div className="App" style={{ width: isMobile ? 'fit-content' : 'auto', height: "100%" }} >
      <header className="App-header">
        <Grid container style={{maxWidth: "63%"}}>
          <Grid item xl={3} xs={4} style={{marginLeft: isMobile ? "1rem" : "0rem"}}>
            <img src={prismLogo} className="App-logo" alt="logo" />
          </Grid>
          <Grid item xl={9} xs={7}>
            <div flex-direction="column" style={{alignSelf: "flex-start", margin: "2rem"}}>
              <p>
                Welcome to PRISM
              </p>
              <div style={{color: "#61dafb"}}>
                <Tooltip title="Refer existing site templates and build your own in two simple steps.">
                  <Button variant="outlined" color="inherit" onClick={openConfigure} >Build your own website</Button>
                </Tooltip>
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Box border={3} borderColor="#E7B965" sx={{ display: 'flex', flexDirection: 'row', overflowX: 'scroll', scrollbarWidth: '2px' }}>
              {videoCards()}
            </Box>
          </Grid>
        </Grid>
          
        <div className='Nav-items'>
          <header>
            <p>Origin</p>
          </header>
          {links(data)}
        </div>
        <div style={{marginLeft: '3rem', marginRight: '1rem', whiteSpace: 'nowrap'}}>
          <header>
            <p>DNS Fwded</p>
          </header>
          {anchors(data)}
        </div>
      </header>
      {configureOpen && <Configure configureOpen={configureOpen} closeConfigure={closeConfigure}/>}
    </div>
  );
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route key="prism-home" path="" element={PrismHome()} />
        {routes(data)}
      </Routes>
    </BrowserRouter>
  );
}


export default App;
