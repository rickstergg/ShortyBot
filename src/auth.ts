import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from 'fs';
import { Config } from './config';
import { tokenPath } from './constants/directories';

export class Auth {
  config: Config;
  authProvider: RefreshingAuthProvider;

  constructor(config: Config) {
    this.config = config;
  }

  async initializeAuthProvider() {
    if (process.env.ENVIRONMENT === 'prod') {
      // if we're in prod, write the tokens file.
      // await this.config.writeTokenFile();
    }

    const tokenData: AccessToken = JSON.parse(
      await fs.readFile(tokenPath(this.config.twitchUserId), 'utf-8'),
    );

    this.authProvider = new RefreshingAuthProvider({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
    });

    this.authProvider.onRefresh(
      async (twitchUserId, newTokenData) =>
        await fs.writeFile(
          tokenPath(twitchUserId),
          JSON.stringify(newTokenData, null, 2),
          'utf-8',
        ),
    );

    await this.authProvider.addUserForToken(tokenData, ['chat']);
  }
}
