module.exports = {
    name: 'save',
    description: 'Force saving data.',
    execute(client, message) {
        if (message.author.id !== client.configData.adminDiscordId) {
            message.channel.send('🚫 Insufficient permission.');
            return;
        }
        if (client.localCache !== undefined) {
            client.datasaver.updateOnlineDb(client);
            message.channel.send('⚠️ Forced uploading data to Google Sheet');
        }
    },
};
