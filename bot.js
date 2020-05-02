const Discord = require('discord.js');
const express = require('express');
const cron = require('cron');
var path = require('path');

require('dotenv').config();

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.loader = require('./modules/loader');
client.Discord = Discord;


const app = express();
const ejs = require('ejs');
app.set('view engine', 'ejs');

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
    res.render('index', {data: data});
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