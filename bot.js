const Discord = require('discord.js');
require('dotenv').config()
const express = require('express')
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const champs = require('./data/champions_read.js')
const db = require('./data/encryption.js')

const prefix = process.env.PREFIX;
const riotApiKey = process.env.RIOT_API_KEY

function checkPrefix(msg, command) {
    if (msg.content.startsWith(prefix + command)) {
        return true
    }
    return false
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function checkStatus(string) {
    if (string == 'online') {
        return " ✅"
    } else {
        return " ❌"
    }
}

function formatBoolean(string) {
    return string ? "✅" : "❌"
}

function convertGameStatus(string) {
    if (string) {
        return 'WIN ✅'
    } else {
        return 'LOSE ❌'
    }
}

function convertSecondsToTime(time) {
    let mins = Math.floor(time / 60)
    let secs = time - mins * 60
    if (secs < 10) {
        secs = `0${secs}`
    }
    return `${mins}:${secs}`
}

function formatRotation(arr) {
    let output = ''
    if (!arr.hasOwnProperty('freeChampionIds')) {
        return 'Error getting data'
    } else {
        const championList = arr.freeChampionIds
        for (let i = 0; i < championList.length; i++) {
            output += `${champs.readChampion(championList[i])}\n`
        }
        return output
    }
}

function formatSeries(data) {
    const wins = data.wins
    let target = data.target
    const losses = data.losses
    const progress = data.progress
    console.log(progress)

    let output = '';

    for (let i = 0; i < progress.length; i++) {
        if (progress[i] == 'W') {
            output += "✅ "
        } else if (progress[i] == 'L') {
            output += "❌ "
        } else if (progress[i] == 'N') {
            output += "- "
        }
    }

    return output
}

function calculateTimeDiff(timeOld) {
    var newDate = Date.now();
    const old = new Date(timeOld);
    const diffMs = (newDate - old);
    const diffDays = Math.floor(diffMs / 86400000); // days
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    return diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes" 
}

function overOneDay(timeOld) {
    var newDate = Date.now();
    const old = new Date(timeOld);
    const diffMs = (newDate - old);
    const diffDays = Math.floor(diffMs / 86400000);
    return (diffDays > 0) ? true : false
}

var app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});
app.get('/', function (req, res) {
    res.send('SERVER UP!');
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activity: { name: 'League of Legends', type: 'PLAYING' },
        status: 'idle'
    })
        .catch(console.error);
});

client.on('message', message => {
    console.log(message.content)

    if (message.author.bot) return;

    if (checkPrefix(message, 'help')) {
        message.reply('shorten, summoner, lastgame, rotation, livegame.')
    }

    if (checkPrefix(message, 'shorten')) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        message.delete()
        const urlLink = message.content.split(' ')[1]
        message.channel.send(`Preparing short link for ${urlLink}`).then(msg => {
            const url = `https://api.shrtco.de/v2/shorten?url=${urlLink}`;
            Http.open("GET", url);
            Http.send();
            Http.onload = function (e) {
                let data = JSON.parse(Http.responseText)
                msg.delete()
                if (data.ok) {
                    message.reply("Here is your short link " + data.result.full_short_link)
                } else {
                    message.reply('there was an error.')
                }
            }
        })

    }
    if (checkPrefix(message, 'summoner')) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        let name = message.content.slice('!summoner '.length).toLowerCase()
        // message.channel.send('Getting data for ' + name)
        name = name.replace(' ', '%20')
        console.log(name)
        const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotApiKey}`
        Http.open("GET", url);
        Http.send();
        Http.onload = function (e) {
            let data = JSON.parse(Http.responseText)
            console.log(data)
            if (data.hasOwnProperty('status')) {
                message.reply(data.status.message.toLowerCase())
            } else {
                let summonerId = data.id
                console.log(summonerId)
                const HttpRank = new XMLHttpRequest();
                HttpRank.responseType = 'json';
                const url = `https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotApiKey}`
                HttpRank.open("GET", url);
                HttpRank.send();
                HttpRank.onload = function (e) {
                    let dataRank = JSON.parse(HttpRank.responseText)
                    for (let i = 0; i < dataRank.length; i++) {
                        let rankedData = dataRank[i]
                        const winRatio = (rankedData.wins / (rankedData.wins + rankedData.losses));
                        let exampleEmbed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(data.name + " | " + `${data.summonerLevel} lvl`)
                            .setAuthor(rankedData.queueType.replace('_', ' '))
                            .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/profileicon/${data.profileIconId}.png`)
                            .addFields(
                                { name: 'Tier', value: rankedData.tier, inline: true },
                                { name: 'Rank', value: rankedData.rank, inline: true },
                                { name: 'Leaugue points', value: rankedData.leaguePoints, inline: true },
                                { name: 'Wins', value: rankedData.wins, inline: true },
                                { name: 'Losses', value: rankedData.losses, inline: true },
                                { name: 'Win ratio', value: (winRatio * 100).toFixed(2) + "%", inline: true },
                                { name: 'Stats link', value: `https://www.leagueofgraphs.com/pl/summoner/eune/${data.name.replace(' ', '%20')}`, inline: true }
                            )
                            .attachFiles([`./ranked-emblems/${rankedData.tier}.png`])
                            .setImage(`attachment://${rankedData.tier}.png`)
                            .setTimestamp()
                            .setFooter('League of Legends');

                        if (rankedData.hasOwnProperty('miniSeries')) {
                            exampleEmbed.addField('Series', formatSeries(rankedData.miniSeries))
                        }

                        message.channel.send(exampleEmbed);
                    }
                    if (dataRank.length == 0) {
                        message.channel.send(data.name + " | level " + data.summonerLevel)
                    }
                }
            }
        }
    }
    if (checkPrefix(message, 'status')) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        const url = `https://eun1.api.riotgames.com/lol/status/v3/shard-data?api_key=${riotApiKey}`
        Http.open("GET", url);
        Http.send();
        Http.onload = function (e) {
            let data = JSON.parse(Http.responseText)
            let services = data.services
            let incidentsArr = services[0].incidents
            let lastIncidentFormat = ''
            if (incidentsArr.length != 0) {
                let lastIncident = incidentsArr[0]
                for (let i = 0; i < incidentsArr.length; i++) {
                    if (lastIncident.id < incidentsArr[i].id) {
                        lastIncident = incidentsArr[i]
                    }
                }
                lastIncidentFormat = lastIncident.updates[0].translations[1].content
            } else {
                lastIncidentFormat = 'No incidents'
            }
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(data.name)
                .setAuthor('SERVER STATUS INFO')
                .addFields(
                    { name: services[0].name, value: capitalize(services[0].status + checkStatus(services[0].status)) },
                    { name: services[1].name, value: capitalize(services[1].status + checkStatus(services[1].status)) },
                    { name: services[2].name, value: capitalize(services[2].status + checkStatus(services[2].status)) },
                    { name: services[3].name, value: capitalize(services[3].status + checkStatus(services[3].status)) },
                )
                .addField('Last incident', lastIncidentFormat)
                .setTimestamp()
                .setFooter('League of Legends');

            message.channel.send(exampleEmbed);
        }
    }

    if (checkPrefix(message, 'lastgame')) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        let name = message.content.slice('!lastgame '.length).toLowerCase()
        name = name.replace(' ', '%20')
        console.log(name)
        const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotApiKey}`
        Http.open("GET", url);
        Http.send();
        Http.onload = function (e) {
            let data = JSON.parse(Http.responseText)
            if (data.hasOwnProperty('status')) {
                message.reply(data.status.message.toLowerCase())
                console.log('error')
            } else {
                const HttpGame = new XMLHttpRequest();
                HttpGame.responseType = 'json';
                const summonerId = data.accountId
                const summonerName = data.name
                const gameUrl = `https://eun1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerId}?endIndex=1&api_key=${riotApiKey}`
                HttpGame.open("GET", gameUrl);
                HttpGame.send();
                HttpGame.onload = function (e) {
                    let gameData = JSON.parse(HttpGame.responseText)
                    if (gameData.hasOwnProperty("matches")) {
                        let gameId = gameData.matches[0].gameId
                        console.log("Getting data about game: " + gameId)
                        const HttpInfo = new XMLHttpRequest();
                        HttpInfo.responseType = 'json';
                        const gameInfoUrl = `https://eun1.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${riotApiKey}`
                        HttpInfo.open("GET", gameInfoUrl);
                        HttpInfo.send();
                        HttpInfo.onload = function (e) {
                            let gameInfo = JSON.parse(HttpInfo.responseText)
                            let participantsIdentities = gameInfo.participantIdentities
                            let summonerParticipantId = 0
                            for (let i = 0; i < participantsIdentities.length; i++) {
                                if (participantsIdentities[i].player.accountId == summonerId) {
                                    summonerParticipantId = participantsIdentities[i].participantId
                                }
                            }
                            let participantData = ''
                            for (let i = 0; i < gameInfo.participants.length; i++) {
                                if (gameInfo.participants[i].participantId === summonerParticipantId) {
                                    participantData = gameInfo.participants[i]
                                }
                            }
                            console.log(participantData)
                            const championName = champs.readChampion(participantData.championId)
                            const stats = `${participantData.stats.kills}/${participantData.stats.deaths}/${participantData.stats.assists}`;
                            const messageEmbed = new Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`as **${championName}** (${participantData.stats.champLevel}lvl)`)
                                .setAuthor(`Last ${summonerName}'s game`)
                                .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/profileicon/${data.profileIconId}.png`)
                                .setDescription(convertGameStatus(participantData.stats.win))
                                .addFields(
                                    { name: 'Duration', value: convertSecondsToTime(gameInfo.gameDuration) || "❔", inline: false },
                                    { name: 'Stats', value: stats, inline: true },
                                    { name: 'Creeps', value: participantData.stats.totalMinionsKilled + participantData.stats.neutralMinionsKilled || "❔", inline: true },
                                    { name: 'Role/Lane', value: participantData.timeline.role.replace('_', ' ') + "/" + participantData.timeline.lane || "❔", inline: true },
                                    { name: 'Longest time spent living', value: convertSecondsToTime(participantData.stats.longestTimeSpentLiving) || "❔", inline: true },
                                    { name: 'Largest killing spree/multi kill', value: participantData.stats.largestKillingSpree + "/" + participantData.stats.largestMultiKill || "❔", inline: true },
                                    { name: 'Total damage dealt/taken', value: participantData.stats.totalDamageDealt + "/" + participantData.stats.totalDamageTaken || "❔", inline: true },
                                    { name: 'Gold earned', value: participantData.stats.goldEarned || "❔", inline: true },
                                    { name: 'Wards (placed/destroyed)', value: participantData.stats.wardsPlaced + "/" + participantData.stats.wardsKilled || "❔", inline: true },
                                    { name: 'Vision score', value: participantData.stats.visionScore || "❔", inline: true },
                                    { name: 'First blood', value: formatBoolean(participantData.stats.firstBloodKill) || "❔", inline: true },
                                    { name: 'Stats link', value: `https://app.mobalytics.gg/post-game/eune/${summonerName.replace(' ', '%20')}/${gameId}` }
                                )
                                .setTimestamp(gameInfo.gameCreation || "❔")
                                .setImage(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/champion/${championName.replace(' ', '')}.png`)
                                .setFooter('League of Legends');

                            if (participantData.hasOwnProperty('timeline')) {
                                const timeline = participantData.timeline

                                for (const key of Object.keys(timeline)) {
                                    console.log(key)
                                    if (key.includes('Diff')) {
                                        const formatKey = key.toString().replace(/([a-z])([A-Z])/g, '$1 $2').slice(0, -7).toLowerCase()
                                        messageEmbed.addField(capitalize(formatKey) || "❔", "->", false)
                                        for (const innerKey of Object.keys(timeline[key])) {
                                            messageEmbed.addField(innerKey || "❔", timeline[key][innerKey].toFixed(2) || "❔", true)
                                        }
                                    }
                                }
                            }

                            message.channel.send(messageEmbed);
                        }

                    } else {
                        console.log(gameData)
                        message.channel.send('Error getting game data.')
                    }
                }
            }
        }
    }

    if (checkPrefix(message, 'livegame')) {
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        let name = message.content.slice('!livegame '.length).toLowerCase()
        name = name.replace(' ', '%20')
        console.log(name)
        const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotApiKey}`
        Http.open("GET", url);
        Http.send();
        Http.onload = function (e) {
            let data = JSON.parse(Http.responseText)
            if (data.hasOwnProperty('status')) {
                message.reply(data.status.message.toLowerCase())
                console.log('error')
            } else {
                const HttpGame = new XMLHttpRequest();
                HttpGame.responseType = 'json';
                const summonerId = data.id
                const summonerName = data.name
                const gameUrl = `https://eun1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${riotApiKey}`
                HttpGame.open("GET", gameUrl);
                HttpGame.send();
                HttpGame.onload = function (e) {
                    let liveGameData = JSON.parse(HttpGame.responseText);
                    console.log(liveGameData)
                    if (liveGameData.hasOwnProperty('status')) {
                        message.channel.send(`${summonerName} not in game.`)
                    } else {
                        let champion = 0;
                        for (let i = 0; i < liveGameData.participants.length; i++) {
                            if (liveGameData.participants[i].summonerId == summonerId) {
                                champion = liveGameData.participants[i].championId
                            }
                        }
                        const exampleEmbed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`${summonerName} in game as ${champs.readChampion(champion)}`)
                            .addFields(
                                { name: "For", value: convertSecondsToTime(liveGameData.gameLength) },
                                { name: 'Stats link', value: `https://porofessor.gg/pl/live/eune/${summonerName.replace(' ', '%20')}` }
                            )
                            .setImage(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/champion/${champs.readChampion(champion).replace(' ', '')}.png`)
                            .setTimestamp(liveGameData.gameStartTime)
                            .setFooter('League of Legends');

                        message.channel.send(exampleEmbed);
                    }
                }
            }
        }
    }

    if (checkPrefix(message, 'rotation')) {
        const HttpRotation = new XMLHttpRequest();
        HttpRotation.responseType = 'json';
        const rotationUrl = `https://eun1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${riotApiKey}`
        HttpRotation.open("GET", rotationUrl);
        HttpRotation.send();
        HttpRotation.onload = function (e) {
            let rotationInfo = JSON.parse(HttpRotation.responseText)
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Free champions')
                .setAuthor('Ziewamy Blacha')
                .addField('Free champions this week', formatRotation(rotationInfo))
                .setTimestamp()
                .setFooter('League of Legends');

            message.channel.send(exampleEmbed);
        }
    }

    if (checkPrefix(message, 'pawel')) {
        try {
            data = db.readData()
        } catch (e) {
            console.log(e)
        }
        if (data.hasOwnProperty('ostatnia_wizyta')) {
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Paweł ostatnio')
                .setDescription(calculateTimeDiff(data['ostatnia_wizyta']))
                .setAuthor('Ziewamy Blacha')
                .setTimestamp(data['ostatnia_wizyta'])
                .setFooter('Persona non grata');
            message.channel.send(exampleEmbed);
        }

    }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel
    let oldUserChannel = oldMember.voiceChannel
    if(oldUserChannel === undefined && newUserChannel !== undefined) {
        console.log('ciekawe')
     } else if(newUserChannel === undefined){
         try {
            if (newMember.channel.hasOwnProperty('name')) {
                if (newMember.member.displayName == 'ksieciunio') {
                    console.log(newMember.channel.name + " " + newMember.member.displayName);
                    const channel = client.channels.cache.get('699936586456104960');                
                    // let data = {'status': 'error'}
                    try {
                        data = db.readData()
                    } catch (e) {
                        console.log(e)
                    }
                    if (data.hasOwnProperty('ostatnia_wizyta') && newMember.channel.name == 'Ziewamy Blacha') {
                        channel.send('Persona non grata', {tts: overOneDay() ? true : false}).then(msg => msg.delete({timeout: 100}))
                        if (overOneDay()) {
                            const exampleEmbed = new Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle('Witaj Paweł')
                                .setDescription(calculateTimeDiff(data['ostatnia_wizyta']))
                                .setAuthor('Ziewamy Blacha')
                                .setTimestamp(data['ostatnia_wizyta'])
                                .setFooter('Persona non grata');
                            channel.send(exampleEmbed);
                            channel.send('!play https://www.youtube.com/watch?v=8KFQg7n3cYw')
                        }
                        data['ostatnia_wizyta'] = Date.now();
                    }
                    db.saveData(data);
                    console.log(data);
                }
            }
         } catch (e) {
            console.log('voice error')
         }
     }
});

// 2ApDM6cMhZ-WwybonYzLj-iEcwbvEZUzJ1NVcq3QmkqMyQ

client.login(process.env.TEST_BOT_TOKEN);