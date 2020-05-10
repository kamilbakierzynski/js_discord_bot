module.exports = async (client, oldMember, newMember) => {
    const newUserChannel = newMember.voiceChannel;
    const oldUserChannel = oldMember.voiceChannel;
    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        console.log('ciekawe');
    } else if (newUserChannel === undefined) {
        if (newMember.member.user.bot) {
            console.log('<🎤> Skip bot.');
            return;
        }
        try {
            console.log(`<🎤> User ${newMember.member.displayName} on channel ${newMember.channel.name}`);
            const searchUser = client.localCache.filter((user) =>
                user.discord_id === newMember.member.id);
            if (searchUser.length === 0) {
                console.log('<✅> Creating new user in db.');
                client.datasaver.addNewUser(client,
                                            newMember.member.id,
                                            newMember.member.displayName,
                                            Date.now());
                return;
            }
        } catch (e) {
            console.log(`<🎤> User ${oldMember.member.displayName} left channel ${oldMember.channel.name}`);
        }
    }
};
