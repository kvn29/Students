import React from 'react';
import { withRouter} from 'react-router';
import Header from './Header';
import HeaderDashboard from './dashboard/HeaderDashboard';
import ProfilStore from './flux/stores/ProfilStore';
import ProfilActions from './flux/actions/ProfilActions';


class App extends React.Component
{
    constructor(props) {
        super(props);
        this.state = ProfilStore.getState();
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        ProfilStore.listen(this.onChange);
    }

    componentWillUnmount() {
        ProfilStore.unlisten(this.onChange);
    }

    onChange(state) {
        // On met à jour le state avec celui du store
        this.setState(state);
    }

    render() {
        let headerSwitch = null;
        if(this.state.connected) {
            headerSwitch = <HeaderDashboard></HeaderDashboard>;
        }
        else {
            headerSwitch = <Header></Header>;
        }

        return (
            <div className='container-fluid noPaddingBootstrap'>
                {headerSwitch}
                {this.props.children}
            </div>
        );
      }
}

export default withRouter(App);
