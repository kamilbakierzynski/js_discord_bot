const { XMLHttpRequest } = require('xmlhttprequest');

module.exports = {
    name: 'status',
    description: 'Check status of League of Legends servers.',
    execute(client, message) {
        console.log('<❔> Getting data about LoL server status.');
        const Http = new XMLHttpRequest();
        Http.responseType = 'json';
        const url = `https://eun1.api.riotgames.com/lol/status/v3/shard-data?api_key=${client.RIOT_API_KEY}`;
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
            const exampleEmbed = new client.Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(data.name)
                .setAuthor('SERVER STATUS INFO')
                .addFields(
                    { name: services[0].name, value: client.helpers.capitalize(services[0].status + client.helpers.checkStatus(services[0].status)) },
                    { name: services[1].name, value: client.helpers.capitalize(services[1].status + client.helpers.checkStatus(services[1].status)) },
                    { name: services[2].name, value: client.helpers.capitalize(services[2].status + client.helpers.checkStatus(services[2].status)) },
                    { name: services[3].name, value: client.helpers.capitalize(services[3].status + client.helpers.checkStatus(services[3].status)) },
                )
                .addField('Last incident', lastIncidentFormat)
                .setTimestamp()
                .setFooter('League of Legends');

            message.channel.send(exampleEmbed);
        };
    },
};
