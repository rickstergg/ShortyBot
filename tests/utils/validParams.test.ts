import { describe, expect, it } from '@jest/globals';
// import type { HelixPredictionOutcomeData } from '@twurple/api/lib/interfaces/endpoints/prediction.external';
import { validateCooldownParams } from '../../src/utils/validParams.ts';

// TODO: Fix this typing issue, it's due to the fact that we can't import the HelixPredictionOutcomeData type from the @twurple/api package.
// Things might have changed in the two minor versions, which might have introduced new types.
describe('validParams', () => {
  // describe('validatePredictionParams', () => {
  //   let outcomes: HelixPredictionOutcomeData[];
  //   let prediction: HelixPrediction;

  //   beforeAll(() => {
  //     outcomes = [
  //       {
  //         id: '1',
  //         title: 'Yes',
  //         users: 0,
  //         channel_points: 0,
  //         top_predictors: null,
  //         color: 'BLUE',
  //       },
  //       {
  //         id: '2',
  //         title: 'No',
  //         users: 0,
  //         channel_points: 0,
  //         top_predictors: null,
  //         color: 'PINK',
  //       },
  //     ];

  //     prediction = new HelixPrediction({
  //       id: '123',
  //       broadcaster_id: '456',
  //       broadcaster_login: '',
  //       broadcaster_name: 'rickstergg',
  //       title: 'Will we win this game?',
  //       winning_outcome_id: undefined,
  //       outcomes: outcomes,
  //       prediction_window: 60,
  //       status: 'ACTIVE',
  //       created_at: new Date().toString(),
  //       ended_at: undefined,
  //       locked_at: undefined,
  //     });
  //   });

  //   describe('with the wrong number of params', () => {
  //     it('should throw an error', () => {
  //       expect(() => {
  //         validatePredictionParams(prediction, ['too', 'many', 'params']);
  //       }).toThrow();
  //     });
  //   });

  //   describe('with an index that is out of bounds', () => {
  //     it('should throw an error', () => {
  //       expect(() => {
  //         validatePredictionParams(prediction, ['resolve', '1000']);
  //       }).toThrow();
  //     });
  //   });

  //   describe('with proper params', () => {
  //     it('should not throw an error', () => {
  //       expect(() => {
  //         validatePredictionParams(prediction, ['resolve', '1']);
  //       }).not.toThrow();
  //     });
  //   });
  // });

  describe('validateCooldownParams', () => {
    describe('with invalid params', () => {
      it('should throw an error for an undefined array', () => {
        expect(() => {
          validateCooldownParams(undefined);
        }).toThrow();
      });

      it('should throw an error for empty array', () => {
        expect(() => {
          validateCooldownParams([]);
        }).toThrow();
      });

      it('should throw an error for an undefined championName', () => {
        expect(() => {
          validateCooldownParams([undefined, 'w']);
        }).toThrow();
      });

      it('should throw an error for an undefined spellName', () => {
        expect(() => {
          validateCooldownParams(['Shen', undefined]);
        }).toThrow();
      });

      it('should throw an error for an invalid spellName', () => {
        expect(() => {
          validateCooldownParams(['Shen', 'g']);
        }).toThrow();
      });
    });

    describe('with valid params', () => {
      describe('with champ name and spell name', () => {
        it('should return successfully', () => {
          expect(() => {
            validateCooldownParams(['Shen', 'r']);
          }).not.toThrow();
        });
      });

      describe('with ability haste', () => {
        describe('valid haste', () => {
          it('should return successfully', () => {
            expect(() => {
              validateCooldownParams(['Shen', 'r', '100']);
            }).not.toThrow();
          });
        });

        describe('invalid haste', () => {
          it('should throw when ability haste less than 0', () => {
            expect(() => {
              validateCooldownParams(['Shen', 'r', '-1']);
            }).toThrow();
          });

          it('should throw when ability haste over 300', () => {
            expect(() => {
              validateCooldownParams(['Shen', 'r', '420']);
            }).toThrow();
          });
        });
      });
    });
  });
});
