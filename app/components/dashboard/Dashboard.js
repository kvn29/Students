import React from 'react';
import { withRouter, Link} from 'react-router';
import Cookie from 'react-cookie';
import ProfilActions from '../flux/actions/ProfilActions';
import NavigationStore from '../flux/stores/NavigationStore';
import NavigationActions from '../flux/actions/NavigationActions';
import SocketIOClient from 'socket.io-client';
import ActivityBar from './ActivityBar';
import { Button, Modal, OverlayTrigger, popover, ButtonGroup } from 'react-bootstrap';
import TableauDeBord from './TableauDeBord';
import Chat from './Chat';

const encode = require('ent/encode');
const config = require('../../../api/conf/conf').default;
const base64 = require('js-base64').Base64;


class Dashboard extends React.Component
{
    constructor(props) {
        super(props);
        // Création du socket
        this.socket = SocketIOClient(config.server.url, {
            autoConnect: false
        });
        // Initialisation du state
        this.state = {
            sidebarIndex: NavigationStore.getState().sidebarIndex,                  // Index de la sidebar
            openModalManageFiles: NavigationStore.getState().openModalManageFiles,  // Boolean ouverture de la modal de gestion des fichiers
            modalManageFilesTab: 0,                                                 // Index de l'onglet de la modal de gestion des fichiers
            modalConfirmationMsg: '',                                               // Message de confirmation pour un nouveau fichier
            modalConfirmationMsgSetFile: '',                                        // Message de confirmation pour un fichier modifié
            modalFilesList: {},                                                     // Liste des fichiers
            modalSelectedFile: null,                                                // Indicateur du fichier sélectionné
            openModalDeleteFile: false,                                             // Boolean ouverture de la modal suppression de fichier
            modalDeleteFileMsg: '',                                                 // Message de confirmation pour suppression d'un fichier
            modalLoading: false,                                                    // Boolean chargement du processus d'envoi de fichier
            listUser: null,                                                         // Liste des utilisateurs connecté
            listActivity: [],                                                       // Liste des activitées
            logged: false
        }

        this.onChange = this.onChange.bind(this);
    }

    onChange(state) {
        this.setState({
            sidebarIndex: state.sidebarIndex,
            openModalManageFiles: state.openModalManageFiles
        })
    }

    componentDidMount() {
        NavigationStore.listen(this.onChange);
        const account = this.parseJwt();
        // Une fois qu'on est connecté
        this.socket.on('connect', () => {
            // On écoute les changements d'activitées
            this.socket.on('activity', (activity) => {
                this.setState({
                    listActivity: activity
                });
            });
            let date = new Date();
            date.setHours(date.getHours() + 2);
            this.socket.emit('fetchActivity');
            // On déclenche une activitée
            this.socket.emit('newActivity', {
                "activityText": "s\'est connecté",
                "user": account.prenom,
                "date": date.getTime()
            }, () => {});

            this.socket.emit('login', {
                id: account.id,
                prenom: account.prenom
            })

            this.socket.on('listUser', (listUser) => {
                this.setState({
                    listUser: listUser
                });
            });
        });
    }

    componentWillMount() {
        ProfilActions.isLoggedIn(() => {
            // Si on est connecté
            ProfilActions.connect();
            this.setState({
                logged: true
            }, () => {
                this.socket.connect();
            });
        }, (err) => {
            // Sinon on redirige
            ProfilActions.disconnect();
            this.props.router.push('/');
        });
    }

    componentWillUnmount() {
        this.socket.disconnect();
        NavigationStore.unlisten(this.onChange);
    }

    render() {

        // Changement du contenu en fonction de la sidebar
        let contentComponent = null;
        switch(this.state.sidebarIndex) {
            case 0: contentComponent = <TableauDeBord />;
            break;
            case 1: contentComponent = <Chat socket={this.socket} />;
            break;
            case 2: contentComponent = <Files socket={this.socket}/>;
            break;
        }

        // Ce bloc traite la liste des fichiers de la modal pour uploader un fichier
        let listFiles = null;
        if(Object.getOwnPropertyNames(this.state.modalFilesList).length > 0 && typeof this.state.modalFilesList == 'object') {
            listFiles = Object.keys(this.state.modalFilesList).map((key) => {
                return (
                    <li key={key} onClick={() => this.setState({modalSelectedFile: key})} className={"" + (this.state.modalSelectedFile == key ? "active" : "")}>
                        <span className="badge">{this.state.modalFilesList[key].nb}</span>
                        {this.state.modalFilesList[key].name}
                        <img src="img/arrow.png" alt="" className="arrowModal pull-right"/>
                    </li>
                )
            });
        } else if(typeof this.state.modalFilesList == 'string') {
            listFiles = false;
        }

        // Ce bloc traitre la liste des activités sur un fichier
        let listFilesActivity = null;
        if(this.state.modalSelectedFile != null) {
            const token = Cookie.load('token');
            listFilesActivity = this.state.modalFilesList[this.state.modalSelectedFile].activity.map((activity, key) => {
                return (
                    <li key={key}>
                        <a href={"/api/file/" + activity.id_file + '/' + activity.date + '?token='+token}>
                            {activity.description_change} par {activity.prenom_user}<br/>
                            le {this.unixTime(activity.date*1000)}
                            <img src="img/cloud.png" alt="Télécharger" title="Télécharger" className="cloudDownload pull-right"/>
                        </a>
                    </li>
                );
            });
        }


        return (
            <div className="container-fluid" id="wrapper">
                <div className="row">
                    <div className="col-xs-12 col-sm-9 col-md-10 col-lg-10">
                    {contentComponent}
                    </div>
                    <ActivityBar socket={this.socket} listUser={this.state.listUser} listActivity={this.state.listActivity}/>
                </div>
                {/*
                    MODALS
                */}
                <Modal show={this.state.openModalManageFiles} onHide={() => NavigationActions.modalManageFiles(false)} id="modalManageFiles">
                    <Modal.Header closeButton>
                        <Modal.Title>Fichiers</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalFilesBackground">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-xs-12">
                                    <ButtonGroup justified>
                                        <Button href="#" className={(this.state.modalManageFilesTab == 0 ? "active" : "")} onClick={(event) => this.changeTabModal(event, 0)}>Nouveau fichier</Button>
                                        <Button href="#" className={(this.state.modalManageFilesTab == 1 ? "active" : "")} onClick={(event) => this.changeTabModal(event, 1)}>Dernières modifications</Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                            <div className="row">
                                {/*
                                        PREMIER ONGLET
                                */}
                                <div className={"col-xs-12 noPaddingBootstrap " + (this.state.modalManageFilesTab == 0 ? "" : "hidden")}>
                                    <form ref="uploadForm" encType="multipart/form-data" onSubmit={(event) => this.uploadFile(event, 'new')}>
                                        <br/>
                                        <div className="form-group">
                                            <input type="text" name="name" className="form-control" placeholder="Nom du fichier (3 à 20 caractères)" ref="nameNewFile" pattern=".{3,20}" required/>
                                        </div>
                                        <div className="form-group">
                                            <textarea name="desc" className="form-control" placeholder="Description du fichier (3 à 200 caractères)" ref="descNewFile" pattern=".{3,200}" required></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="modalFile" className="label-file" id="labelfile1">Choisir un fichier...</label>
                                            {(this.state.modalLoading) ? (<img src='img/load.gif' className="miniLoad"/>) : ""}
                                            <input type="file" ref="fileNewFile" name="file" id="modalFile" className="input-file" onChange={(event) => this.showFileName(event, '1')}/>
                                            <input type="submit" id="uploadNewFile" className="submitBtn pull-right" ref="button" value="Envoyer le fichier"/>
                                        </div>
                                        <span>{this.state.modalConfirmationMsg}</span>
                                    </form>
                                </div>
                                {/*
                                        SECOND ONGLET
                                */}
                                <div className={"col-xs-12 listFiles noPaddingBootstrap " + (this.state.modalManageFilesTab == 1 ? "" : "hidden")}>
                                    <div className="container-fluid noPaddingBootstrap">
                                        <div className="row noMarginBootstrap">
                                            <div className="col-xs-6 noPaddingBootstrap border">
                                                <ul className="files">
                                                    {listFiles}
                                                    <center><br/>{(listFiles == null ? (<img src="img/load.gif" alt=""/>) : null)}</center>
                                                    <center><br/>{(listFiles == false ? ("Aucun fichier") : null)}</center>
                                                </ul>
                                            </div>
                                            <div className="col-xs-6 noPaddingBootstrap">
                                                <ul className="activity">
                                                    {listFilesActivity}
                                                    <center><br/>{(listFiles == null ? (<img src="img/load.gif" alt=""/>) : null)}</center>
                                                    <center><br/>{(listFiles == false ? ("Aucun fichier") : null)}</center>
                                                </ul>
                                            </div>
                                        </div>
                                        <form ref="uploadForm2" encType="multipart/form-data" onSubmit={(event) => this.uploadFile(event, 'set')}>
                                            <div className={"form-group form-groupSetFile " + (this.state.modalSelectedFile == null ? "hidden" : "")}>
                                                <label htmlFor="modalFile2" className="label-file" id="labelfile2">Choisir un fichier...</label>
                                                {(this.state.modalLoading) ? (<img src='img/load.gif' className="miniLoad"/>) : ""}
                                                <input type="file" ref="fileSetFile" name="fileset" id="modalFile2" className="input-file" onChange={(event) => this.showFileName(event, '2')}/>
                                                <input type="submit" id="uploadNewFile" className="submitBtn pull-right" ref="button" value="Envoyer le fichier"/>
                                                <input type="button" className="deleteBtn pull-right" value="Supprimer le fichier" onClick={() => this.setState({openModalDeleteFile: true})}/>
                                            </div>
                                            <span>{this.state.modalConfirmationMsgSetFile}</span>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
                <Modal show={this.state.openModalDeleteFile} onHide={() => this.setState({openModalDeleteFile: false})} id="modalManageFiles">
                    <Modal.Header closeButton>
                        <Modal.Title>Supprimer le fichier</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalFilesBackground">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-xs-12">
                                Êtes-vous certain de vouloir supprimer ce fichier ?
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <span className="pull-left">{this.state.modalDeleteFileMsg}</span>
                        <Button className="btn btn-danger" onClick={() => this.deleteFile()}>Oui</Button>
                        <Button className="btn" onClick={() => this.setState({openModalDeleteFile: false})}>Non</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    /*
    * Cette méthode sert à changer d'onglet dans la modal d'envoi de fichier
    */
    changeTabModal(event, index) {
        event.preventDefault();
        this.setState({
            modalManageFilesTab: index
        });

        if(index == 1) {
            // On veut que lorsque l'on clique sur "Modifier un fichier", on recharge la liste
            this.loadFilesList();
        }
    }

    /*
    * Cette méthode sert à montrer le nom du fichier que l'on va envoyer
    */
    showFileName(event, inputNb) {
        if(event.target.files && event.target.files.length > 0) {
            document.getElementById('labelfile'+inputNb).innerHTML = event.target.files[0].name;
        }
    }

    /*
    * Cette méthode requete pour récupérer la liste des fichiers
    */
    loadFilesList() {
        const token = Cookie.load('token');
        if(token) {
            let that = this;
            $.ajax({
                url: config.server.url+'api/restricted/files',
                headers: {
                    'Authorization': 'Bearer '+token
                },
                type: 'GET',
                contentType: 'application/json',
                success: function(data) {
                    if(data.length > 0) {
                        // Création liste des fichiers
                        let filesList = {};
                        data.map((item) => {
                            if(typeof filesList[item.id] == 'undefined') {
                                filesList[item.id] = {
                                    id: item.id,
                                    name: item.name,
                                    desc: item.description,
                                    nb: 1,
                                    activity: [{
                                        id_file: item.id_file,
                                        id_user: item.id_user,
                                        name_user: item.name_user,
                                        prenom_user: item.prenom_user,
                                        description_change: item.description_change,
                                        date: item.date,
                                        file: item.file
                                    }]
                                };
                            } else {
                                filesList[item.id].activity.push({
                                    id_file: item.id_file,
                                    id_user: item.id_user,
                                    name_user: item.name_user,
                                    prenom_user: item.prenom_user,
                                    description_change: item.description_change,
                                    date: item.date,
                                    file: item.file
                                });
                                filesList[item.id].nb = filesList[item.id].nb + 1;
                            }
                            // le nb représente le nombre de modification sur le fichier, création inclu
                        });

                        that.setState({
                            modalFilesList: filesList
                        });
                    } else {
                        that.setState({
                            modalFilesList: 'Aucun fichier'
                        });
                    }
                }
            })
        }
    }

    /*
    * Cette méthode sert à uploader un fichier
    */
    uploadFile(event, type) {
        event.preventDefault();
        const token = Cookie.load('token');
        if(token) {
            if(type == 'new') {
                // On envoi un nouveau fichier
                if(this.refs.fileNewFile.files.length > 0
                    && this.refs.nameNewFile.value.length > 0
                    && this.refs.descNewFile.value.length > 0
                ) {
                    let formData = new FormData();
                    formData.append('file', this.refs.fileNewFile.files[0]);
                    // Ici on envoi le token dans le header.
                    // On autorise uniquement les personnes avec token à uploader
                    let that = this;
                    const account = this.parseJwt();
                    const fileName64 = base64.encodeURI(this.refs.nameNewFile.value);
                    const fileDesc64 = base64.encodeURI(this.refs.descNewFile.value);

                    // Etant donné que multer nous bloque l'envoi de données json, on encode en 64 les données
                    // Et on transmet
                    $.ajax({
                        url: config.server.url+'api/restricted/upload/'+fileName64+'/'+fileDesc64,
                    	headers: {
                            'Authorization': 'Bearer '+token,
                        },
                        data: formData,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        beforeSend:function() {
                            that.setState({
                                modalLoading: true
                            });
                        },
                        success: function(data) {
                            that.setState({
                                modalLoading: false
                            });
                            if(data.status == 'ok') {
                                // On notifie dans le flux
                                let date = new Date();
                                date.setHours(date.getHours() + 2);
                                that.socket.emit('newActivity', {
                                    "activityText": "à envoyé un fichier",
                                    "user": account.prenom,
                                    "date": date.getTime()
                                }, (err) => {});

                                // On notifie sur le chat
                                const message = {
                                    idAuthor: account.id,
                                    author: account.prenom,
                                    text: 'À envoyé un nouveau fichier "'+encode(that.refs.nameNewFile.value)+'"',
                                    date: date.getTime(),
                                    token: token
                                };
                                that.socket.emit('newMessage', message, (err) => {});

                                // On remet à zéro la fenetre
                                that.setState({
                                    modalConfirmationMsg: data.msg
                                })
                                setTimeout(() => {
                                    that.setState({
                                        openModalManageFiles: false,
                                        modalManageFilesTab: 0,
                                        modalConfirmationMsg: '',
                                        modalConfirmationMsgSetFile: ''
                                    });
                                    NavigationActions.modalManageFiles(false);
                                }, 1000);
                            } else {
                                that.setState({
                                    modalConfirmationMsg: data.msg
                                });
                            }
                        },
                        error: function(xhr) {
                            that.setState({
                                modalLoading: false
                            });
                        }
                    });
                }


            } else if(type == 'set') {
                // On modifie un fichier
                if(this.refs.fileSetFile.files.length > 0 && this.state.modalSelectedFile > 0) {
                    let formData = new FormData();
                    formData.append('file', this.refs.fileSetFile.files[0]);

                    // Meme principe, on envoi le token pour autoriser l'upload
                    let that = this;
                    const account = this.parseJwt();

                    $.ajax({
                        url: config.server.url+'api/restricted/uploadsetfile/'+that.state.modalSelectedFile,
                    	headers: {
                            'Authorization': 'Bearer '+token,
                        },
                        data: formData,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        beforeSend:function() {
                            that.setState({
                                modalLoading: true
                            });
                        },
                        success: function(data) {
                            that.setState({
                                modalLoading: false
                            });
                            if(data.status == 'ok') {
                                //On notifie dans le flux
                                let date = new Date();
                                date.setHours(date.getHours() + 2);
                                that.socket.emit('newActivity', {
                                    "activityText": "à modifié un fichier",
                                    "user": account.prenom,
                                    "date": date.getTime()
                                }, (err) => {});

                                // On notifie sur le chat
                                const message = {
                                    idAuthor: account.id,
                                    author: account.prenom,
                                    text: 'À modifié le fichier "'+encode(that.state.modalFilesList[that.state.modalSelectedFile].name)+'"',
                                    date: date.getTime(),
                                    token: token
                                };
                                that.socket.emit('newMessage', message, (err) => {});

                                // On remet à zéro la fenetre
                                that.setState({
                                    modalConfirmationMsgSetFile: data.msg
                                })
                                setTimeout(() => {
                                    that.setState({
                                        openModalManageFiles: false,
                                        modalManageFilesTab: 0,
                                        modalConfirmationMsg: '',
                                        modalConfirmationMsgSetFile: ''
                                    });
                                    NavigationActions.modalManageFiles(false);
                                }, 1000);
                            } else {
                                that.setState({
                                    modalConfirmationMsgSetFile: data.msg
                                });
                            }
                        },
                        error: function(xhr) {
                            that.setState({
                                modalLoading: false
                            });
                        }
                    });
                }
            }
        }
    }

    /*
    * Cette méthode sert à supprimer un fichier
    */
    deleteFile() {
        const token = Cookie.load('token');
        const id_file = parseInt(this.state.modalSelectedFile);
        if(token && id_file > 0) {
            let that = this;
            const account = this.parseJwt();

            $.ajax({
                url: config.server.url+'api/restricted/delete/'+id_file,
                headers: {
                    'Authorization': 'Bearer '+token,
                },
                type: 'DELETE',
                success: function(data) {
                    if(data.status == 'ok') {
                        that.setState({modalDeleteFileMsg: data.msg});

                        //On notifie dans le flux
                        let date = new Date();
                        date.setHours(date.getHours() + 2);
                        that.socket.emit('newActivity', {
                            "activityText": "à supprimé un fichier",
                            "user": account.prenom,
                            "date": date.getTime()
                        }, (err) => {});

                        // On notifie sur le chat
                        const message = {
                            idAuthor: account.id,
                            author: account.prenom,
                            text: 'À supprimé le fichier "'+encode(that.state.modalFilesList[that.state.modalSelectedFile].name)+'"',
                            date: date.getTime(),
                            token: token
                        };
                        that.socket.emit('newMessage', message, (err) => {});
                        that.setState({modalSelectedFile: null});
                        that.loadFilesList(); // rechargement de la liste
                        setTimeout(() => {
                            that.setState({
                                openModalManageFiles: false,
                                openModalDeleteFile: false,
                                modalDeleteFileMsg: '',
                                modalManageFilesTab: 0,

                            });
                            NavigationActions.modalManageFiles(false);
                        }, 1000);
                    } else {
                        that.setState({modalDeleteFileMsg: data.msg});
                    }
                }
            });
        }
    }
    /*
     * Cette méthode retourne les informations du compte
     */
    parseJwt() {
        const token = Cookie.load('token');
        if(token) {
            let base64Url = token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        }
    }

    /*
     * Cette méthode retourne un temps lisible
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

export default withRouter(Dashboard);
