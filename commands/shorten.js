const { XMLHttpRequest } = require('xmlhttprequest');

module.exports = {
    name: 'shorten',
    description: 'Shorten link',
    execute(client, message) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        message.delete();
        const urlLink = message.content.split(' ')[1];
        message.channel.send(`Preparing short link for ${urlLink}`).then((msg) => {
            const url = `https://api.shrtco.de/v2/shorten?url=${urlLink}`;
            Http.open('GET', url);
            Http.send();
            Http.onload = function (e) {
                console.log('<✅> Got data.');
                const data = JSON.parse(Http.responseText);
                msg.delete();
                if (data.ok) {
                    message.reply(`Here is your short link ${data.result.full_short_link}`);
                } else {
                    message.reply(' there was an error.');
                    console.log('<❌> Error getting short link.');
                }
            };
        });
    },
};
