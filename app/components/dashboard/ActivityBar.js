import React from 'react';
import { withRouter, Link} from 'react-router';


class ActivityBar extends React.Component
{
    constructor(props) {
        super(props);
    }

    render() {
        let listeUser = <li></li>;
        let listeActivity = <li></li>;

        // Si on a des utilisateurs
        if(this.props.listUser !== null) {
            if(Object.keys(this.props.listUser).length > 0) {
                listeUser = Object.keys(this.props.listUser).map((key, val) => {
                    return <li key={key}><img src="img/etudiant.jpg" /> {this.props.listUser[key]}</li>
                });
            }
        }

        // Si on a des utilisateurs
        if(typeof this.props.listActivity == 'object'
            && this.props.listActivity != "undefined"
            && this.props.listActivity.length > 0
        ) {
                let listSorted = this.props.listActivity.sort((a,b) => b.date - a.date);
                if (listSorted.length > 8) listSorted = listSorted.slice(0, 8);
                listeActivity = listSorted.map((activity, key) => {
                    return <li key={key}>{activity.user} {activity.activityText}<br/>{this.unixTime(activity.date)}</li>
                });
        }

        return (
            <div className="hidden-xs col-sm-3 col-md-2 col-lg-2 listUsers noPaddingBootstrap" id="activityBar">
                <center>
                    <h3>Etudiants en ligne</h3>
                </center>
                <div className="scrollUserList">
                    <ul className="listUsers_list">
                        {listeUser}
                    </ul>
                </div>
                <center>
                    <h3>Activités récentes</h3>
                </center>
                <div className="scrollUserList" style={{height:'100%'}}>
                    <ul className="listUsers_list">
                        {listeActivity}
                    </ul>
                </div>
                <button id="manageFiles" className="hidden-xs">Uploader un fichier</button>
            </div>

        )
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

    /*
     * Cette méthode retourne le temps lisible
     */
    unixTime(unixtime) {
        let u = new Date(unixtime);
        return ('0' + u.getUTCDate()).slice(-2) +
            '/' + ('0' + u.getUTCMonth()).slice(-2) +
            '/' + u.getUTCFullYear() +
            ' ' + ('0' + u.getUTCHours()).slice(-2) +
            ':' + ('0' + u.getUTCMinutes()).slice(-2) +
            ':' + ('0' + u.getUTCSeconds()).slice(-2);
    };

}

export default withRouter(ActivityBar);
