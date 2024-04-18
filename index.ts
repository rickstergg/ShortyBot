import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import 'dotenv/config';
import { promises as fs } from 'fs';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const twitchUsername = process.env.TWITCH_USERNAME;
const twitchUserId = process.env.TWITCH_USER_ID;

if (!clientId || !clientSecret) {
  throw Error('Client ID or Client Secret not configured!');
}

if (!twitchUsername || !twitchUserId) {
  throw Error('Twitch Username or Twitch ID not configured!');
}

// Make sure keys are camelCased
const tokenData = JSON.parse(
  await fs.readFile(`./tokens.${twitchUserId}.json`, 'utf-8'),
);

const authProvider = new RefreshingAuthProvider({
  clientId,
  clientSecret,
});

authProvider.onRefresh(
  async (userId, newTokenData) =>
    await fs.writeFile(
      `./tokens.${userId}.json`,
      JSON.stringify(newTokenData, null, 4),
      'utf-8',
    ),
);

await authProvider.addUserForToken(tokenData, ['chat']);

const apiClient = new ApiClient({ authProvider });

const bot = new Bot({
  authProvider,
  channels: [twitchUsername],
  commands: [
    createBotCommand('dice', (params, { reply }) => {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      reply(`You rolled a ${diceRoll}`);
    }),
    createBotCommand('slap', (params, { userName, say }) => {
      say(
        `${userName} slaps ${params.join(' ')} around a bit with a large trout`,
      );
    }),
    createBotCommand('prediction', async (params, { userName, reply }) => {
      const mods = await bot.getMods(twitchUsername);
      if (mods.map((mod) => mod.userName).includes(userName)) {
        await apiClient.predictions.createPrediction(twitchUserId, {
          title: 'Win the next game?',
          outcomes: ['Yes', 'No'],
          autoLockAfter: 60,
        });
      } else {
        reply('Only a mod can make predictions ;)');
      }
    }),
    createBotCommand('poll', async (params, { userName, reply }) => {
      const mods = await bot.getMods(twitchUsername);
      if (mods.map((mod) => mod.userName).includes(userName)) {
        await apiClient.polls.createPoll(twitchUserId, {
          title: "Whose fault is it if this poll doesn't work?",
          duration: 60,
          choices: ['Rick', 'Faded', 'QQobes33'],
          channelPointsPerVote: 10,
        });
      } else {
        reply('Only a mod can make polls ;)');
      }
    }),
  ],
});

bot.onMessage(({ broadcasterName, userDisplayName }) => {
  console.log('bot onMessage');
  bot.say(broadcasterName, `@${userDisplayName} says something`);
});

bot.onConnect(() => {
  console.log('EasyBot has connected!');
});
