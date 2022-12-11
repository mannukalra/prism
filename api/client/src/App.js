import Prism from './comps/Prism';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import prismLogo from './prism.png';
import './App.css';
import data from "./Config.json";
import { useEffect, useState } from 'react';
import { CommonContext } from './context/CommonContext';


function links(data){
  return Object.keys(data).map((item, index) => (
    <div key={index} style={{whiteSpace: 'nowrap', marginBottom: ".3rem"}}>
      <Link className="App-link" to={"/api/"+item} target="_blank">
        {data[item].label}
      </Link>
    </div>
  ));
}

function anchors(data){
  return Object.keys(data).map((item, index) => (
    <div key={index} style={{whiteSpace: 'nowrap', marginBottom: ".3rem"}}>
      <a className="App-link" href={data[item].url} target="_blank" rel="noopener noreferrer">
        {data[item].label}
      </a>
    </div>
  ));
}

function routes(data, isMobile){
  return Object.keys(data).map((item, index) => (
      <Route key={"prism-home-"+index} path={"/api/"+item} 
        element={
          <CommonContext.Provider value={{ isMobile }}>
            <Prism page={item} config={data[item]} />
          </CommonContext.Provider>
        }/>
  ));
}

let PrismHome = (isMobile) => {
  return (
    <div className="App" style={{ width: isMobile ? 'fit-content' : 'auto' }} >
      <header className="App-header">
        <p style={{marginLeft: '1rem'}}>
          Welcome to PRISM
        </p>
        <div className='Nav-items'>
          {links(data)}
        </div>
        <img src={prismLogo} className="App-logo" alt="logo" />
        <div style={{marginRight: '1rem'}}>
          {anchors(data)}
        </div>
      </header>
    </div>
  );
};


function App() {
  const [width, setWidth] = useState(window.innerWidth);
  function handleWindowSizeChange() {
      setWidth(window.innerWidth);
  }
  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);

  const isMobile = width <= 840;

  return (
    <BrowserRouter>
      <Routes>
        <Route key="prism-home" path="/api" element={PrismHome(isMobile)} />
        {routes(data, isMobile)}
      </Routes>
    </BrowserRouter>
  );
}


export default App;
