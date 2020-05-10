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

app.use(express.static(`${__dirname}/public`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`<🔔> App is running on port ${PORT}!`);
  data.port = PORT;
});

app.get('/', (req, res) => {
    data.username = client.user.tag;
    data.commandsCount = client.commands.size;
    data.readyAt = client.readyAt.toDateString();
    res.render('home', { data });
});

app.get('/signin', (req, res) => {
  data.username = client.user.tag;
  data.commandsCount = client.commands.size;
  data.readyAt = client.readyAt.toDateString();
  if (client.dashboard.checkKey(client, req.cookies.loggedin)) {
    res.cookie("loggedin", client.dashboard.findKey(client), { expire: 300000 + Date.now() });
    const statsData = client.dashboard.loadData(client);
    data = { ...data, ...statsData };
    client.googledb.getArchiveData().then((dataOnline) => {
      const { daysFields, valueFields } = dataOnline;
      data.timeChart = valueFields;
      data.timeChartLabels = daysFields;
      res.render('index', { data });
    });
  } else {
    client.channels.fetch(client.configData.mainTextChannelId).then((channel) => {
      channel.send(`Login page authorization code: ◻️${client.authCode}◻️`).then((msg) => msg.delete({ timeout: 20000 }));
    });
    res.render('signin', { data });
  }
});

app.get('/signin-fail', (req, res) => {
  res.render('signin-fail');
});

app.post('/signin', urlencodedParser, (req, res) => {
  console.log(req.body.password);
  if (client.authCode === req.body.password) {
    res.cookie("loggedin", client.dashboard.findKey(client), { expire: 300000 + Date.now() });
    const statsData = client.dashboard.loadData(client);
    data = { ...data, ...statsData };
    client.googledb.getArchiveData().then((dataOnline) => {
      const { daysFields, valueFields } = dataOnline;
      data.timeChart = valueFields;
      data.timeChartLabels = daysFields;
      res.render('index', { data });
    });
  } else {
    res.redirect('/signin-fail');
  }
});

app.get('/ranking', (req, res) => {
  if (client.dashboard.checkKey(client, req.cookies.loggedin)) {
  const topStatsData = client.dashboard.loadDataRanking(client);
  data = { ...data, ...topStatsData };
  res.render('ranking', { data });
  } else {
    res.redirect('/signin');
  }
});

const init = async () => {
    const { loader } = client;
    await loader.registerModules(client);
    await loader.registerCommands(client);
    await loader.registerEvents(client);
    await loader.registerSecrets(client);
    await client.login(process.env.BOT_TOKEN);
};

init();
