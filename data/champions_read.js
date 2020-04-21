'use strict';

const fs = require('fs');


exports.readChampion = function(championId) {
    // console.log(championId);
    try {
        let rawdata = fs.readFileSync('./data/champions.json');
        let champsData = JSON.parse(rawdata);
        for (let key in champsData.data) {
            if(champsData.data[key].key === championId) {
                return champsData.data[key].name;
            }
        }
    } catch (e) {
        // console.log(e)
        return '=== 🔥 ERROR READING LOCAL CHAMP DATA 🔥 ===';
    }
}

