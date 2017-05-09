import Alt from '../alt';
import ProfilActions from '../actions/ProfilActions';

/*
* Store du profil
*/
class ProfilStore
{
    constructor() {
        this.bindActions(ProfilActions);
        this.connected = false;
    }

    onConnect() {
        this.connected = true;
    }

    onDisconnect() {
        this.connected = false;
    }
}

export default Alt.createStore(ProfilStore, 'ProfilStore');
