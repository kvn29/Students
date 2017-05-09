import Alt from '../alt';
import NavigationActions from '../actions/NavigationActions';

/*
* Store de navigation
*/
class NavigationStore
{
    constructor() {
        this.bindActions(NavigationActions);
        this.sidebarIndex = 0;
        this.openModalManageFiles = false;
    }

    onChangeTab(index) {
        this.sidebarIndex = index;
    }

    onModalManageFiles(value) {
        this.openModalManageFiles = value;
    }
}

export default Alt.createStore(NavigationStore, 'NavigationStore');
