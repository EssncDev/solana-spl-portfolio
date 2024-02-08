import './App.css';

import GetTokenPrices from './Components/TokenPricing';
import PortfolioValue from './Components/PortfolioStats';
import PortfolioChart from './Components/PortfolioGraph';

function App() {
  return (
    <div className="App">
      <div className='portfolioStats'>
        <div className='sidebar'>
          < GetTokenPrices />
        </div>
        <div className='portfolio'>
          <div className='portfolioHeader'>
            < PortfolioValue /> 
          </div>
          <div className='portfolioChart'>
            < PortfolioChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;