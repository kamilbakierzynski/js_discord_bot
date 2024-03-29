exports.capitalize = function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.checkStatus = function checkStatus(string) {
    return (string === 'online') ? ' ✅' : ' ❌';
};

exports.formatBoolean = function formatBoolean(string) {
    return string ? '✅' : '❌';
};

exports.convertGameStatus = function convertGameStatus(string) {
    return string ? 'WIN ✅' : 'LOSE ❌';
};

exports.convertSecondsToTime = function convertSecondsToTime(time) {
    const mins = Math.floor(time / 60);
    let secs = time - mins * 60;
    if (secs < 10) {
        secs = `0${secs}`;
    }
    return `${mins}:${secs}`;
};

exports.convertMinutesToTime = function convertMinutesToTime(time) {
    const hours = Math.floor(time / 60);
    let mins = time - hours * 60;
    if (mins < 10) {
        mins = `0${mins}`;
    }
    return `${hours}:${mins}`;
};

exports.preetifyMinutes = function preetifyMinutes(mins) {
    const roundMin = Math.round(parseFloat(mins));
    if (roundMin < 60) {
        return `${roundMin} min`;
    }
    const hours = Math.floor(roundMin / 60);
    const newMins = roundMin - hours * 60;
    return `${hours} hours ${newMins} min`;
};

exports.formatRotation = function formatRotation(client, arr) {
    let output = '';
    if (!arr.hasOwnProperty('freeChampionIds')) {
        return 'Error getting data';
    }
    const championList = arr.freeChampionIds;
    for (let i = 0; i < championList.length; i += 1) {
        output += `${client.champions.readChampion(championList[i])}\n`;
    }
    return output;
};

exports.formatSeries = function formatSeries(data) {
    const { progress } = data;

    let output = '';

    for (let i = 0; i < progress.length; i += 1) {
        if (progress[i] === 'W') {
            output += '✅ ';
        } else if (progress[i] === 'L') {
            output += '❌ ';
        } else if (progress[i] === 'N') {
            output += '- ';
        }
    }


    return output;
};

exports.calculateTimeDiff = function calculateTimeDiff(timeOld) {
    const newDate = Date.now();
    const old = new Date(timeOld);
    const diffMs = (newDate - old);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    return `${diffDays} days, ${diffHrs} hours, ${diffMins} minutes`;
};

exports.getOnlineUsers = function getOnlineUsers(client) {
    let usersList = {};
    client.guilds.cache.get(client.configData.discordServerId).members.cache
    .forEach((value, key) => {
        if (value.voice.selfMute !== undefined
            && value.voice.channelID !== null
            && !value.user.bot) {
            usersList = {
                ...usersList,
                [key]: {
                    id: key,
                    mute: value.voice.selfMute,
                    channelID: value.voice.channelID,
                    username: value.nickname || value.user.username,
                },
            };
        }
    });
    return usersList;
};

exports.displayRankingWithData = function displayRankingWithData(client, data) {
    const formatMinutes = client.helpers.preetifyMinutes;
    const dataCopy = [...data];
    client.channels.fetch(client.configData.mainTextChannelId).then((channel) => {
        if (dataCopy === undefined) {
            channel.send('❌ There is a problem with data. Try again later.');
            return;
        }
        console.log('<✅> Displaying server ranking.');
        dataCopy.map((user) =>
            user.diff = parseFloat(user.minutes_connected) - parseFloat(user.minutes_on_mute));
        dataCopy.sort((a, b) => b.diff - a.diff);

        const medalsDecode = { 0: '🥇', 1: '🥈', 2: '🥉' };

        const { place, names, times } = dataCopy.reduce((object, user, index) => {
            if (Math.round(parseFloat(user.diff)) === 0) {
                return object;
            }
            if (index === 3) {
                object.names += "\n";
                object.times += "\n";
                object.place += "\n";
            }
            if (index > 2) {
                object.place = `${object.place + (index + 1)}\n`;
                object.names += `**${user.username}**\n`;
            } else {
                object.place = `${object.place + (index + 1)}\n`;
                object.names += `${medalsDecode[index]} **${user.username}**\n`;
            }
            object.times += `**${formatMinutes(user.diff)}**\n`;

            return object;
        }, { place: '', names: '', times: '' });

        const rankingEmbed = new client.Discord.MessageEmbed()
            .setColor('#FFD700')
            .setTitle(`🎉 Server Activity 🎉`)
            .addFields(
                { name: 'Place', value: place, inline: true },
                { name: 'Name', value: names, inline: true },
                { name: 'Time (Online - AFK)', value: times, inline: true },
            )
            .setAuthor(client.user.username)
            .setTimestamp();
        channel.send(rankingEmbed);
    });
};

exports.percentOnline = function percentOnline(time, afk) {
    const startTime = 1587915360000;
    const timeNow = Date.now();
    const timeSpent = (parseInt(time, 10) - parseInt(afk, 10)) * 60 * 1000;
    return (timeSpent / (timeNow - startTime) * 100).toFixed(2);
}
