const { Collection } = require('discord.js');

const Util = require('../structures/Util');
const JumpLink = require('../structures/JumpLink');
const { jumpLinkRegex, jumpLinkRegexGlobal } = JumpLink;

/**
 * Parses a discord.js Message, adding a "jumplinks" property that is a Collection<JumpLink>
 * @param {Message} message The discord.js Message to be parsed for JumpLinks
 */
async function parseMessage(message) {
	const { content } = message;

	if (!jumpLinkRegex.test(content)) return;

	message.jumplinks = new Collection();

	await Util.forEachAsync(content.match(jumpLinkRegexGlobal), async string => {
		const jumpLink = new JumpLink(string);
		await jumpLink.init();
		if (jumpLink.valid)	message.jumplinks.set(jumpLink.id, jumpLink);
	});
}

async function message(message) {
	if (message.author.bot) return;

	await parseMessage(message);

	if (message.jumplinks && message.jumplinks.size > 0) {
		let embeds = [];

		message.jumplinks.forEach(jumpLink => {
			if (jumpLink.valid) embeds.push(jumpLink.toEmbed());
		});

		let total = 0;
		Util.forEachAsync(embeds, async embed => {
			if (++total > 3) return;
			await message.channel.send({ embed });
		});
	}
}

module.exports = message;