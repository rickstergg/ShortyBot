import { BotCommandContext } from '@twurple/easy-bot';

export const isMod = (context: BotCommandContext) => {
  return context.msg.userInfo.isMod || context.msg.userInfo.isBroadcaster;
};

export const isBroadcaster = (context: BotCommandContext) => {
  return context.msg.userInfo.isBroadcaster;
};
