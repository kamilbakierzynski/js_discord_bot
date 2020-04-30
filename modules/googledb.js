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

const dbRead = exports.dbRead = async function dbRead() {
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
    if (index < 0) {
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
    const optionsClear = {
        spreadsheetId: spreadsheetId,
        range: `Users!D2:E`,
    };

    await gsAPI.spreadsheets.values.clear(optionsClear);
}

exports.archiveData = function archiveData() {
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
        // console.log('Connected!');
    });
    dbRead().then(async data => {
        let usernamesList = ['time'];
        const currentDate = Date.now().toString();
        let onlineValuesList = [currentDate];
        let afkValuesList = [currentDate];

        for (let i = 0; i < data.length; i += 1) {
            usernamesList.push(data[i].username);
            onlineValuesList.push(data[i].minutes_day);
            afkValuesList.push(data[i].minutes_day_afk);
        }

        const gsAPI = google.sheets({ version: 'v4', auth: client });

        const optionsUpdateUsernamesOnline = {
            spreadsheetId: spreadsheetId,
            range: `Online!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [usernamesList]
            }
        };
        const optionsUpdateUsernamesAfk = {
            spreadsheetId: spreadsheetId,
            range: `Afk!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [usernamesList]
            }
        };
        const optionsUpdateValuesOnline = {
            spreadsheetId: spreadsheetId,
            range: `Online!A2`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [onlineValuesList]
            }
        };
        const optionsUpdateValuesAfk = {
            spreadsheetId: spreadsheetId,
            range: `Afk!A2`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [afkValuesList]
            }
        };
        const optionsClearDaily = {
            spreadsheetId: spreadsheetId,
            range: `Users!H2:I`,
        };


        await gsAPI.spreadsheets.values.update(optionsUpdateUsernamesOnline);
        await gsAPI.spreadsheets.values.update(optionsUpdateUsernamesAfk);

        await gsAPI.spreadsheets.values.append(optionsUpdateValuesOnline);
        await gsAPI.spreadsheets.values.append(optionsUpdateValuesAfk);

        await gsAPI.spreadsheets.values.clear(optionsClearDaily);
        
    });
}

function convertToArr(data) {
    let output = [];
    for (let i = 0; i < objectArr.length; i += 1) {
        let tempList = [];
        for (let j = 0; j < objectArr[i].length; j += 1) {
            tempList.push(objectArr[i][j].replace('.', ','));
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
                tempObj[keys[i]] = data[j][i].replace(',', '.');
            }
        }
        output.push(tempObj);
    }
    return output;
}