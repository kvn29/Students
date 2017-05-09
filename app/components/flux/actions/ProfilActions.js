import Alt from '../alt';
import fetch from 'node-fetch';
import Cookie from 'react-cookie';
const config  = require('../../../../api/conf/conf').default;

/*
* Actions du profil
*/
class ProfilActions {
    constructor() {
        this.generateActions(
            'connect',
            'disconnect'
        );
    }

    /**
     *  Permet de se connecter, retourne un JWT
     */
    login(email, password, success, error) {
        if(email.length > 0 && password.length > 0) {
            var body = {
                email: email,
                password: password
            };
            fetch(config.server.url+'api/auth', {
            	method: 'POST',
            	body:    JSON.stringify(body),
            	headers: { 'Content-Type': 'application/json' }
            }).then(res => {return res.json()})
	        .then(json => {
                if(json.status == 'ok') {
                    success(json);
                    // this.connect();
                } else {
                    error(json);
                }
            })
            .catch((err) => {
                if(err.status) {
                    error({
                        status: 'error',
                        msg: 'Une erreur s\'est produite'
                    });
                }
            });
        }
        else {
            error({
                status: 'error',
                msg: 'Une erreur s\'est produite'
            });
        }
    }

    /**
     * Vérifie que le token en cookie est valide
     */
    isLoggedIn(success, error) {
        const token = Cookie.load('token');
        if(token) {
            fetch(config.server.url+'api/restricted/isloggedin', {
                headers: {
                    'Authorization': 'Bearer '+token
                }
            })
            .then(res => {return res.json()})
            .then(json => {
                if(json.status == 'ok') {
                    success(json);
                } else {
                    Cookie.remove('token');
                    error({
                        status: 'error',
                        msg: 'Une erreur s\'est produiste'
                    });
                }
            }).catch((err) => {
                if(err.status) {
                    Cookie.remove('token');
                    error({
                        status: 'error',
                        msg: 'Une erreur s\'est produite'
                    });
                }
            });
        }
    }

    /**
     * Inscription d'un nouveau couple
     */
    addProfile(account, success, error) {
        fetch(config.server.url+'api/adduser', {
            method: 'POST',
            body:    JSON.stringify(account),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => {return res.json()})
        .then(json => {
            if(json.status == 'ok') {
                success(json);
            } else {
                error();
            }
        }).catch((err) => {
            error();
        })
    }

    connect() {
        this.actions.connect();
    }

    disconnect() {
        this.disconnect();
    }
}
export default Alt.createActions(ProfilActions);
