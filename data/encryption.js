const CryptoJS = require("crypto-js");
require('dotenv').config({path: '../.env'})
const fs = require('fs');

exports.readData = function () {
    let decryptedData = {'ostatnia_wizyta': Date.now()}
    try {
        const CIPHER_KEY = process.env.CIPHER_KEY
        const rawdata = fs.readFileSync('data/db.txt').toString();
        var bytes = CryptoJS.AES.decrypt(rawdata, CIPHER_KEY);
        decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        console.log(e)
    } finally {
        return decryptedData;
    }
    
}

exports.saveData = function (data) {
    const CIPHER_KEY = process.env.CIPHER_KEY
    const cipherData = CryptoJS.AES.encrypt(JSON.stringify(data), CIPHER_KEY).toString();
    fs.writeFileSync('data/db.txt', cipherData);
}
