module.exports = {
    name: 'help',
    description: 'Display avaliable commands.',
    execute(client, message) {
        let cmds = '';
        client.commands.forEach((cmd) => {
            cmds += (` **${cmd.name}** | *${cmd.description}* \n`);
        });
        message.channel.send(cmds);
    },
};
