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

        const data = [...client.localCache];
        const { properData, index } = data.reduce((akum, user, index) => {
            if (user.discord_id === id) {
                akum.properData = { ...user };
                akum.index = index;
            }
            return akum;
        }, { properData: undefined, index: 0 });

        if (properData === undefined) {
            message.reply(' no data about this user.');
            return;
        }

        data.map((user) => user.diff = parseFloat(user.minutes_connected) - parseFloat(user.minutes_on_mute));
        data.sort((a, b) => b.diff - a.diff);

        const place = data.findIndex((element) => element.discord_id === properData.discord_id);

        const formatMinutes = client.helpers.preetifyMinutes;

        const timeFrames = ['Day: ', 'Week: ', 'All: '];
        const timeFrameFieldsOnline = ['minutes_day', 'minutes_connected', 'all_time_minutes'];
        const timeFrameFieldsOffline = ['minutes_day_afk', 'minutes_on_mute', 'all_time_on_mute'];

        const timeStringOnline = timeFrames.reduce((string, frame, index) => {
            let formatter = '';
            index === 1 ? formatter = "**" : null;
            return `${string + frame + formatter + formatMinutes(properData[timeFrameFieldsOnline[index]]) + formatter}\n`;
        }, "");

        const timeStringOfflne = timeFrames.reduce((string, frame, index) => {
            let formatter = '';
            index === 1 ? formatter = "**" : null;
            return `${string + frame + formatter + formatMinutes(properData[timeFrameFieldsOffline[index]]) + formatter}\n`;
        }, "");

        const timeData = parseInt(properData.last_seen, 10);

        const user = message.mentions.users.first();

        let outputMedals = '';
        for (let i = 0; i < properData.medals.length; i += 1) {
            const currentChar = properData.medals.charAt(i);
            currentChar === 'G' ? outputMedals += '🥇' : null;
            currentChar === 'S' ? outputMedals += '🥈' : null;
            currentChar === 'B' ? outputMedals += '🥉' : null;
        }
        outputMedals === '' ? null : outputMedals += '\n\n';

        const seenEmbed = new client.Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(name)
            .setThumbnail(user.displayAvatarURL() || user.defaultAvatarURL)
            .setDescription(`${outputMedals}**Last time online:**\n${client.helpers.calculateTimeDiff(timeData)} ago`)
            .addFields(
                { name: '🎙️ Time connected', value: timeStringOnline, inline: true },
                { name: '🔇 Time on mute', value: timeStringOfflne, inline: true },
            )
            .setAuthor(`Place: ${place + 1}`)
            .setFooter('📅')
            .setTimestamp(timeData);
        message.channel.send(seenEmbed);
    },
};
