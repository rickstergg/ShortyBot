import 'dotenv/config';
import { RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import { promises as fs } from 'fs';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const twitchUsername = process.env.TWITCH_USERNAME;
const twitchUserId = process.env.TWITCH_USER_ID;

// Make sure keys are camelCased
const tokenData = JSON.parse(await fs.readFile(`./tokens.${twitchUserId}.json`, 'utf-8'));

const authProvider = new RefreshingAuthProvider(
	{
		clientId,
		clientSecret
	}
);

authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'utf-8'));

await authProvider.addUserForToken(tokenData, ['chat']);

const bot = new Bot({
	authProvider,
	channels: [twitchUsername],
	commands: [
		createBotCommand('dice', (params, { reply }) => {
			const diceRoll = Math.floor(Math.random() * 6) + 1;
			reply(`You rolled a ${diceRoll}`);
		}),
		createBotCommand('slap', (params, { userName, say }) => {
			say(`${userName} slaps ${params.join(' ')} around a bit with a large trout`);
		})
	]
});

bot.onConnect(() => {
	console.log('bot has connected!');
})

bot.onMessage(({ broadcasterName, userDisplayName }) => {
	console.log('onMessage');
	bot.say(broadcasterName, `@${userDisplayName} says something`)
})

console.log('Initialized!');
