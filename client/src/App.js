import Prism from './comps/Prism';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import prismLogo from './prism.png';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      {/* <Nav /> */}
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
    <div className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/o2s">O2S</Link></li>
        <li><Link to="/pnbc">P&BC</Link></li>
      </ul>
    </div>
  );
}


let PrismHome = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={prismLogo} className="App-logo" alt="logo" />
        <p>
          Welcome to PRISM
        </p>
        <a
          className="App-link"
          href="http://o2s.life"
          target="_blank"
          rel="noopener noreferrer"
        >
          O2S
        </a>
        <a
          className="App-link"
          href="http://pnbc.in"
          target="_blank"
          rel="noopener noreferrer"
        >
          P&BC
        </a>
      </header>
    </div>
  );
};

export default App;
