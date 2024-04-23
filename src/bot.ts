import { ApiClient } from '@twurple/api';
import { Bot, BotCommandContext, createBotCommand } from '@twurple/easy-bot';
import { Auth } from './auth';
import { Config } from './config';
import { Shoutouts } from './shoutouts';
import { isMod } from './utils/isMod';
import { randomQuote, shuffleNames } from './utils/thanos';

export class ShortyBot {
  config: Config;
  auth: Auth;
  apiClient: ApiClient;
  bot: Bot;
  shoutouts: Shoutouts;
  users: string[];

  constructor() {
    this.config = new Config();
    this.auth = new Auth(this.config);
    this.users = [];
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
        createBotCommand('reset', this.resetHandler),
        createBotCommand('users', this.userHandler),
        createBotCommand('thanos', this.thanosHandler),
      ],
      chatClientOptions: {
        requestMembershipEvents: true,
      },
    });

    this.bot.onMessage(this.onMessage);
    this.bot.onConnect(this.onConnect);
    this.bot.onRaid(this.raidhandler);
    this.bot.chat.onJoin(this.joinHandler);

    this.shoutouts = new Shoutouts();
    await this.shoutouts.initialize();
  }

  onMessage = ({ userName }) => {
    if (this.shoutouts.shouldShoutOut(userName)) {
      this.bot.say(this.config.twitchUserName, `!so ${userName}`);
    }
  };

  onConnect = () => {
    console.log('Bot is connected to chat!');
  };

  raidhandler = ({ userName, viewerCount }) => {
    this.bot.say(
      this.config.twitchUserName,
      `HOLY THANK YOU @${userName} for the BIG RAID of ${viewerCount}!`,
    );
    this.bot.say(this.config.twitchUserName, `!so @${userName}`);
  };

  thanosHandler = async (_params: string[], _context: BotCommandContext) => {
    const usersToSnap = shuffleNames(this.users);

    await Promise.all(
      usersToSnap.map((username) => {
        this.bot.timeout(this.config.twitchUserName, username, 5);
      }),
    );

    this.bot.say(this.config.twitchUserName, randomQuote());
  };

  joinHandler = (_channel: string, user: string) => {
    if (!this.users.includes(user)) {
      // Exempt certain users / bots.
      this.users.push(user);
    }
  };

  userHandler = async (_params: string[], _context: BotCommandContext) => {
    console.log(this.users.join(','));
  };

  predictionHandler = async (_params: string[], context: BotCommandContext) => {
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

  resetHandler = async (_params: string[], context: BotCommandContext) => {
    if (isMod(context)) {
      this.shoutouts.reset();
      context.reply('Shoutout reset triggered!');
    } else {
      context.reply('Only the broadcaster / mods can reset ;)');
    }
  };

  pollHandler = async (_params: string[], context: BotCommandContext) => {
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
