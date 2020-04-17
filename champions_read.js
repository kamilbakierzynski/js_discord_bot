'use strict';

const fs = require('fs');


exports.readChampion = function(championId) {
    console.log(championId)
    let rawdata = fs.readFileSync('champions.json');
    let champsData = JSON.parse(rawdata)
    for (let key in champsData.data) {
        if(champsData.data[key].key == championId) {
            return champsData.data[key].name
        }
    }

}

