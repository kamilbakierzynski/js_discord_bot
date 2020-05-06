module.exports = {
    name: 'save',
    description: 'Force saving data.',
    execute(client, message) {
        if (message.author.id !== '339856582575915009') {
            message.channel.send('🚫 Insufficient permission.').then(msg => {
                msg.delete({ timer: 10000 });
            });
            return;
        }
        if (client.localCache !== undefined) {
            client.datasaver.updateOnlineDb(client);
            message.channel.send('⚠️ Forced uploading data to Google Sheet').then(msg => {
                msg.delete({ timer: 10000 });
            });
            return;
        }
        return;
    }
};