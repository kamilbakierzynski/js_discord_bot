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

        client.googledb.dbRead().then(data => {
            let properData = undefined;
            for (let i = 0; i < data.length; i += 1) {
                if (data[i].discord_id === id) {
                    properData = data[i]
                }
            }
            if (properData === undefined) {
                message.reply(' no data about this user.');
                return;
            }
            const timeData = parseInt(properData.last_seen, 10);
            const seenEmbed = new client.Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${name} ostatnio na kanale:`)
                .setDescription(client.helpers.calculateTimeDiff(timeData) + " ago")
                .addFields(
                    { name: '🎙️ Time connected / week', value: client.helpers.preetifyMinutes(properData.minutes_connected), inline: true },
                    { name: '🔇 Time on mute / week', value: client.helpers.preetifyMinutes(properData.minutes_on_mute), inline: false },
                    // {name: 'Channel level', value: `${properData.channel_level} lvl`, inline: true },
                    { name: '🎙️ Time connected / all', value: client.helpers.preetifyMinutes(properData.all_time_minutes), inline: false },
                    { name: '🔇 Time on mute / all', value: client.helpers.preetifyMinutes(properData.all_time_on_mute), inline: true },
                )
                .setAuthor('Ziewamy Blacha')
                .setFooter('📅')
                .setTimestamp(timeData);
            message.channel.send(seenEmbed);
        });
    }
};