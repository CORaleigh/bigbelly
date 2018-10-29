const express = require("express");
const app = express();
var request = require('request-promise');

const host = "https://api.bigbelly.com";
const token = 'PxtFZzK5473bwBkxgTqT';

app.get('/bigbelly/:route', (req, res) => {

    // let route = 

    let mydata = async function getAlerts() {
        let options = {
            url: `${host}/api/v2?objectType=${req.params.route}&action=load&accountFilter=388`,
            headers: { 'X-Token': token }
        }
        return await request(options);
    }

    let done = mydata().then((results) => {
        // console.log(results);
        res.send(results);
    }).catch(function (err) {
        console.log('err = ', err);
    });

});

app.listen(process.env.PORT || 2017, () =>
    console.log(`\nServing application on port ${process.env.PORT || 2017}\n`)
);