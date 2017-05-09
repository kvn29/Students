# STUDENTS
[![Screenshot](https://jedonne.fr/students.png)](https://jedonne.fr/students.png)

## Présentation
Students est un dashboard fictif qui permet aux étudiants inscrits dans le cours informatique de pouvoir échanger des données (des TD, des TPE...) entre eux. La plate-forme est réalisée avec React, NodeJS, PostgreSQL & Socket.IO. C'est une application React Isomorphic : un premier rendu est effectué côté serveur puis côté client ce qui résout les problèmes SEO.

L'application utilise une API sécurisée **(1)** JWT qui permet de se connecter au tableau de bord ainsi que d'autres actions.

###### Le tableau de bord est constitué de trois parties :
1. Une barre verticale à gauche pour controler le contenu
2. Une centrale qui expose le contenu du tableau de bord ou bien du Chat temps réel utilisant Socket.IO.
3. Une dernière barre verticale à droite liste, les utilisateurs connecté et les activités récentes.


**(1)** Afin de rendre l'API pleinement sécurisée il est nécessaire de prévoir en amont un certificat SSL valide pour sécuriser les requêtes de l'API.

## Installation


```sh
git clone https://github.com/kvn29/Students
cd Students
```
Importez le fichier tables.sql dans votre base de données PostgreSQL.

```sh
npm install
npm start
```
L'application est alors accessible à l'adresse http://localhost:3000

## Modifications
Si vous souhaitez effectuer des modifications dans le code source Back-End, il sera nécessaire de relancer le serveur avec `npm start` ou d'utiliser `nodemon server.js`.
Pour que toutes autres modifications soient prises en compte il faudra utiliser GULP.

##### Installation de GULP

Tapez la commande suivante dans votre terminal (peu importe l'endroit, la commande installe le paquet de manière globale) :
```sh
npm install -g gulp
```
Puis allez à l'emplacement où se trouve l'application Students, et lancez la commande `gulp build`

##### Test du chat en local
Afin de tester le chat à plusieurs en local, il est nécessaire modifier le fichier `/api/conf/conf.js` et de changer l'adresse du serveur par l'adresse IP de votre machine, par exemple : `http://192.168.1.20:3000/`.

Les autres personnes devront être sur le même réseau local que vous et accédez avec un navigateur à l'adresse `http://192.168.1.20:3000/`.

**Enjoy !**
