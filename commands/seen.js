module.exports = {
    name: 'seen',
    description: "Show user's statistics on this channel.",
    execute(client, message) {
        if (message.mentions.users.first() === undefined) {
            message.reply('please mention a user.');
            console.log(`<❌> User was not mentioned. ${message.author.username}`);
            return;
        }
        const { id } = message.mentions.users.first();
        const name = message.mentions.users.first().username;

        let usersList = {};
        client.guilds.cache.get('654415996702162984').voiceStates.cache.forEach((value, key) => {
            usersList = { ...usersList, [key]: { id: key, mute: value.selfMute, channelID: value.channelID } };
        });

        client.googledb.dbRead().then(data => {
            let properData = undefined;
            let index = 0;
            for (let i = 0; i < data.length; i += 1) {
                if (data[i].discord_id === id) {
                    properData = {...data[i]};
                    index = i;
                }
            }
            if (properData === undefined) {
                message.reply(' no data about this user.');
                return;
            }
            if (usersList[properData.discord_id] !== undefined && usersList[properData.discord_id].channelID !== '654418034081136650') {
                const dataTime = Date.now();
                const timeDiff = parseFloat(((dataTime - parseInt(properData.last_seen, 10)) / 60000).toFixed(2));
                //check if muting or deafening
                if (usersList[user.discord_id].mute) {
                    properData.minutes_on_mute = parseFloat(properData.minutes_on_mute, 10) + timeDiff;
                    properData.minutes_day_afk = parseFloat(properData.minutes_day_afk, 10) + timeDiff;
                    properData.all_time_on_mute = parseFloat(properData.all_time_on_mute, 10) + timeDiff;
                }
                //check if last time was connected
                properData.minutes_connected = parseFloat(properData.minutes_connected, 10) + timeDiff;
                properData.minutes_day = parseFloat(properData.minutes_day, 10) + timeDiff;
                properData.all_time_minutes = parseFloat(properData.all_time_minutes, 10) + timeDiff;

                properData.last_seen = dataTime;
            }

            data.map(user => user.diff = parseFloat(user.minutes_connected, 10) - parseFloat(user.minutes_on_mute, 10));
            data.sort((a, b) => b.diff - a.diff);

            const place = data.findIndex(element => element.discord_id === properData.discord_id);

            const formatMinutes = client.helpers.preetifyMinutes;

            const timeFrames = ['Day: ', 'Week: ', 'All: '];
            const timeFrameFieldsOnline = ['minutes_day', 'minutes_connected', 'all_time_minutes'];
            const timeFrameFieldsOffline = ['minutes_day_afk', 'minutes_on_mute', 'all_time_on_mute'];

            const timeStringOnline = timeFrames.reduce((string, frame, index) => {
                let formatter = '';
                index === 1 ? formatter = "**" : null;
                return string + frame + formatter + formatMinutes(properData[timeFrameFieldsOnline[index]]) + formatter + '\n'}, "");

            const timeStringOfflne = timeFrames.reduce((string, frame, index) => {
                let formatter = '';
                index === 1 ? formatter = "**" : null;
                return string + frame + formatter + formatMinutes(properData[timeFrameFieldsOffline[index]]) + formatter + '\n'}, "");

            const timeData = parseInt(properData.last_seen, 10);

            let user = message.mentions.users.first();

            const seenEmbed = new client.Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${name} ostatnio na kanale:`)
                .setThumbnail(user.displayAvatarURL() || user.defaultAvatarURL)
                .setDescription(client.helpers.calculateTimeDiff(timeData) + " ago")
                .addFields(
                    { name: '🎙️ Time connected', value: timeStringOnline, inline: true },
                    { name: '🔇 Time on mute', value: timeStringOfflne, inline: true },
                )
                .setAuthor(`Miejsce: ${place + 1}`)
                .setFooter('📅')
                .setTimestamp(timeData);
            message.channel.send(seenEmbed);
            client.googledb.dbUpdateUser(properData, index);
        });
    }
};