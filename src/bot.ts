import { ApiClient } from '@twurple/api';
import { Bot, BotCommandContext, createBotCommand } from '@twurple/easy-bot';
import { Auth } from './auth';
import { Config } from './config';
import { ShoutoutManager } from './shoutoutManager';
import { isMod } from './utils/isMod';

export class ShortyBot {
  config: Config;
  auth: Auth;
  apiClient: ApiClient;
  bot: Bot;
  shoutoutManager: ShoutoutManager;

  constructor() {
    this.config = new Config();
    this.auth = new Auth(this.config);
  }

  async initialize() {
    this.shoutoutManager = new ShoutoutManager();
    await this.shoutoutManager.initialize();
    await this.auth.initializeAuthProvider();
    this.apiClient = new ApiClient({ authProvider: this.auth.authProvider });
    this.bot = new Bot({
      authProvider: this.auth.authProvider,
      channel: this.config.twitchUserName,
      commands: [
        createBotCommand('prediction', this.predictionHandler),
        createBotCommand('poll', this.pollHandler),
        createBotCommand('reset', this.resetHandler),
      ],
    });
    this.bot.onMessage(this.onMessage);
    this.bot.onConnect(this.onConnect);
  }

  onMessage = ({ userName }) => {
    if (this.shoutoutManager.shouldShoutOut(userName)) {
      this.bot.say(this.config.twitchUserName, `!so ${userName}`);
    }
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

  resetHandler = async (_: string[], context: BotCommandContext) => {
    if (isMod(context)) {
      this.shoutoutManager.reset();
      context.reply('Shoutout reset triggered!');
    } else {
      context.reply('Only the broadcaster / mods can reset ;)');
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
