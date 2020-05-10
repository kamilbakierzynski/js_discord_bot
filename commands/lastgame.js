const { XMLHttpRequest } = require('xmlhttprequest');

module.exports = {
    name: 'lastgame',
    description: 'Display last game played by Summoner.',
    usage: `lastgame <summoner name>`,
    execute(client, message) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        let name = message.content.slice(`${client.configData.prefix}summoner `.length).toLowerCase();
        console.log(`<❔> Getting last ${name} game for ${message.author.username}`);
        name = name.replace(/ /g, '%20');
        const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${client.RIOT_API_KEY}`;
        Http.open('GET', url);
        Http.send();
        Http.onload = function (e) {
            const data = JSON.parse(Http.responseText);
            if (data.hasOwnProperty('status')) {
                message.reply(data.status.message.toLowerCase());
                console.log('<❌> === 🔥 GOT ERROR 🔥 ===');
                console.log(data.status.message);
            } else {
                const HttpGame = new XMLHttpRequest();
                HttpGame.responseType = 'json';
                const summonerId = data.accountId;
                const summonerName = data.name;
                const gameUrl = `https://eun1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerId}?endIndex=1&api_key=${client.RIOT_API_KEY}`;
                HttpGame.open('GET', gameUrl);
                HttpGame.send();
                HttpGame.onload = function (e) {
                    const gameData = JSON.parse(HttpGame.responseText);
                    if (gameData.hasOwnProperty('matches')) {
                        const { gameId } = gameData.matches[0];
                        console.log(`<❔> Getting data about game: ${gameId}`);
                        const HttpInfo = new XMLHttpRequest();
                        HttpInfo.responseType = 'json';
                        const gameInfoUrl = `https://eun1.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${client.RIOT_API_KEY}`;
                        HttpInfo.open('GET', gameInfoUrl);
                        HttpInfo.send();
                        HttpInfo.onload = function (e) {
                            console.log('<✅> Got data about game.');
                            const gameInfo = JSON.parse(HttpInfo.responseText);

                            const summonerParticipantId = gameInfo.participantIdentities.reduce((akum, participant) =>
                            participant.player.accountId === summonerId ? participant.participantId : akum, "");

                            const participantData = gameInfo.participants.reduce((akum, participant) =>
                            participant.participantId=== summonerParticipantId ? participant : akum, "");

                            const championName = client.champions.readChampion(participantData.championId);
                            const stats = `${participantData.stats.kills}/${participantData.stats.deaths}/${participantData.stats.assists}`;
                            const messageEmbed = new client.Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`as **${championName}** (${participantData.stats.champLevel}lvl)`)
                                .setAuthor(`Last ${summonerName}'s game`)
                                .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/profileicon/${data.profileIconId}.png`)
                                .setDescription(`${client.helpers.convertGameStatus(participantData.stats.win)} || ${client.helpers.convertSecondsToTime(gameInfo.gameDuration)}` || '❔')
                                .addFields(
                                    { name: 'Stats', value: stats, inline: true },
                                    { name: 'Creeps', value: participantData.stats.totalMinionsKilled + participantData.stats.neutralMinionsKilled || '❔', inline: true },
                                    { name: 'Role/Lane', value: `${participantData.timeline.role.replace('_', ' ')}/${participantData.timeline.lane}` || '❔', inline: true },
                                    { name: 'Longest time spent living', value: client.helpers.convertSecondsToTime(participantData.stats.longestTimeSpentLiving) || '❔', inline: true },
                                    { name: 'Largest killing spree/multi kill', value: `${participantData.stats.largestKillingSpree}/${participantData.stats.largestMultiKill}` || '❔', inline: true },
                                    { name: 'Total damage dealt/taken', value: `${participantData.stats.totalDamageDealt}/${participantData.stats.totalDamageTaken}` || '❔', inline: true },
                                    { name: 'Gold earned', value: participantData.stats.goldEarned || '❔', inline: true },
                                    { name: 'Wards (placed/destroyed)', value: `${participantData.stats.wardsPlaced}/${participantData.stats.wardsKilled}` || '❔', inline: true },
                                    { name: 'Vision score', value: participantData.stats.visionScore || '❔', inline: true },
                                    { name: 'First blood', value: client.helpers.formatBoolean(participantData.stats.firstBloodKill) || '❔', inline: true },
                                    { name: 'Stats link', value: `https://app.mobalytics.gg/post-game/eune/${summonerName.replace(/ /g, '%20')}/${gameId}` },
                                )
                                .setTimestamp(gameInfo.gameCreation || '❔')
                                .setImage(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/champion/${championName.replace(/ /g, '')}.png`)
                                .setFooter('League of Legends');

                            if (participantData.hasOwnProperty('timeline')) {
                                const { timeline } = participantData;

                                for (const key of Object.keys(timeline)) {
                                    if (key.includes('Diff')) {
                                        const formatKey = key.toString().replace(/([a-z])([A-Z])/g, '$1 $2').slice(0, -7).toLowerCase();
                                        messageEmbed.addField(client.helpers.capitalize(formatKey) || '❔', '->', false);
                                        for (const innerKey of Object.keys(timeline[key])) {
                                            messageEmbed.addField(innerKey || '❔', timeline[key][innerKey].toFixed(2) || '❔', true);
                                        }
                                    }
                                }
                            }

                            message.channel.send(messageEmbed);
                        };
                    } else {
                        message.channel.send('<❌> === 🔥 ERROR GETTING GAME DATA 🔥 ===');
                        console.log(gameData);
                    }
                };
            }
        };
    }
};