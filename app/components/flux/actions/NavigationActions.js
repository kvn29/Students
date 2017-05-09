import Alt from '../alt';

/*
* Actions de navigation
*/
class NavigationActions {
    constructor() {
        this.generateActions(
            'changeTab',
            'modalManageFiles'
        );
    }

    changeTab(index) {
        this.changeTab(index);
    }

    modalManageFiles(value) {
        this.modalManageFiles(value);
    }
}
export default Alt.createActions(NavigationActions);
