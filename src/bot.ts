import {
  ApiClient,
  HelixChannelUpdate,
  HelixCustomReward,
  HelixPoll,
  HelixPrediction,
} from '@twurple/api';
import { HttpStatusCodeError } from '@twurple/api-call';
import { ChatMessage } from '@twurple/chat';
import { Bot, BotCommandContext, createBotCommand } from '@twurple/easy-bot';
import { Auth } from './auth';
import { Config } from './config';
import { exemptChatters } from './constants/exemptChatters';
import * as games from './constants/gameIds';
import { OpenAIClient } from './openai/client';
import { RiotClient } from './riot/client';
import { Shoutouts } from './shoutouts';
import { ErrorJSON } from './types/errors';
import { checkSpam } from './utils/checkSpam';
import { isBroadcaster, isMod } from './utils/permissions';
import { randomQuote, shuffleChatters } from './utils/thanos';
import { clipEditUrl } from './utils/urls';
import {
  validateCooldownParams,
  validatePredictionParams,
} from './utils/validParams';

export class ShortyBot {
  config: Config;
  auth: Auth;
  apiClient: ApiClient;
  bot: Bot;
  league: RiotClient;
  openai: OpenAIClient;

  shoutouts: Shoutouts;
  prediction?: HelixPrediction;
  poll?: HelixPoll;
  reward?: HelixCustomReward;

  constructor() {
    this.config = new Config();
    this.auth = new Auth(this.config);

    this.prediction = undefined;
    this.poll = undefined;
    this.reward = undefined;

    if (process.env.RIOT_API_KEY) {
      this.league = new RiotClient();
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAIClient();
    }
  }

  async initialize() {
    await this.auth.initializeAuthProvider();

    this.bot = new Bot({
      authProvider: this.auth.authProvider,
      channel: this.config.twitchUserName,
      commands: [
        createBotCommand('prediction', this.predictionHandler),
        createBotCommand('poll', this.pollHandler),
        createBotCommand('clip', this.clipHandler),
        createBotCommand('cancel', this.cancelHandler),
        createBotCommand('rank', this.rankHandler),

        // ShortyBot Specific commands
        createBotCommand('reset', this.resetHandler),
        createBotCommand('thanos', this.thanosHandler),

        // Title / Stream commands
        createBotCommand('title', this.titleHandler),
        createBotCommand('lol', this.lolhandler),
        createBotCommand('valorant', this.valorantHandler),
        createBotCommand('tft', this.tftHandler),
        createBotCommand('ow2', this.ow2handler),

        // Queue Redemptions
        createBotCommand('createQueue', this.createQueueHandler),
        createBotCommand('queue', this.queueHandler),

        // League Commands
        createBotCommand('cd', this.cooldownHandler),
      ],
      chatClientOptions: {
        requestMembershipEvents: true,
      },
    });

    this.apiClient = this.bot.api;

    this.bot.onConnect(this.onConnect);
    this.bot.onRaid(this.raidhandler);
    this.bot.chat.onJoin(this.joinHandler);
    this.bot.chat.onMessage(this.onChatMessage);

    this.shoutouts = new Shoutouts();
    await this.shoutouts.initialize(this.config.twitchUserName);

    if (process.env.RIOT_API_KEY) {
      await this.league.loadChamps();
    }
  }

  onChatMessage = async (
    channel: string,
    userName: string,
    text: string,
    message: ChatMessage,
  ) => {
    if (channel !== this.config.twitchUserName) {
      return;
    }

    if (this.shoutouts.shouldShoutOut(userName)) {
      await this.bot.say(this.config.twitchUserName, `!so ${userName}`);
    }

    if (process.env.OPENAI_API_KEY) {
      const { data } = await this.bot.api.channels.getFollowedChannels(
        this.config.twitchUserId,
      );

      // DEBUG
      console.log(JSON.stringify(data))


      // if (checkSpam({ followerData: data, message: message })) {
      //   const response = await this.openai.checkSpam(text);
      //   console.log(response);

      //   if (response.isSpam) {
      //     await this.bot.reply(this.config.twitchUserName, '"?" - ShortyB', message.id);
      //     await this.bot.deleteMessageById(
      //       this.config.twitchUserId,
      //       message.id,
      //     );
      //     console.log('Deleted');
      //   }
      // }
    }
  };

  /* This is the old version of onMessage, we don't get any badge info from this, so deprecated.. */
  // onMessage = async (message: MessageEvent) => {
  //   const { userId, userName, text } = message;

  //   if (userName === this.config.twitchUserName) {
  //     return;
  //   }

  //   if (this.shoutouts.shouldShoutOut(userName)) {
  //     await this.bot.say(this.config.twitchUserName, `!so ${userName}`);
  //   }

  //   if (process.env.OPENAI_API_KEY) {
  //     const { data } = await this.bot.api.channels.getChannelFollowers(
  //       this.config.twitchUserId,
  //       userId,
  //     );

  //     const recent = recentlyFollowed(data);
  //     console.log('follower data for', userName, data);

  //     const notFollowing = data.length === 0;
  //     if (notFollowing || recent) {
  //       if (notFollowing) {
  //         console.log(`User ${userName} is not following - monitoring..`);
  //       }

  //       if (recent) {
  //         console.log(`User ${userName} recently followed - monitoring..`);
  //       }

  //       await this.openai
  //         .checkSpam(text)
  //         .then(async (resp) => {
  //           console.log(resp);

  //           if (resp.isSpam) {
  //             await message.reply('?');
  //             await message.delete();
  //             console.log('Deleted');
  //           }
  //         })
  //         .catch((e) => {
  //           console.log((e as Error).message);
  //         });
  //     }
  //   }
  // };

  onConnect = () => {
    console.log('Bot is connected to chat!');
  };

  titleHandler = async (params: string[], context: BotCommandContext) => {
    if (params[0].length) {
      await this.modifyStreamInfo({ title: params[0] }).then(() => {
        context.reply('Stream info updated!');
      });
    } else {
      context.reply('Please supply a title!');
    }
  };

  cooldownHandler = async (params: string[], context: BotCommandContext) => {
    if (!process.env.RIOT_API_KEY) {
      context.say('Riot API is not setup!');
      return;
    }

    try {
      validateCooldownParams(params);

      await this.league.getCooldowns(params).then((response: string) => {
        context.say(response);
      });
    } catch (e) {
      console.log(e);
      this.errorHandler(e, context.msg.id);
    }
  };

  rankHandler = async (_params: string[], context: BotCommandContext) => {
    if (!process.env.HDEV_API_KEY) {
      context.say('Valorant API is not setup!');
      return;
    }

    try {
      await fetch(`https://api.henrikdev.xyz/valorant/v3/mmr/na/pc/10 Piece Chicken/Fries`, { headers: {
        'Authorization': `${process.env.HDEV_API_KEY}`,
        'Content-Type': 'application/json'
      }}).then((response: any) => {
        return response.json()
      }).then((resp) => {
        const current = resp.data.current;
        context.reply(`${current.tier.name} - ${current.rr}rr`)
      })
    } catch (e) {
      console.log(e);
      this.errorHandler(e, context.msg.id);
    }
  };

  lolhandler = async (_params: string[], context: BotCommandContext) => {
    await this.modifyStreamInfo({ gameId: games.LOL }).then(() =>
      context.reply('Stream info updated!'),
    );
  };

  ow2handler = async (_params: string[], context: BotCommandContext) => {
    await this.modifyStreamInfo({ gameId: games.OW2 }).then(() =>
      context.reply('Stream info updated!'),
    );
  };

  valorantHandler = async (_params: string[], context: BotCommandContext) => {
    await this.modifyStreamInfo({ gameId: games.VALORANT }).then(() =>
      context.reply('Stream info updated!'),
    );
  };

  tftHandler = async (_params: string[], context: BotCommandContext) => {
    await this.modifyStreamInfo({ gameId: games.TFT }).then(() =>
      context.reply('Stream info updated!'),
    );
  };

  modifyStreamInfo = async (data: HelixChannelUpdate) => {
    return await this.apiClient.channels.updateChannelInfo(
      this.config.twitchUserId,
      {
        ...data,
      },
    );
  };

  clipHandler = async (_params: string[], context: BotCommandContext) => {
    await this.apiClient.clips
      .createClip({
        channel: this.config.twitchUserId,
        createAfterDelay: false,
      })
      .then((clipId) => {
        context.reply(`You may edit the clip here: ${clipEditUrl(clipId)}`);
      })
      .catch((e) => this.errorHandler(e, context.msg.id));
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

  queueHandler = async (_params: string[], context: BotCommandContext) => {
    if (!isBroadcaster(context)) {
      return;
    }

    if (!this.reward) {
      const rewards = await this.bot.api.channelPoints.getCustomRewards(
        this.config.twitchUserId,
      );

      const queueReward = rewards.find((reward) =>
        reward.title.toLowerCase().includes('queue'),
      );

      if (queueReward) {
        this.reward = queueReward;
      } else {
        context.say('No rewards with "queue" in the title.');
        return;
      }
    }

    await this.bot.api.channelPoints
      .getRedemptionsForBroadcaster(
        this.config.twitchUserId,
        this.reward.id,
        'UNFULFILLED',
        { newestFirst: false },
      )
      .then((redemptions) => {
        const users = redemptions.data.map(
          (redemption) => redemption.userDisplayName,
        );

        if (!users.length) {
          context.say('Queue is empty!');
          return;
        } else {
          context.say(`Next: ${users.join(', ')}`);
        }
      })
      .catch((e) => this.errorHandler(e, context.msg.id));
  };

  createQueueHandler = async (
    _params: string[],
    context: BotCommandContext,
  ) => {
    if (!isBroadcaster(context)) {
      return;
    }

    const rewards = await this.bot.api.channelPoints.getCustomRewards(
      this.config.twitchUserId,
    );

    const queueReward = rewards.find((reward) =>
      reward.title.toLowerCase().includes('queue'),
    );

    if (queueReward) {
      this.reward = queueReward;
      context.say('Queue redemption already exists!');
    } else {
      await this.bot.api.channelPoints
        .createCustomReward(this.config.twitchUserId, {
          title: 'JOIN THE QUEUE',
          cost: 3300,
          prompt: 'Join the Comp Queue',
          isEnabled: true,
        })
        .then((reward) => {
          this.reward = reward;
          context.say('Queue redemption created.');
        })
        .catch((e) => {
          this.reward = undefined;
          this.errorHandler(e, context.msg.id);
        });
    }
  };

  thanosHandler = async (_params: string[], context: BotCommandContext) => {
    if (!isBroadcaster(context)) {
      context.reply('Only the broadcaster can snap ;)');
      return;
    }

    const { data: chatters } = await this.apiClient.chat.getChatters(
      this.config.twitchUserId,
    );

    let exempt = [];

    const requests = Promise.all([
      this.bot.getMods(this.config.twitchUserName),
      // this.bot.getVips(this.config.twitchUserName),
    ]);

    await requests
      .then(([mods]) => {
        exempt = [
          ...mods.map((mod) => mod.userName),
          // ...vips.map((vip) => vip.name), Even VIPs are not safe.
          ...exemptChatters,
          this.config.twitchUserName,
        ];
      })
      .catch((e) => {
        console.log('Mods and VIPs were not able to be returned.');
        console.log(`Error: ${(e as Error).message}`);
      });

    const snappableChatters = exempt.length
      ? chatters.filter((chatter) => !exempt.includes(chatter.userName))
      : chatters;

    const usersToSnap = shuffleChatters(snappableChatters).slice(
      0,
      snappableChatters.length / 2,
    );

    Promise.all(
      usersToSnap.map((chatter) => {
        return this.bot.timeout(
          this.config.twitchUserName,
          chatter.userName,
          15,
        );
      }),
    )
      .then(() => {
        this.bot.say(this.config.twitchUserName, randomQuote());
      })
      .catch((e) => {
        console.log('It seems you went for the head this time...');
        console.log(`Error: ${(e as Error).message}`);
      });
  };

  joinHandler = (_channel: string, user: string) => {
    console.log(user, 'has joined chat!');
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
    console.log(e);
    if (e instanceof HttpStatusCodeError) {
      const errorJson: ErrorJSON = JSON.parse(e.body);
      this.bot.reply(this.config.twitchUserName, errorJson.message, messageId);
    } else {
      this.bot.reply(
        this.config.twitchUserName,
        e.message ?? 'An error occurred',
        messageId,
      );
    }
  };
}
