import { promises as fs } from 'fs';

export class ShoutoutManager {
  streamerList: string[];
  streamers: Set<string>;

  async initialize() {
    const streamerList = JSON.parse(
      await fs.readFile('./data/streamers.json', 'utf-8'),
    );

    this.streamerList = streamerList.streamers;
    this.streamers = new Set(this.streamerList);

    if (!this.streamers.size) {
      console.log('streamers list is empty!');
    }
  }

  reset() {
    this.streamers = new Set(this.streamerList);
  }

  shouldShoutOut(userName: string) {
    if (this.streamers.has(userName)) {
      this.streamers.delete(userName);
      return true;
    }
    return false;
  }
}
