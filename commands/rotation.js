const { XMLHttpRequest } = require('xmlhttprequest');

module.exports = {
    name: 'rotation',
    description: 'Display current rotation.',
    execute(client, message) {
        console.log(`<❔> Getting data about rotation for ${message.author.username}`);
        const HttpRotation = new XMLHttpRequest();
        HttpRotation.responseType = 'json';
        const rotationUrl = `https://eun1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${client.RIOT_API_KEY}`;
        HttpRotation.open('GET', rotationUrl);
        HttpRotation.send();
        HttpRotation.onload = function (e) {
            console.log('<✅> Got rotation data.');
            const rotationInfo = JSON.parse(HttpRotation.responseText);
            const roatationEmbed = new client.Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Free champions')
                .setAuthor(client.user.username)
                .addField('Free champions this week', client.helpers.formatRotation(client, rotationInfo))
                .setTimestamp()
                .setFooter('League of Legends');

            message.channel.send(roatationEmbed);
        };
    },
};
