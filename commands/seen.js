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
        const properData = data.reduce((akum, user) => {
            if (user.discord_id === id) {
                akum = { ...user };
            }
            return akum;
        }, {});

        if (properData === undefined) {
            message.reply(' no data about this user.');
            return;
        }

        data.map((user) => 
            user.diff = parseFloat(user.minutes_connected) - parseFloat(user.minutes_on_mute));
        data.sort((a, b) => b.diff - a.diff);

        const place = data.findIndex((element) => element.discord_id === properData.discord_id);

        const formatMinutes = client.helpers.preetifyMinutes;

        const timeFrames = ['Day: ', 'Week: ', 'All: '];
        const timeFrameFieldsOnline = ['minutes_day', 'minutes_connected', 'all_time_minutes'];
        const timeFrameFieldsOffline = ['minutes_day_afk', 'minutes_on_mute', 'all_time_on_mute'];

        const timeStringOnline = timeFrames.reduce((string, frame, index) => {
            const formatter = index === 1 ? "**" : "";
            return `${string + frame + formatter + formatMinutes(properData[timeFrameFieldsOnline[index]]) + formatter}\n`;
        }, "");

        const timeStringOfflne = timeFrames.reduce((string, frame, index) => {
            const formatter = index === 1 ? "**" : "";
            return `${string + frame + formatter + formatMinutes(properData[timeFrameFieldsOffline[index]]) + formatter}\n`;
        }, "");

        const timeData = parseInt(properData.last_seen, 10);

        const user = message.mentions.users.first();

        let outputMedals = '';
        for (let i = 0; i < properData.medals.length; i += 1) {
            const currentChar = properData.medals.charAt(i);
            switch (currentChar) {
                case "G":
                    outputMedals += '🥇';
                    break;
                case "S":
                    outputMedals += '🥈';
                    break;
                case "B":
                    outputMedals += '🥉';
                    break;
                default:
                    console.log('<❌> Wrong character in medals string.');
            }
        }

        const seenEmbed = new client.Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${name} (${client.helpers.percentOnline(properData.all_time_minutes, properData.all_time_on_mute)}%)`)
            .setThumbnail(user.displayAvatarURL() || user.defaultAvatarURL)
            .setDescription(`${outputMedals}\n**Last time online:**\n${client.helpers.calculateTimeDiff(timeData)} ago`)
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
