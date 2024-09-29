import { HelixFollowedChannel } from '@twurple/api';
import { ChatMessage } from '@twurple/chat';
import { recentlyFollowed } from './followTime';

export type CheckSpamInput = {
  followerData: HelixFollowedChannel[];
  message: ChatMessage;
};

export type LogInput = {
  userName: string;
  badges: string[];
  recent: boolean;
  notFollowing: boolean;
  isFirst: boolean;
};

const BADGES_TO_EXEMPT = ['vip', 'broadcaster', 'partner'];

export const isExempt = (badges: string[]): boolean => {
  const exemptBadges = badges.filter((badge) =>
    BADGES_TO_EXEMPT.includes(badge),
  );

  return exemptBadges.length ? true : false;
};

export const log = (input: LogInput) => {
  const { userName, badges, recent, notFollowing, isFirst } = input;

  if (isFirst) {
    console.log(`User ${userName} is sending their first message..`);
  }

  if (!notFollowing) {
    console.log(`User ${userName} is not following - monitoring..`);
  }

  if (recent) {
    console.log(`User ${userName} recently followed, monitoring..`);
  }

  if ((isFirst || !notFollowing || recent) && badges) {
    console.log(`User ${userName} has the following badges: ${badges}`);
  }
};

export const checkSpam = (input: CheckSpamInput): boolean => {
  const { followerData, message } = input;
  const badges = Array.from(message.userInfo.badges.keys());

  if (isExempt(badges)) {
    return false;
  }

  const notFollowing = followerData.length === 0;
  if (notFollowing) {
    return true;
  }

  const recent = recentlyFollowed(followerData);

  log({
    userName: message.userInfo.displayName,
    badges,
    recent,
    notFollowing,
    isFirst: message.isFirst,
  });

  return recent || message.isFirst;
};
