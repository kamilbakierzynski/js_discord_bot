const { XMLHttpRequest } = require('xmlhttprequest');

module.exports = {
    name: 'summoner',
    description: 'Get data about League of Legends summoner.',
    execute(client, message) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        let name = message.content.slice(`${client.configData.prefix}summoner `.length).toLowerCase();
        console.log(`<❔> Getting summoner data about ${name} for ${message.author.username}`);
        name = name.replace(/ /g, '%20');
        const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${client.RIOT_API_KEY}`;
        Http.open('GET', url);
        Http.send();
        Http.onload = function (e) {
            const data = JSON.parse(Http.responseText);
            if (data.hasOwnProperty('status')) {
                message.reply(data.status.message.toLowerCase());
                console.log('<❌> Data about summoner not found.');
            } else {
                const summonerId = data.id;
                console.log(`<✅> Got summoner id: ${summonerId}`);
                const HttpRank = new XMLHttpRequest();
                HttpRank.responseType = 'json';
                const url = `https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${client.RIOT_API_KEY}`;
                HttpRank.open('GET', url);
                HttpRank.send();
                HttpRank.onload = function (e) {
                    console.log('<✅> Got summoner data.');
                    const dataRank = JSON.parse(HttpRank.responseText);
                    dataRank.forEach((rankedData) => {
                        const winRatio = (rankedData.wins / (rankedData.wins + rankedData.losses));
                        const summonerEmbed = new client.Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`${data.name} | ` + `${data.summonerLevel} lvl`)
                            .setAuthor(rankedData.queueType.replace(/_/g, ' '))
                            .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/profileicon/${data.profileIconId}.png`)
                            .addFields(
                                { name: 'Tier', value: rankedData.tier, inline: true },
                                { name: 'Rank', value: rankedData.rank, inline: true },
                                { name: 'Leaugue points', value: rankedData.leaguePoints, inline: true },
                                { name: 'Wins', value: rankedData.wins, inline: true },
                                { name: 'Losses', value: rankedData.losses, inline: true },
                                { name: 'Win ratio', value: `${(winRatio * 100).toFixed(2)}%`, inline: true },
                                { name: 'Stats link', value: `https://www.leagueofgraphs.com/pl/summoner/eune/${data.name.replace(/ /g, '%20')}`, inline: true },
                            )
                            .attachFiles([`./ranked-emblems/${rankedData.tier}.png`])
                            .setImage(`attachment://${rankedData.tier}.png`)
                            .setTimestamp()
                            .setFooter('League of Legends');

                        if (rankedData.hasOwnProperty('miniSeries')) {
                            summonerEmbed.addField('Series', client.helpers.formatSeries(rankedData.miniSeries));
                        }

                        message.channel.send(summonerEmbed);
                    });
                    if (dataRank.length === 0) {
                        message.channel.send(`${data.name} | level ${data.summonerLevel}`);
                    }
                };
            }
        };
    },
};
