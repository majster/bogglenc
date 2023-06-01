import { db } from './admin';
import * as crypto from 'crypto';
import * as wordService from './word';

type LetterScore = 1 | 2 | 3 | 4 | 5 | 7 | 10;
type LetterChar =
  | 'a'
  | 'b'
  | 'c'
  | 'č'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'r'
  | 's'
  | 'š'
  | 't'
  | 'u'
  | 'v'
  | 'z'
  | 'ž';

export interface Letter {
  char: LetterChar;
  score: LetterScore;
}

export interface Game {
  id: string;
  board: Letter[];
  score: number;
  wordCount: number;
  leaderboardRank: number | null;
  name: string | null;
  startedAt: number;
  endedAt: number | null;
  endedAndNamed: boolean;
}

export interface CheckWordResult {
  word: string;
  correct: boolean;
  scoreForWord: number;
  scoreForLetters: number;
  scoreForLength: number;
  game: Game;
}

const LETTERS: Letter[] = [
  { char: 'a', score: 1 },
  { char: 'b', score: 3 },
  { char: 'c', score: 3 },
  { char: 'č', score: 4 },
  { char: 'd', score: 2 },
  { char: 'e', score: 1 },
  { char: 'f', score: 7 },
  { char: 'g', score: 4 },
  { char: 'h', score: 5 },
  { char: 'i', score: 1 },
  { char: 'j', score: 4 },
  { char: 'k', score: 2 },
  { char: 'l', score: 1 },
  { char: 'm', score: 2 },
  { char: 'n', score: 2 },
  { char: 'o', score: 1 },
  { char: 'p', score: 3 },
  { char: 'r', score: 1 },
  { char: 's', score: 2 },
  { char: 'š', score: 4 },
  { char: 't', score: 2 },
  { char: 'u', score: 4 },
  { char: 'v', score: 4 },
  { char: 'z', score: 2 },
  { char: 'ž', score: 10 },
];

const RANDOM_LETTER_SCORE_WEIGHTS: { score: LetterScore; weight: number }[] = [
  { score: 1, weight: 50 },
  { score: 2, weight: 10 },
  { score: 3, weight: 10 },
  { score: 4, weight: 10 },
  { score: 5, weight: 5 },
  { score: 7, weight: 5 },
  { score: 10, weight: 5 },
];

const SCORE_BY_LENGTH: { [key: number]: number } = {
  3: 0,
  4: 1,
  5: 2,
  6: 4,
  7: 8,
  8: 16,
  9: 32,
  10: 64,
  11: 128,
  12: 256,
  13: 512,
  14: 1024,
  15: 2048,
  16: 4096,
};

const BOARD_SIZE = 16;
const MIN_WORD_LENGTH = 3;
const LEADERBOARD_ENTRIES_LIMIT = 50;
const MIN_UNIQUE_LETTERS_PER_BOARD = 12;
const MAX_WORDS_PER_GAME = 100;
const MAX_NAME_LENGTH = 16;
const VOWELS: LetterChar[] = ['a', 'e', 'i', 'o', 'u', 'r'];
const LETTER_R = LETTERS.find((letter) => letter.char === 'r')!;

export function startGame(): Promise<Game> {
  const game: Game = {
    id: crypto.randomUUID(),
    board: generateRandomBoard(),
    score: 0,
    wordCount: 0,
    leaderboardRank: null,
    name: null,
    startedAt: new Date().getTime(),
    endedAt: null,
    endedAndNamed: false,
  };
  return db
    .collection('games')
    .doc(game.id)
    .set(game)
    .then(() => game);
}

export async function guessTheWord(
  gameId: string,
  letterIndexes: number[],
): Promise<CheckWordResult> {
  // request validation
  if (!gameId?.length) {
    throw new Error('Missing gameId!');
  }
  if (letterIndexes?.length < MIN_WORD_LENGTH) {
    throw new Error('At least 3 letters are required!');
  }
  if (letterIndexes.length > BOARD_SIZE) {
    throw new Error(`Max ${BOARD_SIZE} letters are allowed!}`);
  }
  if (letterIndexes.some((index) => index < 0 || index >= BOARD_SIZE)) {
    throw new Error('Letter index out of bounds!');
  }
  const hasDuplicates = new Set(letterIndexes).size !== letterIndexes.length;
  if (hasDuplicates) {
    throw new Error('Found duplicate letter indexes!');
  }

  // read game state from db
  const gameDoc = await db.collection('games').doc(gameId).get();
  if (!gameDoc.exists) {
    throw new Error('Game not found!');
  }
  const game: Game = gameDoc.data() as Game;
  if (game.endedAt) {
    throw new Error('Game has already ended!');
  }

  // check if word is valid
  const wordString = letterIndexes
    .map((index) => game.board[index].char)
    .join('');
  const word = await wordService.checkWord(wordString);

  if (!word) {
    return {
      word: wordString,
      correct: false,
      scoreForWord: 0,
      scoreForLetters: 0,
      scoreForLength: 0,
      game,
    };
  }

  const scoreForLetters = getScoreForLetters(wordString);
  const scoreForLength = SCORE_BY_LENGTH[wordString.length] ?? 0;
  const scoreForWord = scoreForLetters + scoreForLength;
  game.score += scoreForWord;
  game.wordCount = game.wordCount + 1;
  replaceLetters(game.board, letterIndexes);
  if (game.wordCount >= MAX_WORDS_PER_GAME) {
    game.endedAt = new Date().getTime();
    game.leaderboardRank = await getLeaderboardRank(game.score);
    if (game?.name?.length) {
      game.endedAndNamed = true;
    }
  }
  await gameDoc.ref.set(game);

  return {
    word: wordString,
    correct: true,
    scoreForWord,
    scoreForLetters,
    scoreForLength,
    game,
  };
}

export async function gameOver(gameId: string): Promise<Game> {
  if (!gameId?.length) {
    throw new Error('Missing gameId!');
  }

  const gameDoc = await db.collection('games').doc(gameId).get();
  if (!gameDoc.exists) {
    throw new Error('Game not found!');
  }

  const game: Game = gameDoc.data() as Game;
  if (game.endedAt) {
    throw new Error('Game has already ended!');
  }

  game.endedAt = new Date().getTime();
  game.leaderboardRank = await getLeaderboardRank(game.score);
  if (game.name?.length) {
    game.endedAndNamed = true;
  }
  await gameDoc.ref.set(game);

  return game;
}

export async function submitName(gameId: string, name: string): Promise<Game> {
  if (!gameId?.length) {
    throw new Error('Missing gameId!');
  }
  if (!name?.trim().length) {
    throw new Error('Missing name!');
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error('Name is too long!');
  }

  const gameDoc = await db.collection('games').doc(gameId).get();
  if (!gameDoc.exists) {
    throw new Error('Game not found!');
  }

  const game: Game = gameDoc.data() as Game;
  if (game.name?.length) {
    throw new Error('Name already submitted!');
  }

  game.name = name;
  if (game.endedAt) {
    game.endedAndNamed = true;
  }
  await gameDoc.ref.set(game);

  return game;
}

export function getLeaderboard(): Promise<Game[]> {
  return db
    .collection('games')
    .where('endedAndNamed', '==', true)
    .orderBy('score', 'desc')
    .orderBy('endedAt', 'asc')
    .limit(LEADERBOARD_ENTRIES_LIMIT)
    .get()
    .then((querySnapshot) => {
      const games: Game[] = [];
      querySnapshot.forEach((doc) => {
        games.push(doc.data() as Game);
      });
      return games;
    });
}

function generateRandomBoard(): Letter[] {
  const letters: Letter[] = [];

  // generate min required unique letters
  for (let i = 0; i < MIN_UNIQUE_LETTERS_PER_BOARD; i++) {
    let newLetter: Letter;
    do {
      newLetter = generateRandomLetter();
    } while (letters.includes(newLetter));
    letters.push(newLetter);
  }

  // fill up the rest with random letters without uniqueness check
  for (let i = MIN_UNIQUE_LETTERS_PER_BOARD; i < BOARD_SIZE; i++) {
    letters.push(generateRandomLetter());
  }

  // indexes don't matter since we'll shuffle the array anyway, just use 0
  ensureSolvable(letters, [0]);

  // disperse possible duplicates at the end of the array
  shuffleArray(letters);

  return letters;
}

function replaceLetters(board: Letter[], indexesToReplace: number[]) {
  const keptLetters = board
    .filter((_, index) => !indexesToReplace.includes(index))
    .map((letter) => letter.char);

  const uniqueLetters: Set<LetterChar> = new Set(keptLetters);

  const newLetters: Letter[] = [];
  for (let i = 0; i < indexesToReplace.length; i++) {
    let newLetter: Letter;

    // generate a random letter until it's unique, or we have enough unique letters already
    do {
      newLetter = generateRandomLetter();
    } while (
      uniqueLetters.has(newLetter.char) &&
      uniqueLetters.size < MIN_UNIQUE_LETTERS_PER_BOARD
    );

    newLetters.push(newLetter);
    uniqueLetters.add(newLetter.char);
  }

  // disperse possible duplicates at the end of the array
  shuffleArray(newLetters);

  for (let i = 0; i < indexesToReplace.length; i++) {
    board[indexesToReplace[i]] = newLetters[i];
  }

  ensureSolvable(board, indexesToReplace);
}

function ensureSolvable(board: Letter[], indexesToReplace: number[]) {
  const containsVowels = board.some((letter) => VOWELS.includes(letter.char));
  if (containsVowels) {
    return;
  }

  const randomIndexToReplace =
    indexesToReplace[Math.floor(Math.random() * indexesToReplace.length)];
  board[randomIndexToReplace] = LETTER_R;
}

function generateRandomLetter(): Letter {
  const totalWeightSum = RANDOM_LETTER_SCORE_WEIGHTS.reduce(
    (sum, scoreWeight) => sum + scoreWeight.weight,
    0,
  );

  const targetWeightSum = Math.random() * totalWeightSum;

  let sumSoFar = 0;
  for (const scoreWeight of RANDOM_LETTER_SCORE_WEIGHTS) {
    sumSoFar += scoreWeight.weight;
    if (targetWeightSum <= sumSoFar) {
      return getRandomLetterForScore(scoreWeight.score);
    }
  }

  // Fallback for floating point arithmetic errors
  return getRandomLetterForScore(
    RANDOM_LETTER_SCORE_WEIGHTS[RANDOM_LETTER_SCORE_WEIGHTS.length - 1].score,
  );
}

function getRandomLetterForScore(score: LetterScore): Letter {
  const availableLetters: Letter[] = LETTERS.filter(
    (letter) => letter.score === score,
  );
  const randomIndex = Math.floor(Math.random() * availableLetters.length);
  return availableLetters[randomIndex];
}

function shuffleArray(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getScoreForLetters(word: string): number {
  return word
    .split('')
    .map((char) => {
      const letter = LETTERS.find((letter) => letter.char === char);
      return (letter?.score as number) ?? 0;
    })
    .reduce((sum, score) => sum + score, 0);
}

function getLeaderboardRank(score: number): Promise<number> {
  return db
    .collection('games')
    .where('endedAndNamed', '==', true)
    .where('score', '>=', score)
    .count()
    .get()
    .then((querySnapshot) => querySnapshot.data().count + 1);
}
