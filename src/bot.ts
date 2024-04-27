import { ApiClient, HelixPoll, HelixPrediction } from '@twurple/api';
import { HttpStatusCodeError } from '@twurple/api-call';
import { Bot, BotCommandContext, createBotCommand } from '@twurple/easy-bot';
import { Auth } from './auth';
import { Config } from './config';
import { Shoutouts } from './shoutouts';
import { ErrorJSON } from './types/errors';
import { isMod } from './utils/isMod';
import { randomQuote, shuffleNames } from './utils/thanos';

export class ShortyBot {
  config: Config;
  auth: Auth;
  apiClient: ApiClient;
  bot: Bot;
  shoutouts: Shoutouts;
  users: string[];
  prediction?: HelixPrediction;
  poll?: HelixPoll;

  constructor() {
    this.config = new Config();
    this.auth = new Auth(this.config);
    this.users = [];

    this.prediction = undefined;
    this.poll = undefined;
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
        createBotCommand('cancel', this.cancelHandler),
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

  cancelHandler = async (_params: string[], context: BotCommandContext) => {
    if (this.prediction) {
      await this.apiClient.predictions
        .cancelPrediction(this.config.twitchUserId, this.prediction.id)
        .then(() => {
          this.bot.reply(
            this.config.twitchUserName,
            'Prediction cancelled!',
            context.msg.id,
          );

          this.prediction = undefined;
        });
    }

    if (this.poll) {
      await this.apiClient.polls
        .endPoll(this.config.twitchUserId, this.poll.id)
        .then(() => {
          this.bot.reply(
            this.config.twitchUserName,
            'Poll cancelled!',
            context.msg.id,
          );

          this.poll = undefined;
        });
    }

    if (!this.poll || !this.prediction) {
      this.bot.say(
        this.config.twitchUserName,
        'Nothing to cancel! If a prediction or poll was made without shorty bot, please cancel it manually.',
      );
    }
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

  resetHandler = async (_params: string[], context: BotCommandContext) => {
    if (isMod(context)) {
      this.shoutouts.reset();
      context.reply('Shoutout reset triggered!');
    } else {
      context.reply('Only the broadcaster / mods can reset ;)');
    }
  };

  predictionHandler = async (_params: string[], context: BotCommandContext) => {
    if (isMod(context)) {
      await this.apiClient.predictions
        .createPrediction(this.config.twitchUserId, {
          title: 'Win the next game?',
          outcomes: ['Yes', 'No'],
          autoLockAfter: 60,
        })
        .then((resp) => (this.prediction = resp))
        .catch((e) => this.errorHandler(e, context.msg.id));
    } else {
      context.reply('Only the broadcaster / mods can make predictions ;)');
    }
  };

  pollHandler = async (_params: string[], context: BotCommandContext) => {
    if (isMod(context)) {
      await this.apiClient.polls
        .createPoll(this.config.twitchUserId, {
          title: "Whose fault is it if this poll doesn't work?",
          duration: 60,
          choices: ['Rick', 'Faded', 'QQobes33'],
          channelPointsPerVote: 10,
        })
        .then((resp) => (this.poll = resp))
        .catch((e) => this.errorHandler(e, context.msg.id));
    } else {
      context.reply('Only the broadcaster / mods can make polls ;)');
    }
  };

  errorHandler = async (e: Error, messageId: string) => {
    if (e instanceof HttpStatusCodeError) {
      const errorJson: ErrorJSON = JSON.parse(e.body);
      this.bot.reply(this.config.twitchUserName, errorJson.message, messageId);
    } else {
      this.bot.reply(
        this.config.twitchUserName,
        'An error occurred',
        messageId,
      );
    }
  };
}
