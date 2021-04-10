import { useState } from 'react';

import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { PerformancePage } from './pages/PerformancePage/PerformancePage';

import './App.css';
import { ProcessesPage } from './pages/ProcessesPage/ProcessesPage';

const App = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateInterval, setUpdateInterval] = useState(1000);

  return (
    <BrowserRouter>
      <nav>
        <Link to="/processes">
          <button>Processes</button>
        </Link>
        <Link to="/performance/cpu">
          <button className="active">Performance</button>
        </Link>
        <Link to="/services">
          <button>Services</button>
        </Link>
      </nav>
      <main style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <Switch>
          <Route path="/performance">
            <PerformancePage updateInterval={updateInterval} />
          </Route>
          <Route path="/processes">
            <ProcessesPage {...{ updateInterval }} />
          </Route>
          <Route>
            Not found
          </Route>
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
