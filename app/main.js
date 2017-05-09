import React from 'react';
import {browserHistory, Router} from 'react-router';
import ReactDOM from 'react-dom';
import routes from './routesFront';
/*
 * Définition du router react isomorphe
 */
ReactDOM.render(<Router history={browserHistory}>{routes}</Router>, document.getElementById('react-app'));
