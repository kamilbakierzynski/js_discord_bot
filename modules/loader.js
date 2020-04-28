const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);

require('dotenv').config({ path: "../.env" });

exports.registerModules = async client => {
  const moduleFiles = await readdir('./modules/');
  console.log(`Loading ${moduleFiles.length} modules`);
  moduleFiles.forEach(file => {
    const moduleName = file.split('.')[0];
    if (moduleName === 'loader') {
      return;
    }
    client[moduleName.toLowerCase()] = require('./' + moduleName);
  });
};

exports.registerCommands = async client => {
  const cmdFiles = await readdir('./commands/');
  if (cmdFiles.length > 0)
    console.log(`Loading ${cmdFiles.length} commands`);
  const registeredCommands = [];
  cmdFiles.forEach(file => {
    const commandName = file.split('.')[0];
    const props = require(`../commands/${file}`);
    client.commands.set(props.name, props);
    registeredCommands.push(commandName);
  });
  console.log(`Loaded: [${registeredCommands.join(' ')}]`);
};

exports.registerEvents = async client => {
  const eventFiles = await readdir('./events/');
  console.log(`Loading ${eventFiles.length} events`);

  const registeredEvents = [];
  eventFiles.forEach(file => {
    const eventName = file.split('.')[0];
    const evt = require(`../events/${file}`);
    client.on(eventName, evt.bind(null, client));
    registeredEvents.push(eventName);
  });
  console.log(`Loaded: [${registeredEvents.join(' ')}]`);
};

exports.registerSecrets = async client => {
  client.RIOT_API_KEY = process.env.RIOT_API_KEY;
  client.RAPID_API_KEY = process.env.RAPID_API_KEY;
}