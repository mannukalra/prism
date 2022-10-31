import Prism from './comps/Prism';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import prismLogo from './prism.png';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrismHome />} />
        <Route path="/o2s" element={<Prism page="o2s" />} />
        <Route path="/pnbc" element={<Prism page="pnbc" />} />
      </Routes>
    </BrowserRouter>
  );
}


let Nav = () => {
  return (
    <div className='Nav-items'>
      <Link className="App-link" to="/o2s" target="_blank">O2S</Link>
      <br/>
      <Link className="App-link" to="/pnbc" target="_blank">P&BC</Link>
    </div>
  );
}


let PrismHome = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Welcome to PRISM
        </p>
        <Nav />
        <img src={prismLogo} className="App-logo" alt="logo" />
        <div>
          <a className="App-link" href="http://o2s.life" target="_blank" rel="noopener noreferrer">O2S</a>
          <br/>
          <a className="App-link" href="http://pnbc.in" target="_blank" rel="noopener noreferrer">P&BC</a>
        </div>
      </header>
    </div>
  );
};

export default App;
