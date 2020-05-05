exports.updateLocalCache = async function updateLocalCache(client) {
    await client.googledb.dbRead().then(data => client.localCache = data);
}

exports.updateOnlineDb = function updateOnlineDb(client) {
    client.googledb.dbUpdate(client.localCache);
}

exports.saveDataLocally = function saveDataLocally(client) {
    let usersList = {};
    client.guilds.cache.get('654415996702162984').members.cache.forEach((value, key) => {
        if (value.voice.selfMute !== undefined && value.voice.channelID !== null) {
            usersList = { ...usersList, [key]: {id: key, mute: value.voice.selfMute, channelID: value.voice.channelID, username: value.user.username }}
        }
    });

    client.localCache = client.localCache.reduce((akum, user) => {
        if (usersList[user.discord_id] !== undefined &&
            usersList[user.discord_id].channelID !== '654418034081136650') {
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
}

exports.addNewUser = function addNewUser(client, discord_id, username, last_seen) {
    client.localCache = [...client.localCache,
        {discord_id: discord_id,
         username: username,
         last_seen: last_seen,
         minutes_connected: 0,
         minutes_on_mute: 0,
         all_time_minutes: 0,
         all_time_on_mute: 0,
         minutes_day: 0,
         minutes_day_afk: 0,
         medals: 0,
         need_for_working: 0}]
}