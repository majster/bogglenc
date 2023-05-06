import * as functions from 'firebase-functions';
import * as cors from 'cors';
import { checkWord } from './word-checker';

const MAX_WORD_LENGTH = 16;

export const wordCheck = functions
  .region('europe-west1')
  .https.onRequest((req, res) => {
    if (req.method !== 'GET') {
      res.status(405).send();
      return;
    }

    cors()(req, res, () => {
      const wordParam = (req.query.word as string) ?? '';
      const word = wordParam.trim().toLowerCase();
      functions.logger.debug(`Checking word: ${word}`);

      if (!word) {
        res.status(400).send('Missing word parameter!');
        return;
      }

      if (word.length > MAX_WORD_LENGTH) {
        res.status(400).send('Word is too long!');
        return;
      }

      return checkWord(word)
        .then((result) => {
          if (result) {
            functions.logger.info(`Word is valid: ${word}`);
            res.status(200).send(result?.value);
          } else {
            functions.logger.info(`Word is not valid: ${word}`);
            res.status(400).send('Wrong guess!');
          }
        })
        .catch((err) => {
          functions.logger.error(err);
          res.status(500).send('Something went wrong while checking the word!');
        });
    });
  });
