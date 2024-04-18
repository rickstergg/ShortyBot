import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { Bot, BotCommandContext, createBotCommand } from '@twurple/easy-bot';
import 'dotenv/config';
import { promises as fs } from 'fs';
import { isMod } from './utils/isMod';

const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  TWITCH_USER_NAME: twitchUsername,
  TWITCH_USER_ID: twitchUserId,
} = process.env;

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

const predictionHandler = async (_: string[], context: BotCommandContext) => {
  if (isMod(context)) {
    await apiClient.predictions.createPrediction(twitchUserId, {
      title: 'Win the next game?',
      outcomes: ['Yes', 'No'],
      autoLockAfter: 60,
    });
  } else {
    context.reply('Only the broadcaster / mods can make predictions ;)');
  }
};

const pollHandler = async (params: string[], context: BotCommandContext) => {
  if (isMod(context)) {
    await apiClient.polls.createPoll(twitchUserId, {
      title: "Whose fault is it if this poll doesn't work?",
      duration: 60,
      choices: ['Rick', 'Faded', 'QQobes33'],
      channelPointsPerVote: 10,
    });
  } else {
    context.reply('Only the broadcaster / mods can make polls ;)');
  }
};

const bot = new Bot({
  authProvider,
  channel: twitchUsername,
  commands: [
    createBotCommand('prediction', predictionHandler),
    createBotCommand('poll', pollHandler),
  ],
});

bot.onMessage(({ broadcasterName, userDisplayName }) => {
  console.log('bot onMessage');
  bot.say(broadcasterName, `@${userDisplayName} says something`);
});

bot.onConnect(() => {
  console.log('EasyBot has connected!');
});
