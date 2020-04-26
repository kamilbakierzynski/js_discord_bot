const { google } = require('googleapis');
require('dotenv').config({ path: "../.env" });

const googleEmail = process.env.GOOGLE_CLIENT_EMAIL;
const googleKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
const spreadsheetId = process.env.SPREADSHEET_ID;

const client = new google.auth.JWT(
    googleEmail,
    null,
    googleKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
);

exports.dbRead = async function dbRead() {
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
        // console.log('Connected!');
    });
    const gsAPI = google.sheets({ version: 'v4', auth: client });
    const options = {
        spreadsheetId: spreadsheetId,
        range: 'Users',
    };

    const response = await gsAPI.spreadsheets.values.get(options);
    let data = response.data.values;
    return convertToObj(data);
}

exports.dbAddNewUser = async function dbAddNewUser(discord_id, username, last_seen) {
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
        // console.log('Connected!');
    });

    const gsAPI = google.sheets({ version: 'v4', auth: client });
    const options = {
        spreadsheetId: spreadsheetId,
        range: 'Users!A2',
        valueInputOption: 'USER_ENTERED',
        resource: {
            //      discord_id, username, last_seen, minutes_connected, minutes_on_mute, all_time_minutes, all_time_on_mute, channel_level, channel_xp
            values: [[discord_id, username, last_seen, 0, 0, 0, 0, 1, 0]]
        }
    };

    await gsAPI.spreadsheets.values.append(options);
}

exports.dbUpdateUser = async function dbUpdateUser(object, index) {
    if (index < 1) {
        return;
    }
    let convertObjToArray = []
    for (let key in object) {
        convertObjToArray.push(object[key]);
    }
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
        // console.log('Connected!');
    });

    const gsAPI = google.sheets({ version: 'v4', auth: client });
    const options = {
        spreadsheetId: spreadsheetId,
        range: `Users!A${index + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [convertObjToArray]
        }
    };

    await gsAPI.spreadsheets.values.update(options);
}

exports.dbUpdate = async function dbUpdate(objectArr) {
    const output = convertToArr(objectArr);
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
        // console.log('Connected!');
    });

    const gsAPI = google.sheets({ version: 'v4', auth: client });
    const options = {
        spreadsheetId: spreadsheetId,
        range: `Users!A2`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: output
        }
    };

    await gsAPI.spreadsheets.values.update(options);

}

exports.clearMinutesWeekly = async function clearMinutesWeekly() {
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
        // console.log('Connected!');
    });

    const gsAPI = google.sheets({ version: 'v4', auth: client });
    const optionsColD = {
        spreadsheetId: spreadsheetId,
        range: `Users!D2:D`,
    };
    const optionsColE = {
        spreadsheetId: spreadsheetId,
        range: `Users!E2:E`,
    };

    await gsAPI.spreadsheets.values.clear(optionsColD);
    await gsAPI.spreadsheets.values.clear(optionsColE);
}

function convertToArr(data) {
    let output = [];
    for (let i = 0; i < objectArr.length; i += 1) {
        let tempList = [];
        for (let j = 0; j < objectArr[i].length; j += 1) {
            tempList.push(objectArr[i][j]);
        }
        output.push(tempList);
    }
    return output;
}

function convertToObj(data) {
    const keys = data.shift();
    let output = []
    for (let j = 0; j < data.length; j += 1) {
        let tempObj = {}
        for (let i = 0; i < data[j].length; i += 1) {
            if (data[j][i] === '') {
                tempObj[keys[i]] = 0;
            } else {
                tempObj[keys[i]] = data[j][i];
            }
        }
        output.push(tempObj);
    }
    return output;
}