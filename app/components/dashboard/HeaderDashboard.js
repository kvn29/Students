import React from 'react';
import { withRouter, Link} from 'react-router';
import Cookie from 'react-cookie';
import NavigationActions from '../flux/actions/NavigationActions';
import ProfilActions from '../flux/actions/ProfilActions';

class HeaderDashboard extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            etudiant: this.parseJwt()
        };
    }

    render() {
        return (
            <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation" id="header">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <Link className="navbar-brand" to="/" id="logo">
                        STUDENTS
                    </Link>
                </div>
                <div className="collapse navbar-collapse navbar-ex1-collapse">
                    <ul className="nav navbar-nav navbar-right top-nav" style={{marginTop: '8px', marginRight:'10px'}}>
                        <li>
                            <button id="manageFiles" className="btn btn-default" onClick={(event) => this.clickOnUploadButton(event)}>Envoyer un fichier</button>
                        </li>
                        <li>
                            <img src="img/etudiant.jpg" alt="" title="Etudiant" id="photoetudiant"/>
                        </li>
                        <li className="hidden-xs">
                            <a>{this.state.etudiant.prenom}</a>
                        </li>
                    </ul>
                    <ul className="nav navbar-nav side-nav">
                        <li>
                            <a href="#" activeClassName="activeLink" className="sidebar-link active" onClick={(event) => this.changeTab(event, 0)}>
                                <i className="fa fa-tachometer fa-lg active"></i>Tableau de bord
                            </a>
                        </li>
                        <li>
                            <a href="#" activeClassName="activeLink" className="sidebar-link" onClick={(event) => this.changeTab(event, 1)}>
                                <i className="fa fa-comments fa-lg"></i>Chat
                            </a>
                        </li>
                        <li>
                            <a href="#" activeClassName="activeLink" className="sidebar-link" onClick={(event) => this.deconnectUser(event)}>
                                <i className="fa fa-sign-out fa-lg"></i>Se déconnecter
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }

    /*
     * Cette méthode sert à se déconnecter
     */
    deconnectUser(event) {
        event.preventDefault();
        this.props.router.push('/');
        ProfilActions.disconnect();

        Cookie.remove('io');
        Cookie.remove('token');
    }

    /*
     * Cette méthode sert à changer de contenu selon la sidebar
     */
    changeTab(event, index) {
        event.preventDefault();
        [].map.call(document.querySelectorAll('a.sidebar-link'), function(el) {
            el.classList.remove('active');
        });
        document.querySelectorAll('a.sidebar-link')[index].classList.add('active');
        NavigationActions.changeTab(index);
    }

    /*
     * Cette méthode déclenche via flux, l'ouverture de la modal de gestion des fichiers
     */
    clickOnUploadButton(event) {
        event.preventDefault();
        NavigationActions.modalManageFiles(true);
    }

    /*
     * Cette méthode retourne les informations du compte
     */
    parseJwt() {
        const token = Cookie.load('token');
        let base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }
}

export default withRouter(HeaderDashboard);
