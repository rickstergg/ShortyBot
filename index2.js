import 'dotenv/config';
import { RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import { promises as fs } from 'fs';
import { ApiClient } from '@twurple/api';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const twitchUsername = process.env.TWITCH_USERNAME;
const twitchUserId = process.env.TWITCH_USER_ID;

let compqueue = [];
let queue_open=false;

// Make sure keys are camelCased
const tokenData = JSON.parse(await fs.readFile(`./tokens.${twitchUserId}.json`, 'utf-8'));

const authProvider = new RefreshingAuthProvider({
  clientId,
  clientSecret
});

authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'utf-8'));

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
      say(`${userName} slaps ${params.join(' ')} around a bit with a large trout`);
    }),
    createBotCommand('prediction', async (params, { userName, say, userId  }) => {
        let user_id= userId;
        const is_mod = await apiClient.moderation.checkUserMod(twitchUserId, user_id);
      if(is_mod)
      {
          await apiClient.predictions.createPrediction(twitchUserId, {
            title: 'Will Rick win the next game?',
            outcomes: ['yes', 'no', 'maybe'],
            autoLockAfter: 60,
          });
      }
    }),
    createBotCommand('poll', async (params, { userName, say, userId  }) => {
        let user_id= userId;
         const is_mod = await apiClient.moderation.checkUserMod(twitchUserId, user_id);
      if(is_mod)
      {
          await apiClient.polls.createPoll(twitchUserId, {
            title: 'Whos fault is it if this poll doesnt work?',
            duration: 60,
            choices: ['Rick', 'Faded', 'QQobes33'],
            channelPointsPerVote: 10,
          });
      }
    }),
    createBotCommand('queue join', async (params, { userName, say   }) => {
      if(queue_open===false)
      {
          say(`Sorry the queue is currently closed`);
      }
      else if(!inlist(userName))
      {
          compqueue.push(userName);
          say(`You have been added to queue ${userName}`);
      }
      else{
          say(`You are already in queue ${userName}`);
      }
    }),
    createBotCommand('queue list', async (params, { userName, say  }) => {
      let list = "The list for the Comp Queue is: ";
      for(let person of compqueue)
      {
          list = list.concat(" ", person);
      }
      say(`${list}`);
    }),
    createBotCommand('queue open', async (params, { userName, say, userId }) => {
      let user_id= userId;
      const is_mod = await apiClient.moderation.checkUserMod(twitchUserId, user_id);
      if(is_mod)
      {
          queue_open = true;
          say(`Comp Queue is now open for users to join! `);
      }
    }),
    createBotCommand('queue close', async (params, { userName, say, userId  }) => {
      let user_id= userId;
      const is_mod = await apiClient.moderation.checkUserMod(twitchUserId, user_id);
      if(is_mod)
      {
          queue_open = false;
          say(`Comp Queue is now closed `);
      }
    }),
    ]
});
function inlist(userName)
{
    for(let person of compqueue)
    {
        if(person === userName)
        {
            return true;
        }
    }
    return false;
}
bot.onMessage(({ broadcasterName, userDisplayName }) => {
  console.log('bot onMessage');
  bot.say(broadcasterName, `@${userDisplayName} says something`)
})

// apiClient.onConnect(() => {
// 	console.log('Api Client has connected!');
// });

bot.onConnect(() => {
  console.log('Bot has connected!');
})

