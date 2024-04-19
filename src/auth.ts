import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from 'fs';
import { Config } from './config';

export class Auth {
  config: Config;
  authProvider: RefreshingAuthProvider;

  constructor(config: Config) {
    this.config = config;
  }

  async initializeAuthProvider() {
    console.log('Initializing auth provider..');
    const tokenData: AccessToken = JSON.parse(
      await fs.readFile(
        `./data/tokens.${this.config.twitchUserId}.json`,
        'utf-8',
      ),
    );

    this.authProvider = new RefreshingAuthProvider({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
    });

    this.authProvider.onRefresh(
      async (userId, newTokenData) =>
        await fs.writeFile(
          `./data/tokens.${userId}.json`,
          JSON.stringify(newTokenData, null, 4),
          'utf-8',
        ),
    );

    await this.authProvider.addUserForToken(tokenData, ['chat']);
    console.log('Auth provider initialized!');
  }
}
