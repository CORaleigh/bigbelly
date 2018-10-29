const express = require("express");
const app = express();
var request = require('request-promise');

const host = process.env.BIGBELLY_CLEAN_API;
const token = process.env.X_TOKEN;

app.get('/bigbelly/:route', (req, res) => {

    // valid routes from api docs are:
    // accounts, collectionSummary, assets, alerts, collectionReady 

    let mydata = async function getAlerts() {
        let options = {
            url: `${host}/api/v2?objectType=${req.params.route}&action=load&accountFilter=388`,
            headers: { 'X-Token': token }
        }
        return await request(options);
    }

    mydata().then((results) => {
        // console.log(results);
        res.send(results);
    }).catch(function (err) {
        console.log('err = ', err);
    });

});

app.listen(process.env.NODE_PORT || 2017, () =>
    console.log(`\nServing application on port ${process.env.PORT || 2017}\n`)
);