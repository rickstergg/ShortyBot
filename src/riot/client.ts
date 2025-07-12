import { RiotAPI, RiotAPITypes } from '@fightmegg/riot-api';
import { cooldownsWithAbilityHaste } from '../utils/cooldown.ts';
import { spellNameIndexMapper } from '../utils/spellNameIndexMapper.ts';

export class RiotClient {
  locale: RiotAPITypes.DDragon.LOCALE;
  client: RiotAPI;
  champNames: Record<string, string> | undefined;

  constructor() {
    if (process.env.RIOT_API_KEY) {
      this.client = new RiotAPI(process.env.RIOT_API_KEY);
      this.locale = RiotAPITypes.DDragon.LOCALE.en_US;
      this.champNames = undefined;
    }
  }

  async loadChamps() {
    if (this.champNames) {
      return;
    }

    const version = await this.client.ddragon.versions.latest();
    const allChamps = await this.client.ddragon.champion.all({
      locale: RiotAPITypes.DDragon.LOCALE.en_US,
      version,
    });

    this.champNames = Object.fromEntries(
      Object.entries(allChamps.data).map(([k, v]) => [k.toLowerCase(), k]),
    );
  }

  async getCooldowns(params: string[]): Promise<string> {
    const [championName, spellName, abilityHaste] = params;

    const apiChampName = this.champNames[championName.toLowerCase()];
    if (apiChampName) {
      const champInfo = await this.client.ddragon.champion.byName({
        locale: RiotAPITypes.DDragon.LOCALE.en_US,
        championName: apiChampName,
      });

      const spellIndex = spellNameIndexMapper[spellName];
      const spell = champInfo.data[apiChampName].spells[spellIndex];

      return `${spell.name}: ${
        abilityHaste
          ? cooldownsWithAbilityHaste(spell.cooldown, parseInt(abilityHaste))
          : spell.cooldown.join(', ')
      }`;
    } else {
      throw new Error(`Champion name ${championName} not found!`);
    }
  }
}
