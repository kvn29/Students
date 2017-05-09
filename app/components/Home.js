import React from 'react';
import { withRouter, Link, browserHistory} from 'react-router';
import Cookie from 'react-cookie';
import ProfilActions from './flux/actions/ProfilActions';


class Home extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            msgConfirmation: ''
        };
    }
    
    render() {
        return (
            <div className="container-fluid" style={{marginTop:'70px'}}>
                <div className="row">
                    <div className="col-xs-12 col-centered col-sm-6 col-md-4 col-lg-3">
                        <h4>Se connecter</h4>
                        <br/>
                        <form onSubmit={(e) => this.connect(e)}>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-at"></i>
                                    <input type="email" className="form-control inputLogin" placeholder="Email" ref="email" />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-lock"></i>
                                    <input type="password" className="form-control inputLogin" placeholder="Mot de passe" ref="password"  />
                                </div>
                            </div>
                            {this.state.msgConfirmation}
                            <input type="submit" className="btn btn-primary pull-right submitLogin"/>
                        </form>
                    </div>
                </div>
                <style>{"\
                   body{\
                     background-image:url(img/bg.jpg);\
                     background-position:0px 67px;\
                     background-size:cover;\
                   }\
                "}</style>
            </div>
        );
    }

    connect(event) {
        event.preventDefault();
        const email = this.refs.email.value;
        const password = this.refs.password.value;

        if(email.length > 0 && password.length > 0) {
            ProfilActions.login(email, password,
                (response) => {
                    this.setState({msgConfirmation: 'Veuillez patienter...'});
                    Cookie.save('token', response.token);
                    this.props.router.push('/dashboard');
                },
                (err) => {
                    if(err.status && err.status == 'error') {
                        this.setState({msgConfirmation: err.msg});
                        setTimeout(() => {
                            this.setState({msgConfirmation: ''});
                        }, 2000);
                    }
                }
            );
        }

    }

}

export default withRouter(Home);
