module.exports = {
    name: 'pkn',
    description: 'Papier, kamień, nożyce. Oznacz użytkowników z którymi chcesz zagrać.',
    async execute(client, message) {
        message.author.send("Papier, kamień, nożyce?").then(async (privateMsg) => {
            let usersMentioned = [];
            let counter = 0;
            const filter = (m) => {
                const msg = m.content.toLowerCase();
                return (msg === 'papier' || msg === 'kamień' || msg === 'nożyce');
            };
            message.mentions.users.forEach((value, key) => {
                if (!value.bot) {
                    counter += 1;
                    value.send('Papier, kamień, nożyce?').then((privateMentionsMsg) => {
                        const collectorMention = new client.Discord.MessageCollector(privateMentionsMsg.channel, filter);
                        collectorMention.on('collect', (messageCollected, col) => {
                            console.log(`Collected message: ${messageCollected.content}`);
                            usersMentioned = [...usersMentioned, `${messageCollected.author.username}: ${messageCollected.content}`];
                            message.channel.send(`Got message from ${messageCollected.author.username} | ${usersMentioned.length}/${counter + 1}`).then((msg) => msg.delete({ timeout: 2000 }));
                            countAndSend(usersMentioned, message, counter);
                            collectorMention.stop();
                        });
                    });
                }
            });
            const collector = new client.Discord.MessageCollector(privateMsg.channel, filter);
                        collector.on('collect', (messageCollected, col) => {
                            console.log(`Collected message: ${messageCollected.content}`);
                            usersMentioned = [...usersMentioned, `${messageCollected.author.username}: ${messageCollected.content}`];
                            message.channel.send(`Got message from ${messageCollected.author.username} | ${usersMentioned.length}/${counter + 1}`).then((msg) => msg.delete({ timeout: 2000 }));
                            countAndSend(usersMentioned, message, counter);
                            collector.stop();
                        });
        });

        function countAndSend(array, message, counter) {
            if (array.length === counter + 1) {
                array = ['```', ...array, '```'];
                message.channel.send(array);
            }
        }
    },
};
