let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let http = require('http');
let router = express.Router();


export const app = express();

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