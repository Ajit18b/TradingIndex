import logo from "./logo.svg";
import "./App.css";
import DataDownloader from "./download";
import ProfitChart from "./ProfitChart";
import GridDemo from "./ProfitChart";
import BarAnimation from "./BarAnimation";
import TradingIndexChart from "./ProfitChart";

function App() {
  return (
    <div className="App">
      {/* <DataDownloader /> */}
      {/* <GridDemo /> */}
      {/* <BarAnimation /> */}
      <TradingIndexChart />
    </div>
  );
}

export default App;
