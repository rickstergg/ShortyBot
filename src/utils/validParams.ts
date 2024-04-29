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
