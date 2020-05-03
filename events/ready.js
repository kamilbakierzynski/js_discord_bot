const cron = require('cron');

module.exports = async client => {
    console.log(`<🔔> Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activity: { name: 'Baza danych', type: 'PLAYING' },
        status: 'online',
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
    console.log('<🕛> JOB EVERY MON 02:59:30 (04:59:30 UTC +2) clear database and show winners.');
    let clearDatabase = new cron.CronJob('30 59 02 * * MON', () => {
        console.log(`<🕛> Running DB job.`);
        client.channels.fetch('654415996702162987').then(channel => {
            channel.send('🕛 Reset ranking scores.');
            try {
                client.googledb.clearMinutesWeekly();
                channel.send(`✅ Clear ranking.`);
            } catch (e) {
                console.log('<❌> Error while clearing db.');
                channel.send(`❌ Clear job failed.`);
                console.log(e);
            }
        });
    });
    console.log('<🕛> JOB EVERY MON 02:58:30 (04:58:30 UTC +2) save data');
    let saveDatabase = new cron.CronJob('30 58 02 * * MON', () => {
        console.log(`<🕛> Running save data.`);
        client.channels.fetch('654415996702162987').then(channel => {
            channel.send('🕛 Save scores and display final results.'); 
            try {
                client.googledb.refreshDbDataAll(client);
            } catch (e) {
                console.log('<❌> Error while save scores and final results.');
                channel.send(`❌ Save job failed.`);
                console.log(e);
            }
        });
    });
    console.log('<🕛> JOB EVERY DAY 02:59:00 (04:59:00 UTC +2) archive database.');
    let archiveDatabase = new cron.CronJob('00 59 02 * * *', () => {
        console.log(`<🕛> Running archive job.`);
        client.channels.fetch('654415996702162987').then(channel => {
            channel.send('🕛 Data backup.');
            try {
                client.googledb.archiveData();   
                channel.send(`✅ Data backup.`);
            } catch (e) {
                console.log('<❌> Error while archiveData.');
                channel.send(`❌ Data backup failed.`);
                console.log(e);
            }
        });
    });


    archiveDatabase.start();
    clearDatabase.start();
    changeChannelTitle.start();
    saveDatabase.start();
}