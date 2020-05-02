module.exports = async (client, oldMember, newMember) => {

    const newUserChannel = newMember.voiceChannel;
    const oldUserChannel = oldMember.voiceChannel;
    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        console.log('ciekawe');
    } else if (newUserChannel === undefined) {
        if (newMember.member.user.bot) {
            console.log('<🎤> Saving data. Skip bot.');
            return;
        }
        try {
            if (newMember.channel.hasOwnProperty('name') && newMember.channel.name !== 'AFK') {
                console.log(`<🎤> User ${newMember.member.displayName} on channel ${newMember.channel.name}`);
                console.log(`<✅> Saving data for ${newMember.member.displayName} || id: ${newMember.member.id}`);
                // const channel = client.channels.cache.get('654415996702162987');
                const dataTime = Date.now();
                client.googledb.dbRead().then(data => {
                    console.log('<✅> Reading database.');
                    let properData = undefined;
                    let index = 0;
                    for (let i = 0; i < data.length; i += 1) {
                        if (data[i].discord_id === newMember.member.id) {
                            properData = data[i]
                            index = i;
                        }
                    }
                    if (properData === undefined) {
                        console.log('<✅> Creating new user in db.');
                        client.googledb.dbAddNewUser(newMember.member.id, newMember.member.displayName, dataTime);
                        return;
                    } else {
                        console.log('<✅> Found user. Updating data.');
                        //update username
                        properData.username = newMember.member.displayName;

                        //timediff since last update
                        const timeDiff = parseFloat(((dataTime - parseInt(properData.last_seen, 10)) / 60000).toFixed(2));
                        //check if muting or deafening
                        if ((oldMember.mute === true) && (newMember.mute === false)) {
                            console.log(`<✅> User was muted. Adding ${timeDiff} to AFK stats.`);
                            console.log(`<T> Old user mute: ${oldMember.mute}; New user mute ${newMember.mute}; Old user deaf: ${oldMember.deaf}; New user dead ${newMember.deaf}`);
                            properData.minutes_on_mute = parseFloat(properData.minutes_on_mute, 10) + timeDiff;
                            properData.minutes_day_afk = parseFloat(properData.minutes_day_afk, 10) + timeDiff;
                            properData.all_time_on_mute = parseFloat(properData.all_time_on_mute, 10) + timeDiff;
                        }
                        //check if last time was connected
                        if (oldMember.channel != null && oldMember.channel.name !== 'AFK') {
                            properData.minutes_connected = parseFloat(properData.minutes_connected, 10) + timeDiff;
                            properData.minutes_day = parseFloat(properData.minutes_day, 10) + timeDiff;
                            properData.all_time_minutes = parseFloat(properData.all_time_minutes, 10) + timeDiff;
                        }
                        properData.last_seen = dataTime;
                        client.googledb.dbUpdateUser(properData, index);
                    }
                });
            }

            if (oldMember.channel != null && oldMember.channel.name !== 'AFK' && newMember.channel.name === 'AFK') {
                const dataTime = Date.now();
                client.googledb.dbRead().then(data => {
                    console.log('<✅> Reading database.');
                    let properData = undefined;
                    let index = 0;
                    for (let i = 0; i < data.length; i += 1) {
                        if (data[i].discord_id === newMember.member.id) {
                            properData = data[i]
                            index = i;
                        }
                    }
                    if (properData === undefined) {
                        console.log('<✅> Creating new user in db.');
                        client.googledb.dbAddNewUser(newMember.member.id, newMember.member.displayName, dataTime);
                        return;
                    } else {
                        console.log(`<✅> From ${oldMember.channel.name} to AFK.`);
                        console.log(`<✅> Saving data for ${newMember.member.displayName} || id: ${newMember.member.id}`);
                        //update username
                        properData.username = newMember.member.displayName;

                        //timediff since last update
                        const timeDiff = parseFloat(((dataTime - parseInt(properData.last_seen, 10)) / 60000).toFixed(2));
                        //check if muting or deafening
                        if (oldMember.mute || oldMember.deaf) {
                            console.log('<✅> User was muted/deaf.');
                            properData.minutes_on_mute = parseFloat(properData.minutes_on_mute, 10) + timeDiff;
                            properData.minutes_day_afk = parseFloat(properData.minutes_day_afk, 10) + timeDiff;
                            properData.all_time_on_mute = parseFloat(properData.all_time_on_mute, 10) + timeDiff;
                        }
                        properData.minutes_connected = parseFloat(properData.minutes_connected, 10) + timeDiff;
                        properData.minutes_day = parseFloat(properData.minutes_day, 10) + timeDiff;
                        properData.all_time_minutes = parseFloat(properData.all_time_minutes, 10) + timeDiff;
                        properData.last_seen = dataTime;
                        client.googledb.dbUpdateUser(properData, index);
                    }
                });
            }
        } catch (e) {
            console.log('<🔥> User has left the server.');
            if (oldMember.channel != null && oldMember.channel.name !== 'AFK' && !newMember.hasOwnProperty('channel')) {
                const dataTime = Date.now();
                client.googledb.dbRead().then(data => {
                    console.log('<✅> Reading database.');
                    let properData = undefined;
                    let index = 0;
                    for (let i = 0; i < data.length; i += 1) {
                        if (data[i].discord_id === oldMember.member.id) {
                            properData = data[i]
                            index = i;
                        }
                    }
                    if (properData === undefined) {
                        console.log('<✅> Creating new user in db.');
                        client.googledb.dbAddNewUser(oldMember.member.id, oldMember.member.displayName, dataTime);
                        return;
                    } else {
                        console.log(`<✅> ${newMember.member.displayName} leaving channel.`);
                        console.log('<✅> Found user. Updating data.');
                        //update username
                        properData.username = newMember.member.displayName;

                        //timediff since last update
                        const timeDiff = parseFloat(((dataTime - parseInt(properData.last_seen, 10)) / 60000).toFixed(2));

                        //check if was muted or deafeaned
                        if (oldMember.mute || oldMember.deaf) {
                            console.log('<✅> User was muted/deaf.');
                            properData.minutes_on_mute = parseFloat(properData.minutes_on_mute, 10) + timeDiff;
                            properData.minutes_day_afk = parseFloat(properData.minutes_day_afk) + timeDiff;
                            properData.all_time_on_mute = parseFloat(properData.all_time_on_mute, 10) + timeDiff;
                        }
                        properData.minutes_connected = parseFloat(properData.minutes_connected, 10) + timeDiff;
                        properData.minutes_day = parseFloat(properData.minutes_day, 10) + timeDiff;
                        properData.all_time_minutes = parseFloat(properData.all_time_minutes, 10) + timeDiff;

                        properData.last_seen = dataTime;


                        client.googledb.dbUpdateUser(properData, index);
                    }
                });
            }
        }
    }
};