import React from 'react';
import { withRouter, Link} from 'react-router';
import Cookie from 'react-cookie';
import ActivityBar from './ActivityBar';
import ProfilActions from '../flux/actions/ProfilActions';
import { Button, Modal, OverlayTrigger, popover, ButtonGroup } from 'react-bootstrap';

const config  = require('../../../api/conf/conf').default;
const encode  = require('ent/encode');
const Entities = require('html-entities').AllHtmlEntities;
const emoji   = require('node-emoji');
const emojis  = require('./emoji.json');
const entitie = new Entities();


class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.socket = this.props.socket;
        this.state = {
            messages: [],
            account: this.parseJwt(),
            openModalEmoji: false
        };
    }

    componentDidMount() {

        /*
         * Mise en forme du chat, redimensionnement de la partie chat
         */
        let messagesBox = document.getElementById('messagesBox');
        let chatbox = document.getElementById('chatBox');

        messagesBox.style.height = (window.innerHeight - 120) + 'px';
        messagesBox.scrollTop = document.getElementById('messagesBox').scrollHeight;

        if(window.innerWidth <= 767) {
            messagesBox.style.width = window.innerWidth - 30 + 'px';
            chatBox.style.width = window.innerWidth + 'px';
        } else {
            let activityBarWidth = document.getElementById('activityBar').offsetWidth;
            messagesBox.style.width = (window.innerWidth - 220 - activityBarWidth - 30) + 'px';
            chatBox.style.width = (window.innerWidth - 220 - activityBarWidth - 30) + 'px';
        }
        // Si l'utilisateur redimensionne sa fenêtre, on fait de même avec le chat
        window.addEventListener('resize', function(){
            let messagesBox = document.getElementById('messagesBox');
            let chatBox = document.getElementById('chatBox');

            if(messagesBox && chatBox) {
                messagesBox.style.height = (window.innerHeight - 120) + 'px';
                messagesBox.scrollTop = messagesBox.scrollHeight;

                if(window.innerWidth <= 767) {
                    messagesBox.style.width = window.innerWidth - 30 + 'px';
                    chatBox.style.width = window.innerWidth + 'px';
                } else {
                    let activityBarWidth = document.getElementById('activityBar').offsetWidth;
                    messagesBox.style.width = (window.innerWidth - 220 - activityBarWidth - 30) + 'px';
                    chatBox.style.width = (window.innerWidth - 220 - activityBarWidth - 30) + 'px';
                }
            }
        }, true);
        // FIN mise en forme

        /*
         * Réception des messages
         */
        this.socket.on('messages', (messages) => {
            if(messages.error != 'token invalid') {
                this.setState({
                    messages: messages
                });
            } else {
                let date = new Date();
                date.setHours(date.getHours() + 2);

                this.socket.emit('newActivity', {
                    activityText: 's\'est déconnecté',
                    user: this.parseJwt().prenom,
                    date: date.getTime()
                }, () => {
                    this.socket.disconnect();
                    ProfilActions.disconnect();
                    this.props.router.push('/');
                });
            }
        });
        this.socket.emit('fetchMessages');


    }

    render() {
        let messages = null;
        if(typeof this.state.messages != 'undefined') {
            if(Object.keys(this.state.messages).length > 0) {
                messages = this.state.messages.map((message, key) => {
                    if(message.idAuthor == this.state.account.id) {
                        return <li key={key} style={{padding:'8px'}}><span className="messageMe">{message.author} : {emoji.emojify(message.text)}</span></li>
                    } else {
                        return <li key={key} style={{textAlign:'right', padding:'8px'}}><span className="messageOther">{message.author} : {emoji.emojify(message.text)}</span></li>
                    }
                });
                setTimeout(() => {
                    let messagesBox = document.getElementById('messagesBox')
                    messagesBox.scrollTop = messagesBox.scrollHeight;
                }, 100)
            }
        }

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12">
                        <div id="messagesBox">
                        <ul style={{padding: '0'}} className="listMessage">
                        {messages}
                        </ul>
                        </div>
                        <div className="chatBox" id="chatBox">
                            <form onSubmit={(event) => this.addMessage(event)}>
                                <div className="right-inner-addon">
                                    <i className="fa fa-paper-plane-o"></i>
                                    <input type="text" ref="newMessage" id="newMessage" autoComplete="off" className=""  />
                                </div>
                                <a href="#" id="emojiBtn" onClick={() => this.setState({openModalEmoji: true})}>
                                    <img src="img/emoji.png" alt="Emoji" title="Emoji"/>
                                </a>
                                <input type="submit" value="Send" id="newMessageBtn"/>
                            </form>
                        </div>
                    </div>
                </div>
                <Modal show={this.state.openModalEmoji} onHide={() => this.setState({openModalEmoji: false})} id="modalManageFiles">
                    <Modal.Header closeButton>
                        <Modal.Title>Emojis</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalFilesBackground">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-xs-12" id="emojiContent">
                                    {
                                        Object.keys(emojis).map((key, i) => {
                                            return (<a href="#" onClick={(event) => this.addEmoji(event, key)} key={i}>{emojis[key]}</a>)
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }


    /*
    * Cette méthode affiche le code de l'emoji
    */
    addEmoji(event, emojikey) {
        event.preventDefault();
        this.setState({
            openModalEmoji: false
        });
        document.getElementById('newMessage').value += ' :'+emojikey+': ';
    }

    /*
     * Cette méthode sert à envoyer un nouveau message sur le chat
     */
    addMessage(event) {
        event.preventDefault();
        const newMessage = this.refs.newMessage.value;
        // Ici on créé un message, on fait attention à parser le HTML & JS
        let date = new Date();
        date.setHours(date.getHours() + 2);
        const message = {
            idAuthor: this.state.account.id,
            author: this.state.account.prenom,
            text: entitie.encodeNonASCII(newMessage),
            date: date.getTime(),
            token: Cookie.load('token')
        };
        this.refs.newMessage.value = '';
        this.socket.emit('newMessage', message, (err) => {});
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
export default withRouter(Chat);
