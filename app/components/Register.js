import React from 'react';
import { withRouter, Link} from 'react-router';
import ProfilActions from './flux/actions/ProfilActions';
import Cookie from 'react-cookie';


class Register extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            msgConfirmation: ''
        };
    }

    render() {
        return (
            <div className="container" style={{marginTop: '70px'}}>
                <div className="row">
                    <div className="col-centered col-sm-6 col-md-4 col-lg-3">
                        <h4>S'enregistrer</h4>
                        <br/>
                        <form onSubmit={(e) => this.submitForm(e)}>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-at"></i>
                                    <input type="email" ref="email" placeholder="Email" className="form-control" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-user"></i>
                                    <input type="text" ref="nom" placeholder="Nom" className="form-control" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-user"></i>
                                    <input type="text" ref="prenom" placeholder="Prénom" className="form-control" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-lock"></i>
                                    <input type="password" ref="password" placeholder="Mot de passe" className="form-control" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-lock"></i>
                                    <input type="password" ref="password2" placeholder="Répéter le Mot de passe" className="form-control" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="left-inner-addon">
                                    <i className="fa fa-address-card"></i>
                                    <input type="number" ref="numeroetudiant" placeholder="Numéro étudiant" className="form-control" required/>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cours</label>
                                <select ref="courses" className="form-control" required>
                                    <option value="1">Informatique</option>
                                </select>
                            </div>
                            {this.state.msgConfirmation}
                            <input type="submit" value="S'enregistrer" className="btn btn-primary pull-right"/>
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

    /*
    * A la soumission du formulaire
    */
    submitForm(event) {
        event.preventDefault();
        // On vérifie que les mots de passe sont identiques
        if(this.refs.password.value === this.refs.password2.value) {
            const account = {
                email           : this.refs.email.value,
                nom             : this.refs.nom.value,
                prenom          : this.refs.prenom.value,
                password        : this.refs.password.value,
                password2       : this.refs.password2.value,
                courses         : parseInt(this.refs.courses.value),
                numeroetudiant  : parseInt(this.refs.numeroetudiant.value)
            };

            ProfilActions.addProfile(account, (response) => {
                Cookie.save('token', response.token);
                this.props.router.push('/dashboard');
            }, () => {
                this.setState({
                    msgConfirmation: 'Une erreur s\'est produite'
                });
            });
        } else {
            // Mot de passe non identiques
            this.setState({
                msgConfirmation: 'Vérifiez votre mot de passe'
            });
            setTimeout(() => {
                this.setState({
                    msgConfirmation: ''
                });
            }, 1800);
        }
    }
}

export default withRouter(Register);
