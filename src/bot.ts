import { ApiClient } from '@twurple/api';
import { Bot, BotCommandContext, createBotCommand } from '@twurple/easy-bot';
import { Auth } from './auth';
import { Config } from './config';
import { isMod } from './utils/isMod';

export class ShortyBot {
  config: Config;
  auth: Auth;
  apiClient: ApiClient;
  bot: Bot;

  constructor() {
    this.config = new Config();
    this.auth = new Auth(this.config);
  }

  async initialize() {
    await this.auth.initializeAuthProvider();
    this.apiClient = new ApiClient({ authProvider: this.auth.authProvider });
    this.bot = new Bot({
      authProvider: this.auth.authProvider,
      channel: this.config.twitchUserName,
      commands: [
        createBotCommand('prediction', this.predictionHandler),
        createBotCommand('poll', this.pollHandler),
      ],
    });
    this.bot.onMessage(this.onMessage);
    this.bot.onConnect(this.onConnect);
  }

  onMessage = ({ broadcasterName, userDisplayName }) => {
    console.log('bot onMessage');
    this.bot.say(broadcasterName, `@${userDisplayName} says something`);
  };

  onConnect = () => {
    console.log('Bot is connected!');
  };

  predictionHandler = async (_: string[], context: BotCommandContext) => {
    if (isMod(context)) {
      await this.apiClient.predictions.createPrediction(
        this.config.twitchUserId,
        {
          title: 'Win the next game?',
          outcomes: ['Yes', 'No'],
          autoLockAfter: 60,
        },
      );
    } else {
      context.reply('Only the broadcaster / mods can make predictions ;)');
    }
  };

  pollHandler = async (params: string[], context: BotCommandContext) => {
    if (isMod(context)) {
      await this.apiClient.polls.createPoll(this.config.twitchUserId, {
        title: "Whose fault is it if this poll doesn't work?",
        duration: 60,
        choices: ['Rick', 'Faded', 'QQobes33'],
        channelPointsPerVote: 10,
      });
    } else {
      context.reply('Only the broadcaster / mods can make polls ;)');
    }
  };
}
