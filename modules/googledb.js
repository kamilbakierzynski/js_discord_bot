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
        convertObjToArray.push(object[key].toString().replace('.', ','));
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

exports.refreshDbDataAll = async function refreshDbDataAll(clientDiscord) {
    let usersList = {};
    clientDiscord.guilds.cache.get('654415996702162984').voiceStates.cache.forEach((value, key) => {
        usersList = { ...usersList, [key]: { id: key, mute: value.selfMute, channelID: value.channelID } };
    });

    dbRead().then(async data => {
        const newData = data.reduce((akum, user, index) => {
            if (usersList[user.discord_id] === undefined) {
                return [...akum, objectToArray(user)];
            }
            if (user.channelID === '654418034081136650') {
                return [...akum, objectToArray(user)];
            }
            //timediff since last update
            const dataTime = Date.now();
            const timeDiff = parseFloat(((dataTime - parseInt(user.last_seen, 10)) / 60000).toFixed(2));
            //check if muting or deafening
            if (usersList[user.discord_id].mute) {
                user.minutes_on_mute = parseFloat(user.minutes_on_mute, 10) + timeDiff;
                user.minutes_day_afk = parseFloat(user.minutes_day_afk, 10) + timeDiff;
                user.all_time_on_mute = parseFloat(user.all_time_on_mute, 10) + timeDiff;
            }
            //check if last time was connected
            user.minutes_connected = parseFloat(user.minutes_connected, 10) + timeDiff;
            user.minutes_day = parseFloat(user.minutes_day, 10) + timeDiff;
            user.all_time_minutes = parseFloat(user.all_time_minutes, 10) + timeDiff;

            user.last_seen = dataTime;
            return [...akum, objectToArray(user)];
        }, []);

        //aktualizacja użytkowników aktualnie dostępnych na kanale,
        //dostęp do obiektów tylko tych użytkowników plus ich index w tabeli,
        //trzeba przekonwertować z obiektów na listy
        //jedyne co zostało to wysłać batch update do sheetsów

        console.log(newData);
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
                values: newData
            }
    };

    await gsAPI.spreadsheets.values.update(options);
    });
}

function objectToArray(object) {
    let convertObjToArray = []
    for (let key in object) {
        convertObjToArray.push(object[key].toString().replace('.', ','));
    }
    return convertObjToArray;
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
            onlineValuesList.push(data[i].minutes_day.toString().replace('.', ','));
            afkValuesList.push(data[i].minutes_day_afk.toString().replace('.', ','));
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

function convertToArr(objectArr) {
    let tempList = [];
    for (let j = 0; j < objectArr.length; j += 1) {
        tempList.push(objectArr[j].toString().replace('.', ','));
    }
    return tempList;
}

function convertToObj(data) {
    const keys = data.shift();
    let output = []
    for (let j = 0; j < data.length; j += 1) {
        let tempObj = {}
        for (let i = 0; i < data[j].length; i += 1) {
            if (data[j][i] === '') {
                tempObj[keys[i]] = "0";
            } else {
                tempObj[keys[i]] = data[j][i].toString().replace(',', '.');
            }
        }
        output.push(tempObj);
    }
    return output;
}