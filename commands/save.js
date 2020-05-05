module.exports = {
    name: 'save',
    description: 'Force saving data.',
    execute(client, message) {
        if (message.author.id !== '339856582575915009') {
            message.channel.send('🚫 Insufficient permission.').then(msg => {
                msg.delete({ timer: 5000 });
                message.delete({ timer: 5000 });
            });
            return;
        }
        if (client.localCache !== undefined) {
            client.datasaver.updateOnlineDb(client);
            message.channel.send('⚠️ Foced uploading data to Google Sheet').then(msg => {
                msg.delete({ timer: 5000 });
                message.delete({ timer: 5000 });
            });
            return;
        }
        return;
    }
};