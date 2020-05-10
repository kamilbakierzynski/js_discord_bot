const { XMLHttpRequest } = require('xmlhttprequest');

module.exports = {
    name: 'corona',
    description: 'Show current COVID-19 stats in selected country.',
    usage: `corona <country name>`,
    execute(client, message) {
        let country = message.content.slice('$corona '.length).toLowerCase();
        if (country === '') {
            console.log('<❔> Country empty, getting default country');
            country = client.configData.defaultCountryForCorona;
            message.reply(`<❌> country was not specified. Getting default - ${country}.`);
        }
        console.log(`<❔> Getting data about ${country} | Corona`);
        try {
            const data = null;
            var coronaHttp = new XMLHttpRequest();
            coronaHttp.withCredentials = true;
            coronaHttp.open("GET", `https://covid-193.p.rapidapi.com/statistics?country=${country}`);
            coronaHttp.setRequestHeader("x-rapidapi-host", "covid-193.p.rapidapi.com");
            coronaHttp.setRequestHeader("x-rapidapi-key", client.RAPID_API_KEY);
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
                    const response = coronaData.response[0];
                    if (response === undefined) {
                        message.reply(` error getting data about ${country}.`);
                        console.log('<❌> Got connection but country was wrong.');
                        return;
                    }
                    const coronaEmbed = new client.Discord.MessageEmbed()
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
                            { name: 'Tests count', value: response.tests.total, inline: true },
)
                        .setAuthor('COVID-19')
                        .setTimestamp(response.time);
                    message.channel.send(coronaEmbed);
                } catch (e) {
                    console.log('<❌> Error while formatting data about coronavirus.');
                }
            }
        });
    },
};
