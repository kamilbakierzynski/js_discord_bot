exports.updateLocalCache = async function updateLocalCache(client) {
    await client.googledb.dbRead().then((data) => client.localCache = data);
};

exports.updateOnlineDb = function updateOnlineDb(client) {
    client.googledb.dbUpdate(client.localCache);
};

exports.saveDataLocally = function saveDataLocally(client) {
    const usersList = client.helpers.getOnlineUsers(client);

    if (Object.keys(usersList).length < 2) {
        return;
    }

    client.localCache = client.localCache.reduce((akum, user) => {
        if (usersList[user.discord_id] !== undefined
            && usersList[user.discord_id].channelID !== client.configData.afkChannelId) {
            user.last_seen = Date.now();
            user.username = usersList[user.discord_id].username;
            user.minutes_connected = parseInt(user.minutes_connected, 10) + 1;
            user.all_time_minutes = parseInt(user.all_time_minutes, 10) + 1;
            user.minutes_day = parseInt(user.minutes_day, 10) + 1;
            if (usersList[user.discord_id].mute) {
                user.minutes_on_mute = parseInt(user.minutes_on_mute, 10) + 1;
                user.all_time_on_mute = parseInt(user.all_time_on_mute, 10) + 1;
                user.minutes_day_afk = parseInt(user.minutes_day_afk, 10) + 1;
            }
        }
        return [...akum, user];
    }, []);
};

exports.clearWeekRanking = function clearWeekRanking(client) {
    const dataCopy = [...client.localCache];
    dataCopy.map((user) => user.diff = parseFloat(user.minutes_connected) - parseFloat(user.minutes_on_mute));
    dataCopy.sort((a, b) => b.diff - a.diff).slice(0, 3);

    client.localCache = client.localCache.reduce((akum, user) => {
        user.medals = dataCopy.reduce((result, rankingWinner, index) => {
            if (user.discord_id === rankingWinner.discord_id) {
                switch (index) {
                    case 0:
                        return `${result}G`;
                    case 1:
                        return `${result}S`;
                    case 2:
                        return `${result}B`;
                }
            }
            return result;
        }, user.medals == 0 ? "" : user.medals);
        user.minutes_connected = 0;
        user.minutes_on_mute = 0;
        return [...akum, user];
    }, []);
};

exports.clearDayRanking = function clearDayRanking(client) {
    client.localCache = client.localCache.reduce((akum, user) => {
        user.minutes_day = 0;
        user.minutes_day_afk = 0;
        return [...akum, user];
    }, []);
};

exports.addNewUser = function addNewUser(client, discord_id, username, last_seen) {
    client.localCache = [...client.localCache,
    {
        discord_id,
        username,
        last_seen,
        minutes_connected: 0,
        minutes_on_mute: 0,
        all_time_minutes: 0,
        all_time_on_mute: 0,
        minutes_day: 0,
        minutes_day_afk: 0,
        medals: 0,
        need_for_working: 0,
    }];
};
