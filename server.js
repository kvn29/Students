require('babel-register');

const express     = require('express'),
    app         = express(),
    keyConfig   = require('./keyConfig').default,
    http        = require('http'),
    https       = require('https'),
    path        = require('path'),
    bodyParser  = require('body-parser'),
    colors      = require('colors'),
    pool        = require('./app/db'),
    React       = require('react'),
    ReactDOM    = require('react-dom/server'),
    ReactRouter = require('react-router'),
    swig        = require('swig'),
    routesFront = require('./app/routesFront'),
    morgan      = require('morgan'),
    expressJWT  = require('express-jwt'),
    routesAPI   = require('./api/routes'),
    fs          = require('fs'),
    jwt         = require('jsonwebtoken'),
    multer      = require('multer'),
    cors        = require('cors'),
    config      = require('./api/conf/conf').default;

// const optionsHTTPS = {
//     key: fs.readFileSync('clef.pem'),
//     cert: fs.readFileSync('cert.pem')
// };

// Définition du port
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));
app.use(cors({
    origin: [config.server.url],
    credentials: true
}));

/*
 * Définition de la route qui nécessite un token valide
 */
app.use('/api/restricted', expressJWT(keyConfig.jwt));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// Api Routes
app.use('/api', routesAPI);

/*
 * Définition du message d'erreur en cas d'acces à l'API sans autorisation
 */
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({status: 'errortoken', msg: 'Jeton invalide', url: req.url});
    }
});


/*
 * Utilisation du router react isomorphe
 */
app.use((req, res) => {
    ReactRouter.match({
        routes: routesFront.default,
        location: req.url
    }, (err, redirectLocation, renderProps) => {
        if(err) {
            res.status(500).send(err.message);
        }
        else if(redirectLocation) {
            res.status(302).redirect(redirectLocation.pathname + redirectLocation.search);
        }
        else if(renderProps) {
            const html = ReactDOM.renderToString(React.createElement(ReactRouter.RouterContext, renderProps));
            const page = swig.renderFile('views/react.html', {react: html});
            res.status(200).send(page);
        }
        else {
            res.status(404).send('404 Not Found');
        }
    })
});

// Journal des requêtes
app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});

// Démarrage du serveur
// var server = https.createServer(optionsHTTPS, app)
var server = http.createServer(app).listen(app.get('port'), () => {
    console.log(colors.green('Server listening on port %s'), app.get('port'));
});


/*
 * SOCKET IO
 */
const io = require('socket.io')(server);

/*
 * Cette méthode sert à rendre la liste des messages dans le fichier logs/messages.json
 */
var sendMessages = (socket) => {
    fs.readFile('logs/messages.json', 'utf-8', (err, messages) => {
        if(typeof messages != "undefined") {
            messages = JSON.parse(messages);
            io.of("/").emit('messages', messages);
        }
    });
};

/*
 * Cette méthode sert à rendre la liste des activitées dans le fichier logs/activity.json
 */
var sendActivity = (socket) => {
    fs.readFile('logs/activity.json', 'utf-8', (err, activity) => {
        if(typeof activity != "undefined") {
            activity = JSON.parse(activity);
            io.of("/").emit('activity', activity);
        }
    });
};

var users = {};
io.sockets.on('connection', (socket) => {
    var me = false;

    /*
     * Lorsqu'on se connecte
     */
    socket.on('login', (data) => {
        me = data;
        me.id = data.id;

        users[me.id] = me.prenom;
        console.log(colors.blue('User %s connected'), me.prenom);
        io.of("/").emit('listUser', users);
    });

    socket.on('fetchMessages', () => {
        sendMessages(socket);
    });

    socket.on('fetchActivity', () => {
        sendActivity(socket);
    });

    /*
     * Lorsqu'on recoit un nouveau message, on enregistre et on émet le changement
     */
    socket.on('newMessage', (message, callback) => {
        // On vérifie que le token est valid
        jwt.verify(message.token, keyConfig.jwt.secret, function(err, decoded) {
            if(err) {
                io.of("/").emit('messages', {
                    error: 'token invalid'
                });
                return;
            } else {
                fs.readFile('logs/messages.json', 'utf-8', (err, messages) => {
                    if(typeof messages != "undefined") {
                        messages = JSON.parse(messages);
                        messages.push(message);

                        fs.writeFile('logs/messages.json', JSON.stringify(messages, null, 4), (err) => {
                            io.of("/").emit('messages', messages);
                            callback(err);
                        });
                    }
                });
            }
        });
    });
    /*
     * Lorsqu'on revoit une nouvelle activity, on enregistre et on émet le changement
     */
    socket.on('newActivity', (act, callback) => {
        fs.readFile('logs/activity.json', 'utf-8', (err, activity) => {
            if(typeof activity != "undefined") {
                activity = JSON.parse(activity);
                activity.push(act);
                fs.writeFile('logs/activity.json', JSON.stringify(activity, null, 4), (err) => {
                    io.of("/").emit('activity', activity);
                    callback(err);
                });
            }
        });
    });
    /*
     * Lorsqu'on se déconnecte
     */
    socket.on('disconnect', () => {
        if(!me) {
            return false;
        }
        delete users[me.id];
        io.of("/").emit('listUser', users);
        console.log(colors.red('user disconnected'));
    });
});
