
const fs = require('fs');


exports.readChampion = function (championId) {
    try {
        const rawdata = fs.readFileSync('data/champions.json');
        const champsData = JSON.parse(rawdata);
        for (const key in champsData.data) {
            if (champsData.data[key].key == championId) {
                return champsData.data[key].name;
            }
        }
    } catch (e) {
        return '=== 🔥 ERROR READING LOCAL CHAMP DATA 🔥 ===';
    }
};
