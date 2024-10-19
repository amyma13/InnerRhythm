import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Login from './login';
import HomePage from './homepage';
import Mood from './mood';
import toptracks from './toptracks';


function App() {
  return (
    <Router>
    <Switch>
      <Route path="/" exact component={Login} />
      <Route path="/homepage" exact component={HomePage} />
      <Route path="/mood" exact component={Mood} />
      <Route path="/toptracks" exact component={toptracks} />
      </Switch>
    </Router>
  );
}

export default App;
