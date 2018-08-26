import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import FlowDemo from './pages/Flow';

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={FlowDemo} />
    </div>
  </Router>
);
export default App;
