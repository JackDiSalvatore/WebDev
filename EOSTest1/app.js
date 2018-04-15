var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

var account_name;
var active_key;

var get_info = {
    host: '192.168.56.101',
    port: 8888,
    path: '/v1/chain/get_info',
    method: 'GET'
};

/**************
*   FUNCTIONS
***************/
function getInfo(options, cb) {
    http.request(options, (res) => {
        var body = '';

        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            var result = JSON.parse(body);
            //console.log(result);
            cb(null, result);
        });

        res.on('error', cb);    // error on res
    })
    .on('error', cb)   // error on req
    .end();
}

function postAcc(jsonstring, cb) {
    //var post_data = '{"account_name":"deep"}';

    var post_options = {
        host: '192.168.56.101',
        port: 8888,
        path: '/v1/chain/get_account',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonstring)
        }
    };

    var post_req = http.request(post_options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            result = JSON.parse(chunk);
            //console.log('RESPONSE: ' + chunk);
            //func1(result);
            cb(result);
        });
    });

    post_req.write(jsonstring);
    post_req.end();

}

/*************************
*         ROUTES
**************************/
app.get('/', (req, res) => {

    getInfo(get_info, (err, result) => {
        if(err) {
            return console.log('Error while trying to communicate with EOSIO');
        } else {
            var head_block_num = result.head_block_num;
            res.render('home', {head_block_num: head_block_num});
        }
    });

});

app.get('/show', (req, res) => {
    console.log(account_name);
    console.log(active_key);
    res.render('show', {account_name: account_name, active_key: active_key});
});

app.post('/show', (req, res) => {
    console.log(req.body);
    postAcc('{"account_name":"' + req.body.account_name +'"}', (result) => {
        account_name = result.account_name;
        active_key = result.permissions[0].required_auth.keys[0].key;
        res.redirect('/show');
    });
});

app.listen(3000, () => {
    console.log('Server Listening on http://localhost:3000/');
});