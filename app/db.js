const pg = require('pg');

/*
 * Définition des identifiants de connexion à la base de données postgresql
 */

var config = {
    user: "postgres",
    password: "root",
    database: "postgres",
    port: 5432,
    host: "localhost",
    ssl: false,
    idleTimeoutMillis: 15000
};

const pool = new pg.Pool(config);

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

// Journal a chaque requete
module.exports.query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

module.exports.connect = function (callback) {
  return pool.connect(callback);
};
