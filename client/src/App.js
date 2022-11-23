import Prism from './comps/Prism';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import prismLogo from './prism.png';
import './App.css';
import data from "./Config.json";
import { useEffect, useState } from 'react';

function links(data){
  return Object.keys(data).map((item, index) => (
    <div key={index}><Link className="App-link" to={"/"+item} target="_blank">{data[item].label}</Link></div>
  ));
}

function anchors(data){
  return Object.keys(data).map((item, index) => (
    <div key={index}><a className="App-link" href={data[item].url} target="_blank" rel="noopener noreferrer">{data[item].label}</a></div>
  ));
}

function routes(data, isMobile){
  return Object.keys(data).map((item, index) => (
    <Route key={"prism-home-"+index} path={"/"+item} element={<Prism page={item} isMobile={isMobile} config={data[item]} />} />
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

  const isMobile = width <= 768;

  return (
    <BrowserRouter>
      <Routes>
        <Route key="prism-home" path="/" element={PrismHome(isMobile)} />
        {routes(data, isMobile)}
      </Routes>
    </BrowserRouter>
  );
}


export default App;
