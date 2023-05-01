import {Injectable} from '@angular/core';

export interface BoggleLetter {
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  letterValues: { [key: string]: number } = {
    'a': 1,
    'b': 3,
    'c': 3,
    'č': 4,
    'd': 2,
    'e': 1,
    'f': 7,
    'g': 4,
    'h': 5,
    'i': 1,
    'j': 4,
    'k': 2,
    'l': 1,
    'm': 2,
    'n': 2,
    'o': 1,
    'p': 3,
    'r': 1,
    's': 2,
    'š': 4,
    't': 2,
    'u': 4,
    'v': 4,
    'z': 2,
    'ž': 10,
  };
  score: number = 0;
  guessedWords: string[] = [];
  lettersBag: BoggleLetter[] = [];
  timeProgress: number = 0;

  constructor() {
  }

  getLettersAll(): string[] {
    return Object.assign([], Object.keys(this.letterValues));
  }

  generateLevelOneLetters(): string[] {
    return this.getLettersAll().filter(letter => {
      let letterValue = this.letterValues[letter];
      return letterValue < 3;
    })
  }

  generateLevelOneBag() {
    let levelOneLetters = this.generateLevelOneLetters();
    for (let i = 0; i < 16; i++) {
      const randomLetter = this.randomLetter(levelOneLetters);
      this.lettersBag.push({value: randomLetter});
    }
  }

  private randomLetter(arrayOfLetters: string[]): string {
    return arrayOfLetters[Math.floor(Math.random() * arrayOfLetters.length)];
  }

  startTimer(){
    setInterval(() => {
      this.timeProgress += 1;
    }, 1000)
  }
}
