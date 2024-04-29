import { ApiClient, HelixPoll, HelixPrediction } from '@twurple/api';
import { HttpStatusCodeError } from '@twurple/api-call';
import { Bot, BotCommandContext, createBotCommand } from '@twurple/easy-bot';
import { Auth } from './auth';
import { Config } from './config';
import { exemptChatters } from './constants/exemptChatters';
import { Shoutouts } from './shoutouts';
import { ErrorJSON } from './types/errors';
import { isBroadcaster, isMod } from './utils/permissions';
import { randomQuote, shuffleChatters } from './utils/thanos';
import { validatePredictionParams } from './utils/validParams';

export class ShortyBot {
  config: Config;
  auth: Auth;
  apiClient: ApiClient;
  bot: Bot;
  shoutouts: Shoutouts;
  prediction?: HelixPrediction;
  poll?: HelixPoll;

  constructor() {
    this.config = new Config();
    this.auth = new Auth(this.config);

    this.prediction = undefined;
    this.poll = undefined;
  }

  async initialize() {
    await this.auth.initializeAuthProvider();

    this.bot = new Bot({
      authProvider: this.auth.authProvider,
      channel: this.config.twitchUserName,
      commands: [
        createBotCommand('prediction', this.predictionHandler),
        createBotCommand('poll', this.pollHandler),
        createBotCommand('reset', this.resetHandler),
        createBotCommand('thanos', this.thanosHandler),
        createBotCommand('cancel', this.cancelHandler),
      ],
      chatClientOptions: {
        requestMembershipEvents: true,
      },
    });

    this.apiClient = this.bot.api;

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
    if (!isMod(context)) {
      context.reply('Only the broadcaster / mods can cancel!');
      return;
    }

    if (!this.poll && !this.prediction) {
      context.reply(
        'Nothing to cancel! If a prediction or poll was made without ShortyBot, please cancel it manually.',
      );
      return;
    }

    if (this.prediction) {
      await this.apiClient.predictions
        .cancelPrediction(this.config.twitchUserId, this.prediction.id)
        .then(() => {
          context.reply('Prediction cancelled!');
          this.prediction = undefined;
        });
    }

    if (this.poll) {
      await this.apiClient.polls
        .endPoll(this.config.twitchUserId, this.poll.id, true)
        .then(() => {
          context.reply('Poll cancelled!');
          this.poll = undefined;
        });
    }
  };

  raidhandler = ({ userName, viewerCount }) => {
    this.bot.say(
      this.config.twitchUserName,
      `HOLY THANK YOU @${userName} for the BIG RAID of ${viewerCount}!`,
    );
    this.bot.say(this.config.twitchUserName, `!so @${userName}`);
  };

  thanosHandler = async (_params: string[], context: BotCommandContext) => {
    if (!isBroadcaster(context)) {
      context.reply('Only the broadcaster can snap ;)');
      return;
    }

    const { data: chatters } = await this.bot.api.chat.getChatters(
      this.config.twitchUserId,
    );

    const usersToSnap = shuffleChatters(chatters).slice(0, chatters.length / 2);
    await Promise.all(
      usersToSnap.map((chatter) => {
        if (exemptChatters.includes(chatter.userName)) {
          return Promise.resolve('exempt');
        } else {
          return this.bot.timeout(
            this.config.twitchUserName,
            chatter.userName,
            5,
          );
        }
      }),
    );

    this.bot.say(this.config.twitchUserName, randomQuote());
  };

  joinHandler = (_channel: string, user: string) => {
    console.log(user, ' has joined chat!');
  };

  resetHandler = async (_params: string[], context: BotCommandContext) => {
    if (!isBroadcaster(context)) {
      context.reply('Only the broadcaster can reset!');
      return;
    }

    this.shoutouts.reset();
    context.reply('Shoutout reset triggered!');
  };

  predictionHandler = async (params: string[], context: BotCommandContext) => {
    if (!isMod(context)) {
      context.reply(
        'Only the broadcaster / mods can make and resolve predictions!',
      );
      return;
    }

    if (this.prediction) {
      try {
        validatePredictionParams(this.prediction, params);

        await this.apiClient.predictions.resolvePrediction(
          this.config.twitchUserId,
          this.prediction.id,
          this.prediction.outcomes[parseInt(params[1]) - 1].id,
        );
      } catch (e) {
        this.errorHandler(e, context.msg.id);
      }
    } else {
      this.createPrediction(context);
    }
  };

  createPrediction = async (context: BotCommandContext) => {
    return await this.apiClient.predictions
      .createPrediction(this.config.twitchUserId, {
        title: 'Win the next game?',
        outcomes: ['Yes', 'No'],
        autoLockAfter: 60,
      })
      .then((prediction) => (this.prediction = prediction))
      .catch((e) => this.errorHandler(e, context.msg.id));
  };

  pollHandler = async (_params: string[], context: BotCommandContext) => {
    if (!isMod(context)) {
      context.reply('Only the broadcaster / mods can make polls ;)');
      return;
    }

    await this.apiClient.polls
      .createPoll(this.config.twitchUserId, {
        title: "Whose fault is it if this poll doesn't work?",
        duration: 60,
        choices: ['Rick', 'Faded', 'QQobes33'],
        channelPointsPerVote: 10,
      })
      .then((poll) => (this.poll = poll))
      .catch((e) => this.errorHandler(e, context.msg.id));
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
