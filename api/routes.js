const express = require('express'),
    router  = express.Router(),
    ctrlRestricted = require('./controllers/restricted.controllers.js'),
    ctrlAuth = require('./controllers/auth.controllers.js'),
    ctrlRegister = require('./controllers/register.controllers.js');

/*
 * Routes non-protégées  ------------------------
 */
/*
 * Route authentification
 */
router
    .route('/auth')
    .post(ctrlAuth.authentification);
/*
 * Route ajouter un utilisateur
 */
router
    .route('/adduser')
    .post(ctrlRegister.addUser);
/*
 * Route télécharger un fichier
 */
router
    .route('/file/:id_file/:date_file')
    .get(ctrlRestricted.getFile);




/*
 * Routes protégées  ------------------------
 */

/*
 * Route pour savoir si on est connecté
 */
router
    .route('/restricted/isloggedin')
    .get(ctrlRestricted.isLoggedIn);
/*
 * Route pour envoyé un nouveau fichier
 */
router
    .route('/restricted/upload/:fileName/:fileDesc')
    .post(ctrlRestricted.uploadFile);
/*
 * Route pour envoyé une nouvelle iteration d'un fichier
 */
router
    .route('/restricted/uploadsetfile/:id_file')
    .post(ctrlRestricted.uploadSetFile);
/*
 * Route pour recupérer la liste des fichiers
 */
router
    .route('/restricted/files')
    .get(ctrlRestricted.filesList);
/*
 * Route pour supprimé un fichier
 */
router
    .route('/restricted/delete/:id_file')
    .delete(ctrlRestricted.deleteFile);
/*
 * Route pour changer l'email d'un compte
 */
router
    .route('/restricted/changeemail')
    .put(ctrlRestricted.changeemail);
/*
 * Route pour changer le mot de passe d'un compte
 */
router
    .route('/restricted/changepassword')
    .put(ctrlRestricted.changepassword);



module.exports = router;
