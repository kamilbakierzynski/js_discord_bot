module.exports = {
    name: 'ranking',
    description: 'Display current server activity ranking.',
    execute(client, message) {
        client.googledb.refreshDbDataAll(client);
    }
};