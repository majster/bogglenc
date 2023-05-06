import * as admin from 'firebase-admin';
import * as https from 'https';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

export interface Word {
  value: string;
  source: string;
  cachedSince: string;
}

export function checkWord(word: string): Promise<Word | null> {
  return checkCache(word).then((cachedWord) => {
    return cachedWord ?? checkFran(word);
  });
}

function checkCache(word: string): Promise<Word | null> {
  return getWordsDb()
    .doc(word)
    .get()
    .then((doc) => {
      if (doc.exists) {
        functions.logger.info(`Found in Cache: ${word}`);
      }
      return doc.exists ? (doc.data() as Word) : null;
    });
}

function checkFran(word: string): Promise<Word | null> {
  return new Promise((resolve, reject) => {
    const url = getFranUrl(word);
    const date = new Date().toISOString();

    https
      .get(url, (franRes) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = [];
        franRes.on('data', (chunk) => {
          data.push(chunk);
        });

        franRes.on('end', () => {
          const franData = JSON.parse(
            Buffer.concat(data).toString(),
          ) as string[];

          let matchingWord: Word | null = null;

          franData.forEach((franWord) => {
            const newWord = {
              value: franWord,
              source: url,
              cachedSince: date,
            };

            if (word === franWord) {
              matchingWord = newWord;
            }

            updateCache(newWord);
          });

          if (matchingWord) {
            functions.logger.info(`Found in Fran: ${word}`);
            resolve(matchingWord);
          } else {
            resolve(null);
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

function getFranUrl(word: string) {
  // 133 = SSKJ 2
  return `https://fran.si/ajax/iskanje/autocomplete?query=${word}&dictionaries=133`;
}

function updateCache(newWord: Word): Promise<void> {
  return getWordsDb()
    .doc(newWord.value)
    .set(newWord)
    .then(() => {
      functions.logger.info('Cached word', { word: newWord });
    });
}

function getWordsDb() {
  return db.collection('words');
}
