import React from 'react';
import { withRouter, Link} from 'react-router';
import Cookie from 'react-cookie';
import {LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis} from 'recharts';
import { Button, Modal, OverlayTrigger, popover } from 'react-bootstrap';
import ProfilActions from '../flux/actions/ProfilActions';

const config = require('../../../api/conf/conf').default;


class TableauDeBord extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openModalEmail: false,
            msgConfirmationEmail: '',
            openModalMotdepasse: false,
            msgConfirmationMotdepasse: '',
            account: {}
        };
    }
    render() {
        if(this.state.account) {
            return (
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12">
                            <h1 className="mainTitle">Mon espace</h1>
                            <div className="container-fluid">
                                <div className="row" style={{marginRight: '0px'}}>
                                    <div className="col-xs-12 col-sm-6" style={{padding: '8px'}}>
                                        <div className="tdb_panel">
                                            <center>
                                                <h5>Moyenne par trimestre</h5>
                                            </center>
                                            <hr/>
                                            <div style={{paddingRight:'25px',paddingBottom:'25px'}}>
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <LineChart data={data}>
                                                        <XAxis dataKey="name" padding={{left: 20, right:20}}/>
                                                        <YAxis/>
                                                        <CartesianGrid strokeDasharray="3 3"/>
                                                        <Line type="monotone" dataKey="Premier" stroke="#59cef3" dot={<CustomizedDot/>} style={{opacity: '0.5'}}/>
                                                        <Line type="monotone" dataKey="Second" stroke="#59cef3" dot={<CustomizedDot/>} strokeWidth={2}/>
                                                        <Tooltip/>
                                                        <Legend verticalAlign="top" height={36}/>
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xs-12 col-sm-6" style={{padding: '8px'}}>
                                        <div className="tdb_panel">
                                            <center>
                                                <h5>Moyenne du dernier trimestre</h5>
                                            </center>
                                            <hr/>
                                            <div style={{paddingBottom:'25px'}}>
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <RadarChart outerRadius={90} data={dataRadar}>
                                                        <Radar name="Général" dataKey="B" stroke="#5ac8fb" fill="#5ac8fb" fillOpacity={0.4} />
                                                        <Radar name="Moi" dataKey="A" stroke="#55e4d4" fill="#55e4d4" fillOpacity={0.8} />
                                                        <PolarGrid />
                                                        <Legend />
                                                        <PolarAngleAxis dataKey="subject" />
                                                        <PolarRadiusAxis angle={30} domain={[0, 20]} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xs-12 col-sm-12">
                                        <div className="tdb_panel">
                                            <center>
                                                <h5>Ma fiche étudiant</h5>
                                            </center>
                                            <hr/>
                                            <div className="ficheEtudiant">
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td className="ficheTdLabel">Nom</td>
                                                            <td className="ficheTdValue">{this.state.account.nom}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="ficheTdLabel">Prénom</td>
                                                            <td className="ficheTdValue">{this.state.account.prenom}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="ficheTdLabel">Date d'inscription</td>
                                                            <td className="ficheTdValue">{this.convertDate(this.state.account.dateinscription)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="ficheTdLabel">N°Étudiant</td>
                                                            <td className="ficheTdValue">{this.state.account.numeroetudiant}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <hr />
                                                <input type="button" value="Modifier mon email" className="btnTableauDeBord pull-right" onClick={() => this.setState({openModalEmail: true})}/>
                                                <input type="button" value="Modifier mon mot de passe" className="btnTableauDeBord pull-right" onClick={() => this.setState({openModalMotdepasse: true})}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Modal show={this.state.openModalEmail} onHide={() => this.hideModal()}>
                        <Modal.Header closeButton>
                            <Modal.Title>Modifier mon email</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <table className="modalTable">
                                <tbody>
                                    <tr>
                                        <td><b>Nouvelle adresse email :</b></td>
                                        <td><input type="text" ref="modalEmail_email"/></td>
                                    </tr>
                                    <tr>
                                        <td><b>Mot de passe :</b></td>
                                        <td><input type="password" ref="modalEmail_motdepasse"/></td>
                                    </tr>
                                </tbody>
                            </table>
                        </Modal.Body>
                        <Modal.Footer>
                            <span className="modalConfirmation pull-left">{this.state.msgConfirmationEmail}</span>
                            <Button bsStyle="primary" onClick={(event) => this.setAccountEmail(event)}>Modifier</Button>
                            <Button onClick={() => this.hideModal()}>Annuler</Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={this.state.openModalMotdepasse} onHide={() => this.hideModal()}>
                        <Modal.Header closeButton>
                            <Modal.Title>Modifier mon mot de passe</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <table className="modalTable">
                                <tbody>
                                    <tr>
                                        <td><b>Mot de passe actuel :</b></td>
                                        <td><input type="password" ref="modalMDP_current"/></td>
                                    </tr>
                                    <tr>
                                        <td><b>Nouveau mot de passe :</b></td>
                                        <td><input type="password" ref="modalMDP_new1"/></td>
                                    </tr>
                                    <tr>
                                        <td><b>Répéter le mot de passe :</b></td>
                                        <td><input type="password" ref="modalMDP_new2"/></td>
                                    </tr>
                                </tbody>
                            </table>
                        </Modal.Body>
                        <Modal.Footer>
                            <span className="modalConfirmation pull-left">{this.state.msgConfirmationMotdepasse}</span>
                            <Button bsStyle="primary" onClick={(event) => this.setAccountPassword(event)}>Modifier</Button>
                            <Button onClick={() => this.hideModal()}>Annuler</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        } else {
            return (
                <p>Redirection</p>
            )
        }
    }

    componentDidMount() {
        this.setState({
            account: this.parseJwt()
        });
    }

    /*
     * Cette méthode retourne un temps lisible
     */
    convertDate(date) {
        if(date) {
            date = parseInt(date*1000);
            const options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
            return new Date(date).toLocaleDateString('fr-FR', options);
        }
    }

    /*
     * Cette méthodesert à cacher les modals
     */
    hideModal() {
        this.setState({
            openModalEmail: false,
            openModalMotdepasse: false,
            msgConfirmationEmail: '',
            msgConfirmationMotdepasse: ''
        });
    }

    /*
     * Cette méthode sert à modifier son adresse email avec l'API
     */
    setAccountEmail(event) {
        event.preventDefault();

        const email = this.refs.modalEmail_email.value;
        const motdepasse = this.refs.modalEmail_motdepasse.value;
        const token = Cookie.load('token');

        if(email.length > 0 && motdepasse.length > 0 && token) {
            const body = {
                email: email,
                motdepasse: motdepasse,
                token: token
            };

            fetch(config.server.url+'api/restricted/changeemail', {
            	method: 'PUT',
            	body:    JSON.stringify(body),
            	headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            }).then(res => {return res.json()})
	        .then(json => {
                if(json.status == 'ok') {
                    this.setState({
                        msgConfirmationEmail: json.msg
                    });
                    setTimeout(() => {
                        this.hideModal();
                    }, 1000);
                } else {
                    this.setState({
                        msgConfirmationEmail: json.msg
                    });
                }
            })
            .catch((err) => {
                if(err.status) {
                    ProfilActions.disconnect();
                    this.props.router.push('/');
                }
            });
        }
    }

    /*
    * Cette méthode sert à modifier son mot de passe avec l'API
    */
    setAccountPassword(event) {
        event.preventDefault();

        const current = this.refs.modalMDP_current.value;
        const newMDP = this.refs.modalMDP_new1.value;
        const newMDP2 = this.refs.modalMDP_new2.value;
        const token = Cookie.load('token');

        if(token && current.length > 0 && newMDP.length > 0 && newMDP2.length > 0) {
            if(newMDP == newMDP2) {
                this.setState({
                    msgConfirmationMotdepasse: ''
                });

                const body = {
                    currentMDP: current,
                    newMDP: newMDP,
                    token: token
                };

                fetch(config.server.url+'api/restricted/changepassword', {
                	method: 'PUT',
                	body:    JSON.stringify(body),
                	headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer '+token
                    }
                }).then(res => {return res.json()})
    	        .then(json => {
                    if(json.status == 'ok') {
                        this.setState({
                            msgConfirmationMotdepasse: json.msg
                        });
                        setTimeout(() => {
                            this.hideModal();
                        }, 1000);
                    } else {
                        this.setState({
                            msgConfirmationMotdepasse: json.msg
                        });
                    }
                })
                .catch((err) => {
                    if(err.status) {
                        ProfilActions.disconnect();
                        this.props.router.push('/');
                    }
                });
            }
            else {
                this.setState({
                    msgConfirmationMotdepasse: 'Les mots de passe ne sont pas identiques'
                });
            }
        }
    }

    /*
     * Cette méthode retourne le temps lisible
     */
    parseJwt() {
        const token = Cookie.load('token');
        if(token) {
            let base64Url = token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        }
    }
}
export default withRouter(TableauDeBord);




/*
* Bloc partie graphique
*/
const data = [
    {name: 'Français', Premier: 11, Second: 13},
    {name: 'Anglais', Premier: 13, Second: 16},
    {name: 'Espagnol', Premier: 7, Second: 10},
    {name: 'Histoire', Premier: 10, Second: 13}
];
const dataRadar = [
    { subject: 'Mathématique', A: 13, B: 11, fullMark: 20 },
    { subject: 'Francais', A: 11, B: 13, fullMark: 20 },
    { subject: 'Anglais', A: 16, B: 13, fullMark: 20 },
    { subject: 'Géographie', A: 10, B: 8, fullMark: 20 },
    { subject: 'Physique', A: 9, B: 12, fullMark: 20 },
    { subject: 'Histoire', A: 12, B: 15, fullMark: 20 },
];

const CustomizedDot = React.createClass({
  render () {
    const {cx, cy, stroke, payload, value} = this.props;
    if (value > 10) {
      return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="#55e4d4" viewBox="0 0 1024 1024">
          <path d="M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76zM340.768 295.936c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM686.176 296.704c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM772.928 555.392c-18.752-8.864-40.928-0.576-49.632 18.528-40.224 88.576-120.256 143.552-208.832 143.552-85.952 0-164.864-52.64-205.952-137.376-9.184-18.912-31.648-26.592-50.08-17.28-18.464 9.408-21.216 21.472-15.936 32.64 52.8 111.424 155.232 186.784 269.76 186.784 117.984 0 217.12-70.944 269.76-186.784 8.672-19.136 9.568-31.2-9.12-40.096z"/>
        </svg>
      );
    }
    return (
      <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="#97abcd" viewBox="0 0 1024 1024">
        <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z"/>
      </svg>
    );
  }
});
