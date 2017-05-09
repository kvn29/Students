import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import Register from './components/Register';
import Dashboard from './components/dashboard/Dashboard';

/*
 * Définition des routes du router react isomorphe
 */
export default (
    <Route component={App}>
        <Route path='/' component={Home}/>
        <Route path='/register' component={Register}/>
        <Route path='/dashboard' component={Dashboard}/>
    </Route>
);
