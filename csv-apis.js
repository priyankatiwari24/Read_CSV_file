const express = require('express');
const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');

const app = express();
const port = 2000;

app.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/load_data', function (req, res, next) {
    res.sendFile(path.join(__dirname + '/load_data.html'));
});

var path_csv = 'data.csv';

app.get('/displayHeaders', function (req, res) {

    fs.createReadStream(path_csv)
        .pipe(csv())
        .on('headers', (headers) => {
            res.send(headers)
        })
})


app.get('/displayStates', function (req, res) {

    var states = [];

    fs.createReadStream(path_csv)
        .on('error', () => {
            console.log("error while reading the csv file ...")
        })

        .pipe(csv())
        .on('data', (row) => {
            //checking for unique value
            if (states.indexOf(row["state"]) === -1) {
                states.push(row["state"]);
            }
        })

        .on('end', () => {
            res.send(states)
        })
})

app.get('/displayData', function (req, res) {

    let selectedHeaders = req.query.selectedHeaders + ",state";
    let states = req.query.states.trim();

    let sheader = selectedHeaders.split(',');            //convert strings into aray with separated comma

    let sstates = [];

    if (states != "") {
        sstates = states.split(',')
    }

    let data = [];

    fs.createReadStream(path_csv)

        .on('error', () => {
            console.log("error while reading the csv file ...")
        })

        .pipe(csv())
        .on('data', (row) => {                                  //read the entrie file row wise
            if (sstates && sstates.length > 0) {
                if (sstates.indexOf(row["state"]) !== -1) {       //data comes in row wise and its checks given state is present or not
                    let e = {}
                    //this loop is for preventing extra headers (non selected)
                    sheader.forEach(element => {
                        e[element] = row[element]
                    });
                    data.push(e)
                }
            } else {
                let e = {}
                sheader.forEach(element => {
                    e[element] = row[element]
                });
                data.push(e)
            }
        })

        .on('end', () => {
            res.send(data)
        })

})

app.listen(port, function () {
    console.log('Node server is running on ' + port);
});