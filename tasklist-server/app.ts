import * as express from 'express';
import NodeCouchDB from 'node-couchdb';
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let http = require('http');

//CouchDB config
//require_valid_user true



const userDatabases = [
    'todos',
    'projects',
    'areas',
    'calendars'
];


const app = express();
const router = express.Router();


router.get(
    '/', 
    (req, res, next) => {
        res.json({user: 'tobi'});
    }
);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);
app.set('port', '3000');
app.listen(3000);


const couch = new NodeCouchDB({
    host:'https://couchdb-604ef9.smileupps.com/',
    protocol: 'https',
    //port: 5984,
    auth:{
        user:'admin',
        pass:'54957bed1593'
    }
});


let createUserDatabase = (user) => {
    //change database/_security   members names add username
}


let createUniqueUser = () => {
    //create databases as well
}


let removeUser = () => {
    //remove databases as well
}


let loginUser = () => {

}


let signUpUser = () => {

}


/*
couch
.listDatabases()
.then(
    dbs => dbs.forEach(d => console.log(d))
);

couch.insert(
    "_users", 
    {
        "_id": `org.couchdb.user:dbreader`,
        "name": `dbreader`,
        "type": "user",
        "roles": [],
        "password": `123456`
    }
)
*/