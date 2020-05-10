module.exports = async (client, message) => {
    if (message.author.bot || message.content.charAt(0) !== client.configData.prefix) return;
    try {
        client.commands.get(message.content.substring(1).split(" ")[0]).execute(client, message);
    } catch (e) {
        console.log(e);
        message.reply(" wrong command or there was a problem with the one you've typed.");
    }
};
