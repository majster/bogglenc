import { db } from './admin';
import * as crypto from 'crypto';
import * as wordService from './word';

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
  score: number;
  weight: number;
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
  level: number;
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
  { char: 'a', weight: 100, score: 1 },
  { char: 'b', weight: 25, score: 8 },
  { char: 'c', weight: 15, score: 10 },
  { char: 'č', weight: 20, score: 9 },
  { char: 'd', weight: 40, score: 7 },
  { char: 'e', weight: 100, score: 1 },
  { char: 'f', weight: 10, score: 10 },
  { char: 'g', weight: 25, score: 9 },
  { char: 'h', weight: 20, score: 9 },
  { char: 'i', weight: 85, score: 2 },
  { char: 'j', weight: 50, score: 6 },
  { char: 'k', weight: 40, score: 7 },
  { char: 'l', weight: 55, score: 6 },
  { char: 'm', weight: 35, score: 7 },
  { char: 'n', weight: 65, score: 5 },
  { char: 'o', weight: 85, score: 2 },
  { char: 'p', weight: 35, score: 7 },
  { char: 'r', weight: 50, score: 6 },
  { char: 's', weight: 50, score: 6 },
  { char: 'š', weight: 15, score: 9 },
  { char: 't', weight: 45, score: 6 },
  { char: 'u', weight: 25, score: 8 },
  { char: 'v', weight: 40, score: 7 },
  { char: 'z', weight: 25, score: 8 },
  { char: 'ž', weight: 15, score: 10 },
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
    level: 1,
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

  if(game.score >= 200){
    game.level = 2;
  }
  if(game.score >= 400){
    game.level = 3;
  }
  if(game.score >= 800){
    game.level = 4;
  }
    if(game.score >= 1600){
    game.level = 5;
    }
    if(game.score >= 3200){
    game.level = 6;
    }
    if(game.score >= 6400){
    game.level = 7;
    }
    if(game.score >= 12800){
    game.level = 8;
    }


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
  const totalWeightSum = LETTERS.reduce(
    (sum, letter) => sum + letter.weight,
    0,
  );

  const targetWeightSum = Math.random() * totalWeightSum;

  let sumSoFar = 0;
  for (const letter of LETTERS) {
    sumSoFar += letter.weight;
    if (targetWeightSum <= sumSoFar) {
      return letter;
    }
  }

  // Fallback for floating point arithmetic errors
  return LETTERS[LETTERS.length - 1];
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
