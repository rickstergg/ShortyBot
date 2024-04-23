import { promises as fs } from 'fs';
import { streamerPath } from './constants/directories';

export class Shoutouts {
  streamerList: string[];
  streamersToShoutout: Set<string>;

  async initialize() {
    const streamerList = JSON.parse(await fs.readFile(streamerPath, 'utf-8'));

    this.streamerList = streamerList.streamers;
    this.streamersToShoutout = new Set(this.streamerList);

    if (!this.streamersToShoutout.size) {
      console.log('streamers list is empty!');
    }
  }

  reset() {
    this.streamersToShoutout = new Set(this.streamerList);
  }

  shouldShoutOut(userName: string) {
    if (this.streamersToShoutout.has(userName)) {
      this.streamersToShoutout.delete(userName);
      return true;
    }
    return false;
  }
}
