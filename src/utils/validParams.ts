import { HelixPrediction } from '@twurple/api';

export const validatePredictionParams = (
  prediction: HelixPrediction,
  params: string[],
) => {
  if (params.length < 2 || params[0] !== 'resolve') {
    throw Error(
      'Usage: !prediction resolve 2, for selecting the second outcome.',
    );
  }

  const outcomeIndex = parseInt(params[1]);
  if (outcomeIndex < 1 || outcomeIndex > prediction.outcomes.length) {
    throw Error(
      `Second parameter must be between 1 and ${prediction.outcomes.length}`,
    );
  }
};

export const validateCooldownParams = (params: string[]) => {
  const [championName, spellName, haste] = params;
  if (!championName || !spellName) {
    throw Error(
      'Usage: !cd requires a valid champion and spell name, e.g. !cd shen r',
    );
  }

  if (haste) {
    const abilityHaste = parseInt(haste);
    if (abilityHaste < 0 || abilityHaste > 300) {
      throw Error('Usage: !cd requires an ability haste between 0 and 300');
    }
  }
};
