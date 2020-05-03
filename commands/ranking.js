module.exports = {
    name: 'ranking',
    description: 'Display current server activity ranking.',
    execute(client, message) {
        client.googledb.refreshDbDataAll(client).then(result =>
            setTimeout(() => client.helpers.displayRanking(client), 2000)
            );
    }
};