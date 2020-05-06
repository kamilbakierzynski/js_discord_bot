const Discord = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.loader = require('./modules/loader');
client.Discord = Discord;
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());

const urlencodedParser = bodyParser.urlencoded({ extended: false });

let data = {};

app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`<🔔> App is running on port ${PORT}!`);
  data.port = PORT;
});

app.get('/', (req, res) => {
    data.username = client.user.tag;
    data.commandsCount = client.commands.size;
    data.readyAt = client.readyAt.toDateString();
    res.render('home', {data: data});
});

app.get('/signin', (req, res) => {
  data.username = client.user.tag;
  data.commandsCount = client.commands.size;
  data.readyAt = client.readyAt.toDateString();
  if (client.dashboard.checkKey(client, req.cookies.loggedin)) {
    const statsData = client.dashboard.loadData(client);
    data = {...data, ...statsData};
    data.timeChart = ['0', '10', '21', '52', '0', '10', '21', '52'];
    res.render('index', {data: data});
  } else {
    client.channels.fetch('654415996702162987').then(channel => {
      channel.send(`Login page authorization code: ◻️${client.authCode}◻️`).then(msg => msg.delete({ timeout: 20000 }));
    });
    res.render('signin', {data: data});
  }
  console.log(data.authCode);
});

app.post('/signin', urlencodedParser, (req, res) => {
  console.log(req.body.password);
  if (client.authCode === req.body.password) {
    console.log(true);
    res.cookie("loggedin", client.dashboard.findKey(client), {expire: 300000 + Date.now()});
    const statsData = client.dashboard.loadData(client);
    data = {...data, ...statsData};
    data.timeChart = ['0', '0', '0', '0', '0', '0', '0', '0'];
    console.log(data);
    res.render('index', {data: data});
  } else {
    res.redirect('/signin');
  }
});

app.get('/ranking', (req, res) => {
  if (client.dashboard.checkKey(client, req.cookies.loggedin)) {
  const topStatsData = client.dashboard.loadDataRanking(client);
  data = {...data, ...topStatsData};
  res.render('ranking', {data: data});
  } else {
    res.redirect('/signin');
  }
});

const init = async () => {
    const loader = client.loader;
    await loader.registerModules(client);
    await loader.registerCommands(client);
    await loader.registerEvents(client);
    await loader.registerSecrets(client);
    await client.login(process.env.BOT_TOKEN);
};

init();