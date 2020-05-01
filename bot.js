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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`<🔔> App is running on port ${PORT}!`);
});
app.get('/', (req, res) => {
  // res.send(`<✅> SERVER UP!; <🔔> Current port: ${PORT}`);
  res.sendFile(path.join(__dirname + '/index.html'));
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