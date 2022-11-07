import Prism from './comps/Prism';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import prismLogo from './prism.png';
import './App.css';
import data from "./Config.json";

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

function routes(data){
  return Object.keys(data).map((item, index) => (
    <Route key={"prism-home-"+index} path={"/"+item} element={<Prism page={item} config={data[item]} />} />
  ));
}

let PrismHome = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Welcome to PRISM
        </p>
        <div className='Nav-items'>
          {links(data)}
        </div>
        <img src={prismLogo} className="App-logo" alt="logo" />
        <div>
          {anchors(data)}
        </div>
      </header>
    </div>
  );
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route key="prism-home" path="/" element={<PrismHome />} />
        {routes(data)}
      </Routes>
    </BrowserRouter>
  );
}


export default App;
