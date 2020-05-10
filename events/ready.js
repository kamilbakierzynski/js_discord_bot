const cron = require('cron');

module.exports = async client => {
    console.log(`<🔔> Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activity: { name: client.configData.botGamePlay, type: 'PLAYING' },
        status: 'online',
    })
        .catch(console.error);

    console.log('<🕛> JOB EVERY DAY 22:00:01 (00:00:01 UTC +2) change channel title.');
    let changeChannelTitle = new cron.CronJob('01 00 22 * * *', () => {
        client.channels.fetch(client.configData.mainTextChannelId).then(channel => {
            const { name } = channel;
            const day = parseInt(name.split('-')[1], 10);
            console.log(`<🕛> Changing channel name from ${name} to dzień-${day + 1}.`);
            try {
                channel.setName(`dzień-${day + 1}}`);
                channel.send(`✅ Channel name changed to dzień-${day + 1}.`);
                console.log('<✅> Channel name changed.');
            } catch (e) {
                console.log('<❌> Error while changing channel name.');
                channel.send(`❌ Channel name changed failed.`);
                console.log(e);
            }
        });
    });
    console.log('<🕛> JOB EVERY MON 02:59:30 (04:59:30 UTC +2) clear database and show winners.');
    let clearDatabase = new cron.CronJob('30 59 02 * * MON', () => {
        console.log(`<🕛> Running DB job.`);
        client.channels.fetch(client.configData.mainTextChannelId).then(channel => {
            channel.send('🕛 Reset ranking scores.');
            try {
                client.datasaver.clearWeekRanking(client);
                channel.send(`✅ Clear ranking.`);
            } catch (e) {
                console.log('<❌> Error while clearing db.');
                channel.send(`❌ Clear job failed.`);
                console.log(e);
            }
        });
    });
    console.log('<🕛> JOB EVERY MON 02:59:20 (04:59:20 UTC +2) save data');
    let saveDatabase = new cron.CronJob('20 59 02 * * MON', () => {
        console.log(`<🕛> Running save data.`);
        client.channels.fetch(client.configData.mainTextChannelId).then(channel => {
            channel.send('🕛 Final results.');
            try {
                client.helpers.displayRankingWithData(client, client.localCache);
            } catch (e) {
                console.log('<❌> Error while save scores and final results.');
                channel.send(`❌ Save job failed.`);
                console.log(e);
            }
        });
    });
    console.log('<🕛> JOB EVERY DAY 02:59:02 (04:59:00 UTC +2) archive database.');
    let archiveDatabase = new cron.CronJob('02 59 02 * * *', () => {
        console.log(`<🕛> Running archive job.`);
        client.channels.fetch(client.configData.mainTextChannelId).then(channel => {
            channel.send('🕛 Data backup.');
            try {
                client.googledb.archiveData(client);
                channel.send(`✅ Data backup.`);
            } catch (e) {
                console.log('<❌> Error while archiveData.');
                channel.send(`❌ Data backup failed.`);
                console.log(e);
            }
        });
    });
    console.log('<🕛> JOB EVERY MIN save local data.');
    let saveDataLocally = new cron.CronJob('00 * * * * *', () => {
        if (client.localCache !== undefined) {
            client.datasaver.saveDataLocally(client);
        }
    });
    console.log('<🕛> JOB EVERY [15 MIN] upload data.');
    let uploadData = new cron.CronJob('0/15 * * * *', () => {
        if (client.localCache !== undefined) {
            console.log('<🕛> Uploading data to Google Sheet');
            client.datasaver.updateOnlineDb(client);
        }
    });
    console.log('<🕛> JOB EVERY [30 MIN] change auth code.');
    let changeAuthCode = new cron.CronJob('0/30 * * * *', () => {
        client.authCode = ((Math.random() * 100000) + 11111).toFixed(0);
    });


    //ensure we have some value at the start
    client.authCode = ((Math.random() * 100000) + 11111).toFixed(0);

    archiveDatabase.start();
    clearDatabase.start();
    changeChannelTitle.start();
    saveDatabase.start();
    client.datasaver.updateLocalCache(client).then(data => {
        saveDataLocally.start();
        uploadData.start();
    });
    changeAuthCode.start();
}