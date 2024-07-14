import { promises as fs } from 'fs';
import { streamerPath } from './utils/directories';

export class Shoutouts {
  streamerList: string[];
  streamersToShoutout: Set<string>;
  streamerName: string;

  async initialize(streamerName: string) {
    const streamerList: { streamers: string[] } = JSON.parse(
      await fs.readFile(streamerPath, 'utf-8'),
    );

    this.streamerList = streamerList.streamers;
    this.streamersToShoutout = new Set(this.streamerList);
    this.streamerName = streamerName;

    if (this.streamersToShoutout.has(streamerName)) {
      this.streamersToShoutout.delete(streamerName);
    }

    if (!this.streamersToShoutout.size) {
      console.log('streamers list is empty!');
    }
  }

  reset() {
    this.streamersToShoutout = new Set(this.streamerList);

    if (this.streamersToShoutout.has(this.streamerName)) {
      this.streamersToShoutout.delete(this.streamerName);
    }
  }

  shouldShoutOut(userName: string) {
    if (this.streamersToShoutout.has(userName)) {
      this.streamersToShoutout.delete(userName);
      return true;
    }
    return false;
  }
}
