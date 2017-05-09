const pool       = require('../../app/db.js'),
    passwordHash = require('password-hash'),
    jwt          = require('jsonwebtoken'),
    keyConfig    = require('../../keyConfig').default;

/*
 * Cette méthode sert à ajouter un utilisateur
 */
module.exports.addUser = (req, res) => {
    if(typeof req.body.email == 'undefined'
        || typeof req.body.password == 'undefined'
        || typeof req.body.password2 == 'undefined'
        || typeof req.body.nom == 'undefined'
        || typeof req.body.prenom == 'undefined'
        || typeof req.body.courses == 'undefined'
        || typeof req.body.numeroetudiant == 'undefined'
    ) {
        return res.status(500).json({status: 'error', msg:'Une erreur s\'est produite !'});
    }

    // Vérification mot de passe
    if(req.body.password !== req.body.password2) {
        return res.status(500).json({status: 'error', msg: 'Les mots de passe ne sont pas identiques'});
    }

    // Dans un premier temps on regarde si aucun compte n'est utilisé avec cet email
    pool.query('SELECT COUNT(*) AS nbAccount\
                FROM public.users\
                WHERE email = $1', [req.body.email], (err, result) => {
        if(err) {
            return res.status(500).json(err);
        }

        // Si aucun utilisateur avec cet email
        if(result.rows[0].nbaccount == 0) {

            let date = new Date();
            date.setHours(date.getHours() + 2);
            // On ajout l'utilisateur
            pool.query('INSERT INTO public.users(email,password,nom,prenom,id_courses,dateinscription,numeroetudiant) VALUES (($1), ($2), ($3), ($4), ($5), ($6), ($7)) RETURNING id;',
                [
                    req.body.email,
                    passwordHash.generate(req.body.password),
                    req.body.nom,
                    req.body.prenom,
                    parseInt(req.body.courses),
                    Math.floor(date.getTime() / 1000),
                    parseInt(req.body.numeroetudiant)
                ], (err2, result2) => {
                    if(err2) {
                        return res.status(500).json(err2);
                    }

                    // On charge dans le token les informations du profil pour le connecté
                    const idNewUser = result2.rows[0].id;
                    const profile = {
                        id: idNewUser,
                        nom: req.body.nom,
                        prenom: req.body.prenom,
                        courses: req.body.courses,
                        dateinscription: Math.floor(date.getTime() / 1000),
                        numeroetudiant: req.body.numeroetudiant
                    };

                    const token = jwt.sign(profile, keyConfig.jwt.secret, {expiresIn: keyConfig.jwt.expiresInSeconds});

                    return res.json({status: 'ok', token: token});
            });
        }
        else {
            return res.json({
                status: 'error',
                msg: 'already account'
            });
        }
    });
};
