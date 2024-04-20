import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import * as path from 'path';
import { scopes } from './constants/scopes';

dotenv.config({
  path: path.resolve(__dirname, `../${process.env.ENVIRONMENT}.env`),
});

export class Config {
  clientId: string;
  clientSecret: string;
  twitchUserName: string;
  twitchUserId: string;
  accessToken: string;
  refreshToken: string;

  constructor() {
    const {
      CLIENT_ID: clientId,
      CLIENT_SECRET: clientSecret,
      TWITCH_USER_NAME: twitchUsername,
      TWITCH_USER_ID: twitchUserId,
      ACCESS_TOKEN: accessToken,
      REFRESH_TOKEN: refreshToken,
    } = process.env;

    if (!clientId || !clientSecret) {
      throw Error('ClientId or ClientSecret is undefined!');
    }

    if (!twitchUsername || !twitchUserId) {
      throw Error('TwitchUserName or TwitchUserId is undefined!');
    }

    if (!accessToken || !refreshToken) {
      throw Error('AccessToken or RefreshToken is undefined!');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.twitchUserName = twitchUsername;
    this.twitchUserId = twitchUserId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async writeTokenFile() {
    const { ACCESS_TOKEN: accessToken, REFRESH_TOKEN: refreshToken } =
      process.env;

    const tokenData = {
      accessToken,
      refreshToken,
      scope: scopes,
      expiresIn: 0,
      obtainmentTimestamp: Date.now(),
    };

    await fs.writeFile(
      `./data/tokens.${this.twitchUserId}.json`,
      JSON.stringify(tokenData, null, 2),
      'utf-8',
    );
  }
}
