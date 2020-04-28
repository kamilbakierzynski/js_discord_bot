const Discord = require('discord.js');
require('dotenv').config();
const express = require('express');
const cron = require('cron');

const client = new Discord.Client();
const { XMLHttpRequest } = require('xmlhttprequest');
const champs = require('./data/champions_read.js');
const googleDB = require('./data/googledb.js');

const prefix = process.env.PREFIX;
const riotApiKey = process.env.RIOT_API_KEY;
const rapidApiKey = process.env.RAPID_API_KEY;

function checkPrefix(msg, command) {
  return msg.content.startsWith(prefix + command);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkStatus(string) {
  return (string === 'online') ? ' ✅' : ' ❌';
}

function formatBoolean(string) {
  return string ? '✅' : '❌';
}

function convertGameStatus(string) {
  return string ? 'WIN ✅' : 'LOSE ❌';
}

function convertSecondsToTime(time) {
  const mins = Math.floor(time / 60);
  let secs = time - mins * 60;
  if (secs < 10) {
    secs = `0${secs}`;
  }
  return `${mins}:${secs}`;
}

function preetifyMinutes(mins) {
  const roundMin = Math.round(parseFloat(mins));
  if (roundMin < 60) {
    return `${roundMin} min`;
  }
  const hours = Math.floor(roundMin / 60);
  const newMins = roundMin - hours * 60;
  return `${hours} hours ${newMins} min`;
}

function formatRotation(arr) {
  let output = '';
  if (!arr.hasOwnProperty('freeChampionIds')) {
    return 'Error getting data';
  }
  const championList = arr.freeChampionIds;
  for (let i = 0; i < championList.length; i += 1) {
    output += `${champs.readChampion(championList[i])}\n`;
  }
  return output;
}

function formatSeries(data) {
  const { progress } = data;

  let output = '';

  for (let i = 0; i < progress.length; i += 1) {
    if (progress[i] === 'W') {
      output += '✅ ';
    } else if (progress[i] === 'L') {
      output += '❌ ';
    } else if (progress[i] === 'N') {
      output += '- ';
    }
  }

  return output;
}

function calculateTimeDiff(timeOld) {
  const newDate = Date.now();
  const old = new Date(timeOld);
  const diffMs = (newDate - old);
  const diffDays = Math.floor(diffMs / 86400000); // days
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  return `${diffDays} days, ${diffHrs} hours, ${diffMins} minutes`;
}
// 654415996702162987
function displayRanking() {
  client.channels.fetch('654415996702162987').then(channel => {
    const { name } = channel;
    googleDB.dbRead().then(data => {
      console.log('<✅> Displaying server ranking.');
      data.sort((a, b) => (parseFloat(b.minutes_connected) - parseFloat(b.minutes_on_mute)) - (parseFloat(a.minutes_connected) - parseFloat(a.minutes_on_mute)));
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`🎉 Server Activity 🎉`)
        .setDescription('Ranking in minutes: ')
        .addFields(
          { name: '1️⃣ First place', value: "🥇 " + `**${data[0].username}**` + ` *(ONLINE: ${preetifyMinutes(data[0].minutes_connected)} | AFK: ${preetifyMinutes(data[0].minutes_on_mute)})*`, inline: false },
          { name: '2️⃣ Second place', value: "🥈 " + `**${data[1].username}**` + ` *(ONLINE: ${preetifyMinutes(data[1].minutes_connected)} | AFK: ${preetifyMinutes(data[1].minutes_on_mute)})*`, inline: false },
          { name: '3️⃣ Third place', value: "🥉 " + `**${data[2].username}**` + ` *(ONLINE: ${preetifyMinutes(data[2].minutes_connected)} | AFK: ${preetifyMinutes(data[2].minutes_on_mute)})*`, inline: false },
          { name: 'Off the podium', value: '------', inline: false },
          { name: '4️⃣ Fourth place', value: `**${data[3].username}**` + ` *(ONLINE: ${preetifyMinutes(data[3].minutes_connected)} | AFK: ${preetifyMinutes(data[3].minutes_on_mute)})*`, inline: false },
          { name: '5️⃣ Fifth place', value: `**${data[4].username}**` + ` *(ONLINE: ${preetifyMinutes(data[4].minutes_connected)} | AFK: ${preetifyMinutes(data[4].minutes_on_mute)})*`, inline: false },
          { name: '6️⃣ Sixth place', value: `**${data[5].username}**` + ` *(ONLINE: ${preetifyMinutes(data[5].minutes_connected)} | AFK: ${preetifyMinutes(data[5].minutes_on_mute)})*`, inline: false },
        )
        .setAuthor('Ziewamy Blacha')
        .setTimestamp();
      channel.send(exampleEmbed);
    })
  })
}

// function overOneDay(timeOld) {
//   const newDate = Date.now();
//   const old = new Date(timeOld);
//   const diffMs = (newDate - old);
//   const diffDays = Math.floor(diffMs / 86400000);
//   return (diffDays > 0);
// }

const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`<🔔> App is running on port ${PORT}!`);
});
app.get('/', (req, res) => {
  res.send(`<✅> SERVER UP! \n
            <${(botName === '') ? '❌' : '✅'}> ${(botName === '') ? 'Not logged in' : 'Logged in as ' + botName} \n
            <🔔> Current port: ${PORT}`);
});

let botName = '';

client.on('ready', () => {
  console.log(`<🔔> Logged in as ${client.user.tag}!`);
  botName = client.user.tag;

  client.user.setPresence({
    activity: { name: 'League of Legends', type: 'PLAYING' },
    status: 'idle',
  })
    .catch(console.error);

  console.log('<🕛> JOB AT 22:00:01 (00:00:01 UTC +2) change channel title.');
  let changeChannelTitle = new cron.CronJob('01 00 22 * * *', () => {
    client.channels.fetch('654415996702162987').then(channel => {
      const { name } = channel;
      const day = parseInt(name.split('-')[1], 10);
      console.log(`<🕛> Changing channel name from ${name} to dzień-${day + 1}.`);
      try {
        channel.setName(`dzień-${day + 1}}`);
        channel.send(`✅ Channel name changed to dzień-${day + 1}.`);
        console.log('<✅> Channel name changed.');
      } catch (e) {
        console.log('<❌> Error while changing channel name.');
        channel.send(`❌ Channel name changed failed.`);
        console.log(e);
      }
    });
  });
  console.log('<🕛> JOB EVERY MON 03:00:01 (05:00:01 UTC +2) clear database and show winners.');
  let clearDatabase = new cron.CronJob('01 00 03 * * MON', () => {
    console.log(`<🕛> Running DB job.`);
    displayRanking();
    googleDB.clearMinutesWeekly();
  });
  console.log('<🕛> JOB EVERY DAY 02:59:00 (04:59:00 UTC +2) archive database.');
  let archiveDatabase = new cron.CronJob('30 59 02 * * *', () => {
    console.log(`<🕛> Running archive job.`);
    googleDB.archiveData();
  });


  archiveDatabase.start();
  clearDatabase.start();
  changeChannelTitle.start();
});

client.on('message', (message) => {
  // console.log(message.mentions.users[0])

  console.log(`<🆕> Channel message: ${message.content}`);

  if (message.author.bot) return;

  if (message.content.startsWith(prefix)) console.log(`<❤️> Message to me: ${message}`);

  if (checkPrefix(message, 'help')) {
    message.reply('shorten, summoner, lastgame, rotation, livegame, seen, corona, ranking.');
  }

  if (checkPrefix(message, 'shorten')) {
    try {
      const Http = new XMLHttpRequest();
      Http.responseType = 'json';
      message.delete();
      const urlLink = message.content.split(' ')[1];
      message.channel.send(`Preparing short link for ${urlLink}`).then((msg) => {
        const url = `https://api.shrtco.de/v2/shorten?url=${urlLink}`;
        Http.open('GET', url);
        Http.send();
        Http.onload = function (e) {
          console.log('<✅> Got data.')
          const data = JSON.parse(Http.responseText);
          msg.delete();
          if (data.ok) {
            message.reply(`Here is your short link ${data.result.full_short_link}`);
          } else {
            message.reply(' there was an error.');
            console.log('<❌> Error getting short link.')
          }
        };
      });
    } catch (e) {
      message.reply(' error with the command `shorten`.');
      console.log('<❌> error with the command shorten.');
      console.log('<❌>' + e);
      return;
    }
  }
  if (checkPrefix(message, 'summoner')) {
    try {
      const Http = new XMLHttpRequest();
      Http.responseType = 'json';
      let name = message.content.slice('!summoner '.length).toLowerCase();
      // message.channel.send('Getting data for ' + name)
      console.log(`<❔> Getting summoner data about ${name} for ${message.author.username}`);
      name = name.replace(' ', '%20');
      // console.log(name);
      const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotApiKey}`;
      Http.open('GET', url);
      Http.send();
      Http.onload = function (e) {
        const data = JSON.parse(Http.responseText);
        // console.log(data);
        if (data.hasOwnProperty('status')) {
          message.reply(data.status.message.toLowerCase());
          console.log('<❌> Data about summoner not found.')
        } else {
          const summonerId = data.id;
          console.log(`<✅> Got summoner id: ${summonerId}`);
          const HttpRank = new XMLHttpRequest();
          HttpRank.responseType = 'json';
          const url = `https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotApiKey}`;
          HttpRank.open('GET', url);
          HttpRank.send();
          HttpRank.onload = function (e) {
            console.log('<✅> Got summoner data.');
            const dataRank = JSON.parse(HttpRank.responseText);
            for (let i = 0; i < dataRank.length; i += 1) {
              const rankedData = dataRank[i];
              const winRatio = (rankedData.wins / (rankedData.wins + rankedData.losses));
              const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${data.name} | ` + `${data.summonerLevel} lvl`)
                .setAuthor(rankedData.queueType.replace('_', ' '))
                .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/profileicon/${data.profileIconId}.png`)
                .addFields(
                  { name: 'Tier', value: rankedData.tier, inline: true },
                  { name: 'Rank', value: rankedData.rank, inline: true },
                  { name: 'Leaugue points', value: rankedData.leaguePoints, inline: true },
                  { name: 'Wins', value: rankedData.wins, inline: true },
                  { name: 'Losses', value: rankedData.losses, inline: true },
                  { name: 'Win ratio', value: `${(winRatio * 100).toFixed(2)}%`, inline: true },
                  { name: 'Stats link', value: `https://www.leagueofgraphs.com/pl/summoner/eune/${data.name.replace(' ', '%20')}`, inline: true },
                )
                .attachFiles([`./ranked-emblems/${rankedData.tier}.png`])
                .setImage(`attachment://${rankedData.tier}.png`)
                .setTimestamp()
                .setFooter('League of Legends');

              if (rankedData.hasOwnProperty('miniSeries')) {
                exampleEmbed.addField('Series', formatSeries(rankedData.miniSeries));
              }

              message.channel.send(exampleEmbed);
            }
            if (dataRank.length === 0) {
              message.channel.send(`${data.name} | level ${data.summonerLevel}`);
            }
          };
        }
      };
    } catch (e) {
      message.reply(' error with the command `summoner`.');
      console.log('<❌> Error with the command summoner.');
      console.log('<❌>' + e);
      return;
    }
  }
  if (checkPrefix(message, 'status')) {
    try {
      console.log('<❔> Getting data about LoL server status.');
      const Http = new XMLHttpRequest();
      Http.responseType = 'json';
      const url = `https://eun1.api.riotgames.com/lol/status/v3/shard-data?api_key=${riotApiKey}`;
      Http.open('GET', url);
      Http.send();
      Http.onload = function (e) {
        console.log('<✅> Got data.');
        const data = JSON.parse(Http.responseText);
        const { services } = data;
        const incidentsArr = services[0].incidents;
        let lastIncidentFormat = '';
        if (incidentsArr.length !== 0) {
          let lastIncident = incidentsArr[0];
          for (let i = 0; i < incidentsArr.length; i += 1) {
            if (lastIncident.id < incidentsArr[i].id) {
              lastIncident = incidentsArr[i];
            }
          }
          lastIncidentFormat = lastIncident.updates[0].translations[1].content;
        } else {
          lastIncidentFormat = 'No incidents';
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
      };
    } catch (e) {
      message.reply(' error with the command `status`.');
      console.log('<❌> Error with the command status.');
      console.log('<❌>' + e);
      return;
    }
  }

  if (checkPrefix(message, 'lastgame')) {
    try {
      const Http = new XMLHttpRequest();
      Http.responseType = 'json';
      let name = message.content.slice('$lastgame '.length).toLowerCase();
      console.log(`<❔> Getting last ${name} game for ${message.author.username}`);
      name = name.replace(' ', '%20');
      const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotApiKey}`;
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
          const gameUrl = `https://eun1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerId}?endIndex=1&api_key=${riotApiKey}`;
          HttpGame.open('GET', gameUrl);
          HttpGame.send();
          HttpGame.onload = function (e) {
            const gameData = JSON.parse(HttpGame.responseText);
            if (gameData.hasOwnProperty('matches')) {
              const { gameId } = gameData.matches[0];
              console.log(`<❔> Getting data about game: ${gameId}`);
              const HttpInfo = new XMLHttpRequest();
              HttpInfo.responseType = 'json';
              const gameInfoUrl = `https://eun1.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${riotApiKey}`;
              HttpInfo.open('GET', gameInfoUrl);
              HttpInfo.send();
              HttpInfo.onload = function (e) {
                console.log('<✅> Got data abut game.');
                const gameInfo = JSON.parse(HttpInfo.responseText);
                const participantsIdentities = gameInfo.participantIdentities;
                let summonerParticipantId = 0;
                for (let i = 0; i < participantsIdentities.length; i += 1) {
                  if (participantsIdentities[i].player.accountId === summonerId) {
                    summonerParticipantId = participantsIdentities[i].participantId;
                  }
                }
                let participantData = '';
                for (let i = 0; i < gameInfo.participants.length; i += 1) {
                  if (gameInfo.participants[i].participantId === summonerParticipantId) {
                    participantData = gameInfo.participants[i];
                  }
                }
                // console.log(participantData);
                const championName = champs.readChampion(participantData.championId);
                const stats = `${participantData.stats.kills}/${participantData.stats.deaths}/${participantData.stats.assists}`;
                const messageEmbed = new Discord.MessageEmbed()
                  .setColor('#0099ff')
                  .setTitle(`as **${championName}** (${participantData.stats.champLevel}lvl)`)
                  .setAuthor(`Last ${summonerName}'s game`)
                  .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/profileicon/${data.profileIconId}.png`)
                  .setDescription(`${convertGameStatus(participantData.stats.win)} || ${convertSecondsToTime(gameInfo.gameDuration)}` || '❔')
                  .addFields(
                    { name: 'Stats', value: stats, inline: true },
                    { name: 'Creeps', value: participantData.stats.totalMinionsKilled + participantData.stats.neutralMinionsKilled || '❔', inline: true },
                    { name: 'Role/Lane', value: `${participantData.timeline.role.replace('_', ' ')}/${participantData.timeline.lane}` || '❔', inline: true },
                    { name: 'Longest time spent living', value: convertSecondsToTime(participantData.stats.longestTimeSpentLiving) || '❔', inline: true },
                    { name: 'Largest killing spree/multi kill', value: `${participantData.stats.largestKillingSpree}/${participantData.stats.largestMultiKill}` || '❔', inline: true },
                    { name: 'Total damage dealt/taken', value: `${participantData.stats.totalDamageDealt}/${participantData.stats.totalDamageTaken}` || '❔', inline: true },
                    { name: 'Gold earned', value: participantData.stats.goldEarned || '❔', inline: true },
                    { name: 'Wards (placed/destroyed)', value: `${participantData.stats.wardsPlaced}/${participantData.stats.wardsKilled}` || '❔', inline: true },
                    { name: 'Vision score', value: participantData.stats.visionScore || '❔', inline: true },
                    { name: 'First blood', value: formatBoolean(participantData.stats.firstBloodKill) || '❔', inline: true },
                    { name: 'Stats link', value: `https://app.mobalytics.gg/post-game/eune/${summonerName.replace(' ', '%20')}/${gameId}` },
                  )
                  .setTimestamp(gameInfo.gameCreation || '❔')
                  .setImage(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/champion/${championName.replace(' ', '')}.png`)
                  .setFooter('League of Legends');

                if (participantData.hasOwnProperty('timeline')) {
                  const { timeline } = participantData;

                  for (const key of Object.keys(timeline)) {
                    // console.log(key);
                    if (key.includes('Diff')) {
                      const formatKey = key.toString().replace(/([a-z])([A-Z])/g, '$1 $2').slice(0, -7).toLowerCase();
                      messageEmbed.addField(capitalize(formatKey) || '❔', '->', false);
                      for (const innerKey of Object.keys(timeline[key])) {
                        messageEmbed.addField(innerKey || '❔', timeline[key][innerKey].toFixed(2) || '❔', true);
                      }
                    }
                  }
                }

                message.channel.send(messageEmbed);
              };
            } else {
              // console.log(gameData);
              message.channel.send('<❌> === 🔥 ERROR GETTING GAME DATA 🔥 ===');
              console.log(gameData);
            }
          };
        }
      };
    } catch (e) {
      message.reply(' error with the command `lastgame`.');
      console.log('<❌> error with the command seen.');
      console.log('<❌>' + e);
      return;
    }
  }

  if (checkPrefix(message, 'livegame')) {
    try {
      const Http = new XMLHttpRequest();
      Http.responseType = 'json';
      let name = message.content.slice('$livegame '.length).toLowerCase();
      console.log(`<❔> Getting ${name} live game for ${message.author.username}`);
      name = name.replace(' ', '%20');
      const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotApiKey}`;
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
          const gameUrl = `https://eun1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${riotApiKey}`;
          HttpGame.open('GET', gameUrl);
          HttpGame.send();
          HttpGame.onload = function (error) {
            const liveGameData = JSON.parse(HttpGame.responseText);
            console.log(`<✅> Got data about ${summonerName}.`);
            // console.log(liveGameData);
            if (liveGameData.hasOwnProperty('status')) {
              message.channel.send(`${summonerName} not in game.`);
            } else {
              let champion = 0;
              for (let i = 0; i < liveGameData.participants.length; i += 1) {
                if (liveGameData.participants[i].summonerId === summonerId) {
                  champion = liveGameData.participants[i].championId;
                }
              }
              const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${summonerName} in game as ${champs.readChampion(champion)}`)
                .addFields(
                  { name: 'For', value: convertSecondsToTime(liveGameData.gameLength) },
                  { name: 'Stats link', value: `https://porofessor.gg/pl/live/eune/${summonerName.replace(' ', '%20')}` },
                )
                .setImage(`http://ddragon.leagueoflegends.com/cdn/10.8.1/img/champion/${champs.readChampion(champion).replace(' ', '')}.png`)
                .setTimestamp(liveGameData.gameStartTime)
                .setFooter('League of Legends');

              message.channel.send(exampleEmbed);
            }
          };
        }
      };
    } catch (e) {
      message.reply(' error with the command `livegame`.');
      console.log('<❌> Error with the command livegame.');
      console.log('<❌>' + e);
      return;
    }
  }

  if (checkPrefix(message, 'rotation')) {
    try {
      console.log(`<❔> Geting data about rotation for ${message.author.username}`);
      const HttpRotation = new XMLHttpRequest();
      HttpRotation.responseType = 'json';
      const rotationUrl = `https://eun1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${riotApiKey}`;
      HttpRotation.open('GET', rotationUrl);
      HttpRotation.send();
      HttpRotation.onload = function (e) {
        console.log('<✅> Got rotation data.');
        const rotationInfo = JSON.parse(HttpRotation.responseText);
        const exampleEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Free champions')
          .setAuthor('Ziewamy Blacha')
          .addField('Free champions this week', formatRotation(rotationInfo))
          .setTimestamp()
          .setFooter('League of Legends');

        message.channel.send(exampleEmbed);
      };
    } catch (e) {
      message.reply(' error with the command `rotation`.');
      console.log('<❌> Error with the command rotation.');
      console.log('<❌>' + e);
      return;
    }
  }

  // if (checkPrefix(message, 'seen')) {
  //   try {
  //     if (message.mentions.users.first() === undefined) {
  //       message.reply('please mention a user.');
  //       console.log(`<❌> User was not mentioned. ${message.author.username}`);
  //       return;
  //     }
  //     const data = null;
  //     const dbRequest = new XMLHttpRequest();
  //     dbRequest.withCredentials = true;
  //     const { id } = message.mentions.users.first();
  //     const name = message.mentions.users.first().username;
  //     console.log(`<❔> Geting seen data about ${name} for ${message.author.username}`);
  //     dbRequest.open('GET', `https://kvstore.p.rapidapi.com/collections/discord_data/items/${id}_ostatnia_wizyta`);
  //     dbRequest.setRequestHeader('x-rapidapi-host', 'kvstore.p.rapidapi.com');
  //     dbRequest.setRequestHeader('x-rapidapi-key', rapidApiKey);
  //     dbRequest.send(data);
  //     dbRequest.addEventListener('readystatechange', function () {
  //       if (this.readyState === this.DONE) {
  //         // console.log(this.responseText);
  //         console.log(`<✅> Got data about ${name}.`);
  //         const dataPawel = JSON.parse(this.responseText);
  //         if (!dataPawel.hasOwnProperty('status')) {
  //           const timeData = parseInt(dataPawel.value, 10);
  //           const exampleEmbed = new Discord.MessageEmbed()
  //             .setColor('#0099ff')
  //             .setTitle(`${name} ostatnio na kanale:`)
  //             .setDescription(calculateTimeDiff(timeData))
  //             .setAuthor('Ziewamy Blacha')
  //             .setTimestamp(timeData);
  //           if (name === 'E-Zigarette') {
  //             exampleEmbed.setFooter('Persona non grata', 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/reversed-hand-with-middle-finger-extended_emoji-modifier-fitzpatrick-type-3_1f595-1f3fc_1f3fc.png');
  //           }
  //           message.channel.send(exampleEmbed);
  //         } else if (message.mentions.users.first().bot) {
  //           message.channel.send('Brak danych. Użytkownik ' + `${message.mentions.users.first()}` + ' jest botem. 😕');
  //         } else if (name === 'E-Zigarette' && false) {
  //           message.channel.send('🖕🏼⛔');
  //         } else {
  //           message.channel.send('Brak danych o ' + `${message.mentions.users.first()}` + ' 😕');
  //         }
  //       }
  //     });
  //   } catch (e) {
  //     message.reply(' error with the command `seen`.');
  //     console.log('<❌> Error with the command seen.');
  //     console.log('<❌>' + e);
  //     return;
  //   }
  // }

  if (checkPrefix(message, 'corona')) {
    let country = message.content.slice('$corona '.length).toLowerCase();
    if (country === '') {
      console.log('<❔> Country empty, getting default country');
      message.reply('<❌> country was not specified. Getting default - Poland.')
      country = 'Poland'
    }
    console.log(`<❔> Getting data about ${country} | Corona`)
    try {
      var data = null;
      var coronaHttp = new XMLHttpRequest();
      coronaHttp.withCredentials = true;
      coronaHttp.open("GET", `https://covid-193.p.rapidapi.com/statistics?country=${country}`);
      coronaHttp.setRequestHeader("x-rapidapi-host", "covid-193.p.rapidapi.com");
      coronaHttp.setRequestHeader("x-rapidapi-key", rapidApiKey);
      coronaHttp.send(data);
    } catch (e) {
      message.reply(' error sending request to COVID-19 API.');
      console.log('<❌> Error sending request to COVID-19 API.');
      return;
    }

    coronaHttp.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        console.log(`<✅> Got data about country.`);
        try {
          const coronaData = JSON.parse(this.responseText);
          // console.log(coronaData);
          const response = coronaData.response[0];
          // console.log(response);
          if (response === undefined) {
            message.reply(` error getting data about ${country}.`);
            console.log('<❌> Got connection but country was wrong.')
            return;
          }
          const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Information about Coronavirus in ${response.country}:`)
            .setDescription(`Total cases: ${response.cases.total}`)
            .addFields(
              { name: 'New cases', value: response.cases.new, inline: true },
              { name: 'Active cases', value: response.cases.active, inline: true },
              { name: 'Critical cases', value: response.cases.critical, inline: true },
              { name: 'Recovered cases', value: response.cases.recovered, inline: true },
              { name: 'New deaths', value: response.deaths.new, inline: true },
              { name: 'Deaths', value: response.deaths.total, inline: true },
              { name: 'Tests count', value: response.tests.total, inline: true })
            .setAuthor('COVID-19')
            .setTimestamp(response.time);
          message.channel.send(exampleEmbed);
        } catch (e) {
          console.log('<❌> Error while formatting data about coronavirus.');
          return;
        }
      }
    });
  }

  if (checkPrefix(message, 'seen')) {
    if (message.mentions.users.first() === undefined) {
      message.reply('please mention a user.');
      console.log(`<❌> User was not mentioned. ${message.author.username}`);
      return;
    }
    const { id } = message.mentions.users.first();
    const name = message.mentions.users.first().username;

    googleDB.dbRead().then(data => {
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
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${name} ostatnio na kanale:`)
        .setDescription(calculateTimeDiff(timeData) + " ago")
        .addFields(
          { name: '🎙️ Time connected / week', value: preetifyMinutes(properData.minutes_connected), inline: true },
          { name: '🔇 Time on mute / week', value: preetifyMinutes(properData.minutes_on_mute), inline: false },
          // {name: 'Channel level', value: `${properData.channel_level} lvl`, inline: true },
          { name: '🎙️ Time connected / all', value: preetifyMinutes(properData.all_time_minutes), inline: false },
          { name: '🔇 Time on mute / all', value: preetifyMinutes(properData.all_time_on_mute), inline: true },
        )
        .setAuthor('Ziewamy Blacha')
        .setFooter('📅')
        .setTimestamp(timeData);
      message.channel.send(exampleEmbed);
    });
  }

  if (checkPrefix(message, 'ranking')) {
    displayRanking();
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  const newUserChannel = newMember.voiceChannel;
  const oldUserChannel = oldMember.voiceChannel;
  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    console.log('ciekawe');
  } else if (newUserChannel === undefined) {
    try {
      if (newMember.channel.hasOwnProperty('name') && newMember.channel.name !== 'AFK') {
        console.log(`<🎤> User ${newMember.member.displayName} on channel ${newMember.channel.name}`);
        console.log(`<✅> Saving data for ${newMember.member.displayName} || id: ${newMember.member.id}`);
        // const channel = client.channels.cache.get('654415996702162987');
        const dataTime = Date.now();
        googleDB.dbRead().then(data => {
          console.log('<✅> Reading database.');
          let properData = undefined;
          let index = 0;
          for (let i = 0; i < data.length; i += 1) {
            if (data[i].discord_id === newMember.member.id) {
              properData = data[i]
              index = i;
            }
          }
          if (properData === undefined) {
            console.log('<✅> Creating new user in db.');
            googleDB.dbAddNewUser(newMember.member.id, newMember.member.displayName, dataTime);
            return;
          } else {
            console.log('<✅> Found user. Updating data.');
            //update username
            properData.username = newMember.member.displayName;

            //timediff since last update
            const timeDiff = parseFloat(((dataTime - parseInt(properData.last_seen, 10)) / 60000).toFixed(2));
            //check if muting or deafening
            if ((oldMember.mute && !newMember.mute) || (oldMember.deaf && !newMember.mute)) {
              properData.minutes_on_mute = parseFloat(properData.minutes_on_mute, 10) + timeDiff;
              properData.minutes_day_afk = parseFloat(properData.minutes_day_afk, 10) + timeDiff;
              properData.all_time_on_mute = parseFloat(properData.all_time_on_mute, 10) + timeDiff;
            }
            //check if last time was connected
            if (oldMember.channel != null && oldMember.channel.name !== 'AFK') {
              properData.minutes_connected = parseFloat(properData.minutes_connected, 10) + timeDiff;
              properData.minutes_day = parseFloat(properData.minutes_day, 10) + timeDiff;
              properData.all_time_minutes = parseFloat(properData.all_time_minutes, 10) + timeDiff;
            }
            properData.last_seen = dataTime;
            googleDB.dbUpdateUser(properData, index);
          }
        });
      }

      if (oldMember.channel != null && oldMember.channel.name !== 'AFK' && newMember.channel.name === 'AFK') {
        const dataTime = Date.now();
        googleDB.dbRead().then(data => {
          console.log('<✅> Reading database.');
          let properData = undefined;
          let index = 0;
          for (let i = 0; i < data.length; i += 1) {
            if (data[i].discord_id === newMember.member.id) {
              properData = data[i]
              index = i;
            }
          }
          if (properData === undefined) {
            console.log('<✅> Creating new user in db.');
            googleDB.dbAddNewUser(newMember.member.id, newMember.member.displayName, dataTime);
            return;
          } else {
            console.log('<✅> Found user. Updating data.');
            //update username
            properData.username = newMember.member.displayName;

            //timediff since last update
            const timeDiff = parseFloat(((dataTime - parseInt(properData.last_seen, 10)) / 60000).toFixed(2));
            //check if muting or deafening
            if (oldMember.mute || oldMember.deaf) {
              properData.minutes_on_mute = parseFloat(properData.minutes_on_mute, 10) + timeDiff;
              properData.minutes_day_afk = parseFloat(properData.minutes_day_afk, 10) + timeDiff;
              properData.all_time_on_mute = parseFloat(properData.all_time_on_mute, 10) + timeDiff;
            }
            properData.minutes_connected = parseFloat(properData.minutes_connected, 10) + timeDiff;
            properData.minutes_day = parseFloat(properData.minutes_day, 10) + timeDiff;
            properData.all_time_minutes = parseFloat(properData.all_time_minutes, 10) + timeDiff;
            properData.last_seen = dataTime;
            googleDB.dbUpdateUser(properData, index);
          }
        });
      }
    } catch (e) {
      console.log('<🔥> User has left the server.');
      if (oldMember.channel != null && oldMember.channel.name !== 'AFK' && !newMember.hasOwnProperty('channel')) {
        const dataTime = Date.now();
        googleDB.dbRead().then(data => {
          console.log('<✅> Reading database.');
          let properData = undefined;
          let index = 0;
          for (let i = 0; i < data.length; i += 1) {
            if (data[i].discord_id === oldMember.member.id) {
              properData = data[i]
              index = i;
            }
          }
          if (properData === undefined) {
            console.log('<✅> Creating new user in db.');
            googleDB.dbAddNewUser(oldMember.member.id, oldMember.member.displayName, dataTime);
            return;
          } else {
            console.log('<✅> Found user. Updating data.');
            //update username
            properData.username = newMember.member.displayName;

            //timediff since last update
            const timeDiff = parseFloat(((dataTime - parseInt(properData.last_seen, 10)) / 60000).toFixed(2));

            //check if was muted or deafeaned
            if (oldMember.mute || oldMember.deaf) {
              properData.minutes_on_mute = parseFloat(properData.minutes_on_mute, 10) + timeDiff;
              properData.minutes_day_afk = parseFloat(properData.minutes_day_afk) + timeDiff;
              properData.all_time_on_mute = parseFloat(properData.all_time_on_mute, 10) + timeDiff;
            }
            properData.minutes_connected = parseFloat(properData.minutes_connected, 10) + timeDiff;
            properData.minutes_day = parseFloat(properData.minutes_day, 10) + timeDiff;
            properData.all_time_minutes = parseFloat(properData.all_time_minutes, 10) + timeDiff;

            properData.last_seen = dataTime;


            googleDB.dbUpdateUser(properData, index);
          }
        });
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);
