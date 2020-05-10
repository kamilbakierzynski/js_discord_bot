const { XMLHttpRequest } = require('xmlhttprequest');

module.exports = {
    name: 'livegame',
    description: 'Check if summoner is in game.',
    usgae: 'livegame <summoner name>',
    execute(client, message) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        let name = message.content.slice(`${client.configData.prefix}summoner `.length).toLowerCase();
        console.log(`<❔> Getting ${name} live game for ${message.author.username}`);
        name = name.replace(/ /g, '%20');
        const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${client.RIOT_API_KEY}`;
        Http.open('GET', url);
        Http.send();
        Http.onload = function (e) {
            const data = JSON.parse(Http.responseText);
            if (data.hasOwnProperty('status')) {
                message.reply(data.status.message.toLowerCase());
                console.log('<❌> === 🔥 ERROR GETTING SUMMONER ID 🔥 ===');
                console.log(data.status.message);
            } else {
                const HttpGame = new XMLHttpRequest();
                HttpGame.responseType = 'json';
                const summonerId = data.id;
                const summonerName = data.name;
                console.log(`<✅> Got ${summonerId} as ${summonerName} id. Getting game data.`);
                const gameUrl = `https://eun1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${client.RIOT_API_KEY}`;
                HttpGame.open('GET', gameUrl);
                HttpGame.send();
                HttpGame.onload = function (error) {
                    const liveGameData = JSON.parse(HttpGame.responseText);
                    console.log(`<✅> Got data about ${summonerName}.`);
                    // console.log(liveGameData);
                    if (liveGameData.hasOwnProperty('status')) {
                        message.channel.send(`${summonerName} not in game.`);
                    } else {
                        const champion = liveGameData.participants.reduce((akum, participant) => (participant.summonerId === summonerId ? participant.championId : akum), 0);

                        const liveGameEmbed = new client.Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`${summonerName} in game as ${client.champions.readChampion(champion)}`)
                            .addFields(
                                { name: 'For', value: client.helpers.convertSecondsToTime(liveGameData.gameLength) },
                                { name: 'Stats link', value: `https://porofessor.gg/pl/live/eune/${summonerName.replace(/ /g, '%20')}` },
                            )
                            .setImage(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/champion/${client.champions.readChampion(champion).replace(/ /g, '')}.png`)
                            .setTimestamp(liveGameData.gameStartTime)
                            .setFooter('League of Legends');

                        message.channel.send(liveGameEmbed);
                    }
                };
            }
        };
    },
};
