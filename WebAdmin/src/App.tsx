import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthRouter from './app/router/authRouter';

const RoutesComponent = () => {
  return (
    <Router>
      <AuthRouter />
    </Router>
  );
};

export default RoutesComponent;