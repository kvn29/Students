const multer        = require('multer'),
    pool            = require('../../app/db'),
    passwordHash    = require('password-hash'),
    jwt             = require('jsonwebtoken'),
    base64          = require('js-base64').Base64,
    mime            = require('mime'),
    keyConfig       = require('../../keyConfig').default,
    path            = require('path'),
    fs              = require('fs');


// Settings pour l'envoi de fichier
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-'+Date.now() + '.' + mime.extension(file.mimetype));
    }
});
const upload = multer({storage : storage}).single('file');
// FIN Settings


/*
* Cette méthode sert à vérifier qu'on est bien connecté
*/
module.exports.isLoggedIn = (req, res) => {
    res.json({status: 'ok'});
}


/*
* Cette méthode sert à envoyer un fichier
*/
module.exports.uploadFile = (req, res) => {

    const fileName = base64.decode(req.params.fileName);
    const fileDesc = base64.decode(req.params.fileDesc);
    const token    = req.headers.authorization.substring(7, req.headers.authorization.length);
    const account  = jwt.decode(token);

    if(typeof fileName == 'undefined' || typeof fileDesc == 'undefined') {
        return res.json({status: 'error', msg: 'Une erreur s\'est produite'});
    }

    //On vérifie que le nom du fichier n'existe pas
    pool.query('SELECT COUNT(id) AS fileexist FROM public.files WHERE name = ($1)', [fileName], (err, result) => {
        if(err) {
            return res.status(500).json(err);
        }

        // Si aucun fichier ne porte ce nom
        if(result.rows[0].fileexist == 0) {
            pool.query('INSERT INTO public.files(name,description) VALUES (($1), ($2)) RETURNING id;', [fileName, fileDesc], (err2, result2) => {
                if(err2) {
                    return res.status.json(err2);
                }
                let date = new Date();
                date.setHours(date.getHours() + 2);

                date = Math.floor(date.getTime() / 1000);
                // Une fois que le fichier est créé, on créé aussi une activité sur ce fichier
                pool.query('INSERT INTO public.files_activity(id_file,id_user,name_user,prenom_user,description_change,date,file) VALUES(($1), ($2), ($3), ($4), ($5), ($6), ($7))', [
                    result2.rows[0].id,
                    account.id,
                    account.nom,
                    account.prenom,
                    'Création du fichier',
                    date,
                    ''
                ], (err3, result3) => {
                    if(err3) {
                        return res.status(500).json(err3);
                    }

                    // On upload le fichier
                    upload(req, res, (err4) => {
                        if(err4) {
                            return res.end('Error uploading file');
                        }

                        const filename = req.file.filename;

                        // On enregistre le nom du fichier
                        pool.query('UPDATE public.files_activity SET file = ($1) WHERE id_file = ($2) AND date = ($3)', [filename, result2.rows[0].id, date], (err5, result4) => {
                            if(err5) {
                                return res.json(err5);
                            }

                            return res.json({
                                status: 'ok',
                                msg: 'Fichier uploadé'
                            });

                        });
                    });
                });
            });
        } else {
            return res.json({
                'status': 'error',
                'msg': 'Un fichier porte déjà ce nom'
            });
        }
    });
}


/*
* Cette méthode sert à envoyer une nouvelle version d'un fichier
*/
module.exports.uploadSetFile = (req, res) => {
    const token    = req.headers.authorization.substring(7, req.headers.authorization.length);
    const account  = jwt.decode(token);
    const id_file  = parseInt(req.params.id_file);

    if(typeof id_file == 'undefined') {
        return res.json({status: 'error', msg: 'Une erreur s\'est produite'});
    }

    // On upload le fichier
    upload(req, res, (err) => {
        if(err) {
            return res.end('Error uploading file');
        }

        const filename = req.file.filename;
        let date = new Date();
        date.setHours(date.getHours() + 2);
        // On enregistre le nom du fichier
        pool.query('INSERT INTO public.files_activity(id_file,id_user,name_user,prenom_user,description_change,date,file) VALUES(($1), ($2), ($3), ($4), ($5), ($6), ($7))', [
            id_file,
            account.id,
            account.nom,
            account.prenom,
            'Modification du fichier',
            Math.floor(date.getTime() / 1000),
            filename
        ],
        (err2, result) => {
            if(err2) {
                return res.json(err2);
            }

            return res.json({
                status: 'ok',
                msg: 'Fichier uploadé'
            });

        });
    });
};


/*
* Cette méthode sert à récupérer la liste des fichiers
*/
module.exports.filesList = (req, res) => {
    pool.query('SELECT * FROM public.files fl LEFT JOIN public.files_activity act ON (fl.id = act.id_file) ORDER BY act.date ASC', [], (err, result) => {
        if(err) {
            return res.status(500).json(err);
        }

        return res.json(result.rows);
    });
};


/*
* Cette méthode sert à changer son adresse email
*/
module.exports.changeemail = (req, res) => {
    if(typeof req.body.email == 'undefined'
        || typeof req.body.motdepasse == 'undefined'
        || typeof req.body.token == 'undefined'
    ) {
        return res.status(500).json({status: 'error', msg: 'Une erreur s\'est produite'});
    }

    const decodedToken = jwt.decode(req.body.token);
    const accountID = decodedToken.id;

    // On regarde si les identifiants sont corrects
    pool.query('SELECT password FROM public.users WHERE id = ($1)', [accountID], (err, result) => {
        if(err) {
            return res.status(500).json(err);
        }

        // Si le mot de passe est correct, on passe a la requete suivante
        if(result.rows.length > 0 && passwordHash.verify(req.body.motdepasse, result.rows[0].password)) {

            // On regarde si la nouvelle adresse email n'est pas déjà utilisé par un autre compte
            pool.query('SELECT COUNT(id) AS countEmailUse FROM public.users WHERE id <> ($1) AND email = ($2)', [accountID, req.body.email], (err2, result2) => {
                if(err2) {
                    return res.status(500).json(err2);
                }

                // Si cette adresse n'est pas utilisée
                if(result2.rows[0].countemailuse == 0) {
                    // Modification de l'adresse email
                    pool.query('UPDATE public.users SET email = ($1) WHERE id = ($2)', [req.body.email, accountID], (err3, result3) => {
                        if(err3) {
                            return res.status(500).json(err3);
                        }

                        res.json({
                            status: 'ok',
                            msg: 'Email modifié avec succès'
                        });
                    });
                }
                else {
                    return res.json({
                        status: 'error',
                        msg: 'Cette adresse est déjà utilisée'
                    });
                }
            });
        }
        else {
            return res.json({
                status: 'error',
                msg: 'Mot de passe incorrect'
            });
        }
    });
};


/*
* Cette méthode sert à changer son mot de passe
*/
module.exports.changepassword = (req, res) => {
    if(typeof req.body.currentMDP == 'undefined'
        || typeof req.body.newMDP == 'undefined'
        || typeof req.body.token == 'undefined'
    ) {
        return res.status(500).json({status: 'error', msg: 'Une erreur s\'est produite'});
    }

    const decodedToken = jwt.decode(req.body.token);
    const accountID = decodedToken.id;

    // On regarde si les identifiants sont corrects
    pool.query('SELECT password FROM public.users WHERE id = ($1)', [accountID], (err, result) => {
        if(err) {
            return res.status(500).json(err);
        }

        // Si le mot de passe est correct, on passe à la requête suivante
        if(result.rows.length > 0 && passwordHash.verify(req.body.currentMDP, result.rows[0].password)) {

            const newMDP = passwordHash.generate(req.body.newMDP);
            // On met à jour le mot de passe
            pool.query('UPDATE public.users SET password = ($1) WHERE id = ($2)', [newMDP, accountID], (err2, result2) => {
                if(err2) {
                    return res.status(500).json(err2);
                }

                res.json({
                    status: 'ok',
                    msg: 'Mot de passe modifié avec succès'
                });
            });
        }
        else {
            return res.json({
                status: 'error',
                msg: 'Mot de passe incorrect'
            });
        }
    });


};


/*
* Cette méthode sert à télécharger un fichier
*/
module.exports.getFile = (req, res) => {
    const id_file = req.params.id_file;
    const date_file = req.params.date_file;
    const token = req.query.token;

    if(typeof id_file == 'undefined'
        || typeof date_file == 'undefined'
        || typeof token == 'undefined'
    ) {
        return res.json({status: 'error', msg: 'Une erreur s\'est produite'});
    }

    // On va chercher le nom du fichier. On aurait pu transmettre directement le nom du ficher à télécharger mais
    // cela représente un risque

    jwt.verify(token, keyConfig.jwt.secret, (err, decode) => {
        if(err) {
            return res.json(err);
        }
        pool.query('SELECT file FROM public.files_activity WHERE id_file = ($1) AND date = ($2)', [id_file, date_file], (err2, result) => {
            if(err2) {
                return res.json(err2);
            }

            if(result.rows[0].file.length > 0) {
                const file = './uploads/'+result.rows[0].file;
                const filename = path.basename(file);
                const mimetype = mime.lookup(file);
                res.setHeader('Content-disposition', 'attachment; filename='+filename);
                res.setHeader('Content-type', mimetype);

                var filestream = fs.createReadStream(file);
                filestream.pipe(res);
            } else {
                return res.json({status: 'error', msg: 'Une erreur s\'est produite'});
            }
        });
    });
};


/*
* Cette méthode sert à la suppression d'un fichier
*/
module.exports.deleteFile = (req, res) => {
    const id_file = parseInt(req.params.id_file);

    if(typeof id_file == 'undefined') {
        return res.json({status: 'error', msg: 'Une erreur s\'est produite'});
    }

    // D'abord on va récupérer la liste des version du fichier
    pool.query('SELECT file FROM public.files_activity WHERE id_file = ($1)', [id_file], (err, result) => {
        if(err) {
            return res.json(err);
        }

        if(result.rows.length > 0) {
            // On supprime les fichiers physiquement
            result.rows.map(function(item) {
                if(fs.existsSync('./uploads/'+item.file)) {
                    fs.unlinkSync('./uploads/'+item.file);
                }
            });

            // On supprime en base de données le fichier (public.files)
            pool.query('DELETE FROM public.files WHERE id = ($1)', [id_file], (err, result) => {
                if(err) {
                    return res.json(err);
                }
            });

            // On supprimer en base de données les iterations du fichier (public.files_activity)
            pool.query('DELETE FROM public.files_activity WHERE id_file = ($1)', [id_file], (err, result) => {
                if(err) {
                    return res.json(err);
                }
            });

            return res.json({
                status: 'ok',
                msg: 'Fichier supprimé avec succès'
            });
        } else {
            return res.json({
                status: 'error', msg: 'Une erreur s\'est produite'
            });
        }
    });
}
