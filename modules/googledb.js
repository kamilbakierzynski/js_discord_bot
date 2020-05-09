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

exports.getArchiveData = async function getArchiveData() {
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
    });
    const gsAPI = google.sheets({ version: 'v4', auth: client });
    const options = {
        spreadsheetId: spreadsheetId,
        range: 'Online',
    };

    const response = await gsAPI.spreadsheets.values.get(options);
    let data = response.data.values;
    data.shift();
    const formatData = data.reduce((akumTop, day) => {
        const calculated = day.reduce((akum, value, index) => {
            if (index === 0) {
                akum.day = value;
            }
            if (index !== 0 && value != 0) {
                akum.avg += parseInt(value, 10);
                akum.count += 1;
            }
            return akum;
        }, {day: 0, avg: 0, count: 0});
        return [...akumTop, calculated];
    }, []);
    const outputData = formatData.map(element => ({day: element.day, value: element.avg = Math.round(element.avg / element.count)}));
    const outputFormat = outputData.reduce((akum, day) => {
        const oneDay = 86400000;
        const dateFormat = new Date(day.day - oneDay);
        akum.daysFields = [...akum.daysFields, "&quot;" + dateFormat.toLocaleDateString() + "&quot;"];
        akum.valueFields = [...akum.valueFields, day.value];
        return akum;
    }, {daysFields: [], valueFields: []});
    return outputFormat;
}

exports.dbUpdate = async function dbUpdate(objectArr) {
    const output = objectArr.reduce((akum, user) => [...akum, objectToArray(user)], []);
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
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
    });

    const gsAPI = google.sheets({ version: 'v4', auth: client });
    const optionsClear = {
        spreadsheetId: spreadsheetId,
        range: `Users!D2:E`,
    };

    await gsAPI.spreadsheets.values.clear(optionsClear);
}

exports.archiveData = async function archiveData(clientDiscord) {
    client.authorize(function (error, tokens) {
        if (error) {
            console.log(error);
            status = false;
        }
    });
    await dbRead().then(async data => {
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

        clientDiscord.datasaver.clearDayRanking(clientDiscord);

    });
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