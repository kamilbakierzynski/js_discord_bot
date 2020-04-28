const cron = require('cron');

module.exports = async client => {
    console.log(`<🔔> Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activity: { name: 'League of Legends', type: 'PLAYING' },
        status: 'idle',
    })
        .catch(console.error);

    console.log('<🕛> JOB AT 22:00:01 (00:00:01 UTC +2) change channel title.');
    let changeChannelTitle = new cron.CronJob('01 00 22 * * *', () => {
        client.channels.fetch('654415996702162987').then(channel => {
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
    console.log('<🕛> JOB EVERY MON 03:00:01 (05:00:01 UTC +2) clear database and show winners.');
    let clearDatabase = new cron.CronJob('01 00 03 * * MON', () => {
        console.log(`<🕛> Running DB job.`);
        displayRanking();
        client.googledb.clearMinutesWeekly();
    });
    console.log('<🕛> JOB EVERY DAY 02:59:00 (04:59:00 UTC +2) archive database.');
    let archiveDatabase = new cron.CronJob('30 59 02 * * *', () => {
        console.log(`<🕛> Running archive job.`);
        client.googledb.archiveData();
    });


    archiveDatabase.start();
    clearDatabase.start();
    changeChannelTitle.start();
}