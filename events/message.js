require('dotenv').config({ path: "../.env" });

module.exports = async (client, message) => {
    if (message.author.bot || message.content.charAt(0) !== process.env.PREFIX) return;
    client.commands.get(message.content.substring(1).split(" ")[0]).execute(client, message);
};