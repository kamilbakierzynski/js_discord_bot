module.exports = {
    name: 'ranking',
    description: 'Display current server activity ranking.',
    execute(client, message) {
        client.helpers.displayRankingWithData(client, client.localCache);
    }
};