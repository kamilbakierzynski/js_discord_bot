exports.checkPrefix = function checkPrefix(msg, command) {
    return msg.content.startsWith(prefix + command);
}

exports.capitalize = function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.checkStatus = function checkStatus(string) {
    return (string === 'online') ? ' ✅' : ' ❌';
}

exports.formatBoolean = function formatBoolean(string) {
    return string ? '✅' : '❌';
}

exports.convertGameStatus = function convertGameStatus(string) {
    return string ? 'WIN ✅' : 'LOSE ❌';
}

exports.convertSecondsToTime = function convertSecondsToTime(time) {
    const mins = Math.floor(time / 60);
    let secs = time - mins * 60;
    if (secs < 10) {
        secs = `0${secs}`;
    }
    return `${mins}:${secs}`;
}

exports.preetifyMinutes = function preetifyMinutes(mins) {
    const roundMin = Math.round(parseFloat(mins));
    if (roundMin < 60) {
        return `${roundMin} min`;
    }
    const hours = Math.floor(roundMin / 60);
    const newMins = roundMin - hours * 60;
    return `${hours} hours ${newMins} min`;
}

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
}

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
}

exports.calculateTimeDiff = function calculateTimeDiff(timeOld) {
    const newDate = Date.now();
    const old = new Date(timeOld);
    const diffMs = (newDate - old);
    const diffDays = Math.floor(diffMs / 86400000); // days
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    return `${diffDays} days, ${diffHrs} hours, ${diffMins} minutes`;
}


exports.displayRanking = function displayRanking(client) {
    client.channels.fetch('654415996702162987').then(channel => {
        const { name } = channel;
        client.googledb.dbRead().then(data => {
            console.log('<✅> Displaying server ranking.');
            data.sort((a, b) => (parseFloat(b.minutes_connected) - parseFloat(b.minutes_on_mute)) - (parseFloat(a.minutes_connected) - parseFloat(a.minutes_on_mute)));
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`🎉 Server Activity 🎉`)
                .setDescription('Ranking in minutes: ')
                .addFields(
                    { name: '1️⃣ First place', value: "🥇 " + `**${data[0].username}**` + ` *(ONLINE: ${preetifyMinutes(data[0].minutes_connected)} | AFK: ${preetifyMinutes(data[0].minutes_on_mute)})*`, inline: false },
                    { name: '2️⃣ Second place', value: "🥈 " + `**${data[1].username}**` + ` *(ONLINE: ${preetifyMinutes(data[1].minutes_connected)} | AFK: ${preetifyMinutes(data[1].minutes_on_mute)})*`, inline: false },
                    { name: '3️⃣ Third place', value: "🥉 " + `**${data[2].username}**` + ` *(ONLINE: ${preetifyMinutes(data[2].minutes_connected)} | AFK: ${preetifyMinutes(data[2].minutes_on_mute)})*`, inline: false },
                    { name: 'Off the podium', value: '------', inline: false },
                    { name: '4️⃣ Fourth place', value: `**${data[3].username}**` + ` *(ONLINE: ${preetifyMinutes(data[3].minutes_connected)} | AFK: ${preetifyMinutes(data[3].minutes_on_mute)})*`, inline: false },
                    { name: '5️⃣ Fifth place', value: `**${data[4].username}**` + ` *(ONLINE: ${preetifyMinutes(data[4].minutes_connected)} | AFK: ${preetifyMinutes(data[4].minutes_on_mute)})*`, inline: false },
                    { name: '6️⃣ Sixth place', value: `**${data[5].username}**` + ` *(ONLINE: ${preetifyMinutes(data[5].minutes_connected)} | AFK: ${preetifyMinutes(data[5].minutes_on_mute)})*`, inline: false },
                )
                .setAuthor('Ziewamy Blacha')
                .setTimestamp();
            channel.send(exampleEmbed);
        })
    })
}