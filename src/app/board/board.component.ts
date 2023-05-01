import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BoggleLetter, GameService} from "../game.service";

interface BoggleCell {
  letter: string;
  selected: boolean;
  selectedIndex: number
}


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {


  board: BoggleCell[][];
  selectedRow: number | null = null;
  selectedCol: number | null = null;
  currentWord: string = '';
  wordInvalid = false;

  constructor(private httpClient: HttpClient, public gameService: GameService) {
    this.board = [];
  }

  generateBoard() {
    for (let i = 0; i < 4; i++) {
      this.board[i] = [];
      for (let j = 0; j < 4; j++) {
        const randomLetter = this.randomLetter(this.gameService.lettersBag);

        this.board[i][j] = {
          letter: randomLetter,
          selected: false,
          selectedIndex: 0
        }
      }
    }
  }

  ngOnInit(): void {

    this.generateBoard();
  }

  selectCell(row: number, col: number) {
    this.wordInvalid = false
    const sorted = this.getSorted();
    const cell = this.board[row][col];

    if (cell.selected && cell === sorted[0]) {
      // unselect
      cell.selected = false;
      cell.selectedIndex = 0;
      this.currentWord = this.currentWord.substring(0, this.currentWord.length - 1);
      return;
    }

    if (cell.selected) {
      return;
    }

    cell.selectedIndex = sorted[0].selectedIndex + 1;

    // Get the selected letter
    const letter = cell.letter;

    // Select the new cell and update the selected row and col
    cell.selected = true;
    this.selectedRow = row;
    this.selectedCol = col;

    // Add the selected letter to the current word
    this.currentWord += letter;
  }

  calculateScore(word: string): number {

    let score = 0;

    for (const letter of word) {
      score += this.gameService.letterValues[letter];
    }

    return score;
  }

  isCellLastSelected(cell: BoggleCell) {
    if (!cell.selected) {
      return false;
    }
    const sorted = this.getSorted();
    return cell === sorted[0];
  }

  submit() {
    this.httpClient.get(`http://127.0.0.1:5001/boggelnc/us-central1/wordCheck?word=${this.currentWord}`, {responseType: "text"})
      .subscribe(value => {
        if (value === this.currentWord) {
          this.gameService.score += this.calculateScore(this.currentWord);
          this.shoot();
          this.shoot();
          this.shoot();
          this.gameService.guessedWords.push(this.currentWord)
          this.currentWord = '';
          this.wordInvalid = false
          this.generateBoard();
        }
      }, error => {
        this.wordInvalid = true;
      });
  }

  shoot() {
    try {
      this.confetti({
        angle: this.random(60, 120),
        spread: this.random(10, 50),
        particleCount: this.random(40, 50),
        origin: {
          y: 0.2
        }
      });
    } catch (e) {
      // noop, confettijs may not be loaded yet
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  confetti(args: any) {
    return (window as any)['confetti'].apply(this, arguments);
  }

  restCurrentWord() {
    this.currentWord = '';
    this.wordInvalid = false
    this.board.flat().forEach(value => {
      value.selected = false
    })
  }

  private getSorted() {
    return this.board.flat().sort((a, b) => b.selectedIndex - a.selectedIndex);
  }

  private removeLetterFromArray(copyOfLetterValues: any[] & string[], randomLetter: string) {
    const index = copyOfLetterValues.indexOf(randomLetter, 0);
    if (index > -1) {
      copyOfLetterValues.splice(index, 1);
    }
  }

  private randomLetter(copyOfLetterValues: BoggleLetter[]): string {
    return copyOfLetterValues[Math.floor(Math.random() * copyOfLetterValues.length)].value;
  }
}
