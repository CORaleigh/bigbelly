const express = require("express");
const app = express();
var request = require('request-promise');

const bigbellyhost = process.env.BIGBELLY_CLEAN_API;
const pedhost = "https://apieco.eco-counter-tools.com";
const bigbellytoken = process.env.X_TOKEN;
const pedtoken = 'Bearer b677de8fb7e673a0b6d194d4f4b8af63';

app.get('/bigbelly/:route', (req, res) => {

    // valid routes from api docs are:
    // accounts, collectionSummary, assets, alerts, collectionReady

    let mydata = async function getAlerts() {
        let options = {
            url: `${bigbellyhost}/api/v2?objectType=${req.params.route}&action=load&accountFilter=388`,
            headers: { 'X-Token': bigbellytoken }
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

app.get('/pedcounter/:route', (req, res) => {

    // valid routes from api docs are:
    // site

    let mydata = async function getPedSites() {
        let options = {
            url: `${pedhost}/api/1.0/${req.params.route}`,
            headers: { 'Authorization': pedtoken }
        }
        return await request(options);
    }

    mydata().then((results) => {
        let siteIds = JSON.parse(results);
        siteIds.forEach((value) => {
            let pedCountData = async function getPedCountData() {
                let options = {
                    url: `${pedhost}/api/1.0/data/${req.params.route}/${value.id}/?begin=2018-11-15T00:00:00&end=2018-11-15T23:59:59&step=day`,
                    headers: { 'Authorization': pedtoken }
                }
                return await request(options);
            }
            pedCountData().then((countResults) => {
                let counts = JSON.parse(countResults);
                counts.forEach((cntValue) => {
                console.log('value = ', cntValue.counts);
                });
            }).catch(function (err) {
                console.log('err = ', err);
            });
        });
        res.send(results);
    }).catch(function (err) {
        console.log('err = ', err);
    });
});

app.listen(process.env.NODE_PORT || 2017, () =>
    console.log(`\nServing application on port ${process.env.PORT || 2017}\n`)
);
