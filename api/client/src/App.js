import Prism from './comps/Prism';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import prismLogo from './prism.png';
import './App.css';
import main from "./config/Config.json";
import template from "./config/Template.json";
import { useState } from 'react';
import { CommonContext } from './context/CommonContext';
import Configure from './comps/Configure';
import { Button, Tooltip } from '@mui/material';
import { isMobile } from "react-device-detect";

const data = Object.assign(main, template);

function links(data){
  return Object.keys(data).map((item, index) => (
    <div key={index} style={{whiteSpace: 'nowrap', marginBottom: ".3rem", alignContent: "left"}}>
      <Link className="App-link" to={"/api/"+item} target="_blank">
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
      <Route key={"prism-home-"+index} path={"/api/"+item} 
        element={
          <CommonContext.Provider value={{ isMobile }}>
            <Prism page={item} config={data[item]} />
          </CommonContext.Provider>
        }/>
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
    <div className="App" style={{ width: isMobile ? 'fit-content' : 'auto' }} >
      <header className="App-header">
        <img src={prismLogo} className="App-logo" alt="logo" />
        <div flex-direction="column" style={{alignSelf: "flex-start", marginTop: "12rem"}}>
          <p>
            Welcome to PRISM
          </p>
          <div style={{color: "#61dafb"}}>
            <Tooltip title="Refer existing site templates and build your own in two simple steps.">
              <Button variant="outlined" color="inherit" onClick={openConfigure} >Build your own website</Button>
            </Tooltip>
          </div>
        </div>
        <div className='Nav-items'>
          <header>
            <p>Origin</p>
          </header>
          {links(data)}
        </div>
        <div style={{marginLeft: '3rem', marginRight: '1rem'}}>
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
        <Route key="prism-home" path="/api" element={PrismHome()} />
        {routes(data)}
      </Routes>
    </BrowserRouter>
  );
}


export default App;
