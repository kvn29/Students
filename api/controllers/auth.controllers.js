const jwt           = require('jsonwebtoken'),
    keyConfig       = require('../../keyConfig').default,
    passwordHash    = require('password-hash'),
    pool            = require('../../app/db.js');


/*
 * Cette méthode sert à s'authentifier
 */
module.exports.authentification = (req, res) => {
    if(typeof req.body.email == 'undefined'
        || typeof req.body.password == 'undefined'
    ) {
        return res.status(500).json({status: 'error', msg: 'Une erreur s\'est produite'})
    }

    pool.query('SELECT id, password, nom, prenom, email, id_courses, dateinscription, numeroetudiant FROM public.users WHERE email = ($1)', [req.body.email], (err, result) => {

        if(err) {
            return res.status(500).json(err);
        }

        if(result.rows.length > 0 && passwordHash.verify(req.body.password, result.rows[0].password)) {

            const profile = {
                id: result.rows[0].id,
                nom: result.rows[0].nom,
                prenom: result.rows[0].prenom,
                courses: result.rows[0].id_courses,
                dateinscription: result.rows[0].dateinscription,
                numeroetudiant: result.rows[0].numeroetudiant
            };

            const token = jwt.sign(profile, keyConfig.jwt.secret, {expiresIn: keyConfig.jwt.expiresInSeconds});
            return res.json({status: 'ok', token: token});
        }
        else {
            return res.json({
                status: 'error',
                msg: 'Email et/ou mot de passe incorrect'
            });
        }
    });
};
