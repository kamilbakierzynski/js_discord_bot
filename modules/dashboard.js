exports.loadData = function loadData(client) {
    let data = client.localCache.reduce((akum, user) => {
        akum.daySum += parseInt(user.minutes_day);
        akum.weekSum += parseInt(user.minutes_connected);
        akum.allOnline += parseInt(user.all_time_minutes);
        akum.allAfk += parseInt(user.all_time_on_mute);
        return akum;
    }, {daySum: 0, weekSum: 0, allOnline: 0, allAfk: 0});

    let usersList = {};
    client.guilds.cache.get('654415996702162984').members.cache.forEach((value, key) => {
        if (value.voice.selfMute !== undefined && value.voice.channelID !== null) {
            usersList = { ...usersList, [key]: {id: key, mute: value.voice.selfMute,
                                                channelID: value.voice.channelID,
                                                username: value.nickname || value.user.username }}
        }
    });

    const allMinutes = data.allOnline + data.allAfk;
    let output = {dayAvg: client.helpers.convertMinutesToTime(parseInt(data.daySum / client.localCache.filter(x => x.minutes_day != 0).length)),
                  weekAvg: client.helpers.convertMinutesToTime(parseInt(data.weekSum / client.localCache.filter(x => x.minutes_connected != 0).length)),
                  onlineDonutChart: Math.round((data.allOnline / allMinutes) * 100),
                  afkDonutChart: Math.round((data.allAfk / allMinutes) * 100)};

    output.onlineNow = usersList.size | 0;

    output.percentOnlineToday = Math.round((client.localCache.filter(user => user.minutes_day != 0).length / client.localCache.length) * 100);

    return output;
}

exports.loadDataRanking = function loadDataRanking(client) {
    const rawDataTop = client.localCache.reduce((akum, user) => {
        if (user.medals === 'G') {
            akum.medals.username = user.username;
        }
        if (akum.afkMost.count < user.all_time_on_mute) {
            akum.afkMost.count = user.all_time_on_mute;
            akum.afkMost.username = user.username;
        }
        if (akum.afkLeast > user.all_time_on_mute && user.all_time_on_mute != 0) {
            akum.afkLeast.count = user.all_time_on_mute;
            akum.afkLeast.username = user.username;
        }
        return akum;
    }, { medals: {count: 0, username: ''}, afkMost: {count: 0, username: ''}, afkLeast: {count: 0, username: ''} });

    let dataCopy = [...client.localCache];
    dataCopy.map(user => user.diff = parseFloat(user.minutes_connected) - parseFloat(user.minutes_on_mute));
    dataCopy.sort((a, b) => b.diff - a.diff);

    const rankingData = dataCopy.reduce((akum, user, index) => {
        return akum += `<tr>
            <td>${index + 1}</td>
            <td><b>${user.username}</b></td>
            <td>${client.helpers.preetifyMinutes(user.diff)}</td>
            <td>${client.helpers.calculateTimeDiff(parseInt(user.last_seen, 10))}</td>
        </tr>`;
    }, '');

    const processedDataTop = {
        medalsUsername: rawDataTop.medals.username,
        afkMostUsername: rawDataTop.afkMost.username,
        afkLeastUsername: rawDataTop.afkLeast.username,
        rankingData: rankingData
    };
    return processedDataTop;
}