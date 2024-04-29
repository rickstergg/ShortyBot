import { beforeAll, describe, expect, it } from '@jest/globals';
import { HelixPrediction } from '@twurple/api';
import { HelixPredictionOutcomeData } from '@twurple/api/lib/interfaces/endpoints/prediction.external';
import { validatePredictionParams } from './validParams';

describe('validParams', () => {
  describe('validatePredictionParams', () => {
    let outcomes: HelixPredictionOutcomeData[];
    let prediction: HelixPrediction;

    beforeAll(() => {
      outcomes = [
        {
          id: '1',
          title: 'Yes',
          users: 0,
          channel_points: 0,
          top_predictors: null,
          color: 'BLUE',
        },
        {
          id: '2',
          title: 'No',
          users: 0,
          channel_points: 0,
          top_predictors: null,
          color: 'PINK',
        },
      ];

      prediction = new HelixPrediction({
        id: '123',
        broadcaster_id: '456',
        broadcaster_login: '',
        broadcaster_name: 'rickstergg',
        title: 'Will we win this game?',
        winning_outcome_id: undefined,
        outcomes: outcomes,
        prediction_window: 60,
        status: 'ACTIVE',
        created_at: new Date().toString(),
        ended_at: undefined,
        locked_at: undefined,
      });
    });

    describe('with the wrong number of params', () => {
      it('should throw an error', () => {
        expect(() => {
          validatePredictionParams(prediction, ['too', 'many', 'params']);
        }).toThrow();
      });
    });

    describe('with an index that is out of bounds', () => {
      it('should throw an error', () => {
        expect(() => {
          validatePredictionParams(prediction, ['resolve', '1000']);
        }).toThrow();
      });
    });

    describe('with proper params', () => {
      it('should not throw an error', () => {
        expect(() => {
          validatePredictionParams(prediction, ['resolve', '1']);
        }).not.toThrow();
      });
    });
  });
});
