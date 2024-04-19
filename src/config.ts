import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, `../${process.env.ENVIRONMENT}.env`),
});

export class Config {
  clientId: string;
  clientSecret: string;
  twitchUserName: string;
  twitchUserId: string;

  constructor() {
    const {
      CLIENT_ID: clientId,
      CLIENT_SECRET: clientSecret,
      TWITCH_USER_NAME: twitchUsername,
      TWITCH_USER_ID: twitchUserId,
    } = process.env;

    if (!clientId || !clientSecret) {
      throw Error('Client Id or Secret is undefined!');
    }

    if (!twitchUsername || !twitchUserId) {
      throw Error('Twitch Username or Id is undefined!');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.twitchUserName = twitchUsername;
    this.twitchUserId = twitchUserId;
  }
}
