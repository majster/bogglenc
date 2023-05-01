import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BoggleLetter, GameService} from "../game.service";


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {

  currentWord: string = '';
  wordInvalid = false;
  protected readonly indexedDB = indexedDB;

  constructor(private httpClient: HttpClient, public gameService: GameService) {

  }

  selectCell(index: number) {
    this.wordInvalid = false
    let cell = this.gameService.boardBag[index];
    let sortedBySelectedIndex = this.getSortedBySelectedIndex();
    if (cell.selected && cell === sortedBySelectedIndex[0]) {
      // unselect
      cell.selected = false;
      cell.selectedIndex = 0;
      this.currentWord = this.currentWord.substring(0, this.currentWord.length - 1);
      return;
    }

    if (cell.selected) {
      return;
    }

    cell.selectedIndex = sortedBySelectedIndex[0].selectedIndex + 1;

    // Get the selected letter
    const letter = cell.value;

    // Select the new cell and update the selected row and col
    cell.selected = true;

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

  isCellLastSelected(cell: BoggleLetter) {

    if (!cell.selected) {
      return false;
    }
    const sorted = this.getSortedBySelectedIndex();
    return cell === sorted[0];
  }

  submit() {
    // this.wordCorrect();
    // this.wordInvalid = true;
    this.httpClient.get(`http://127.0.0.1:5001/boggelnc/us-central1/wordCheck?word=${this.currentWord}`, {responseType: "text"})
      .subscribe(value => {
        if (value === this.currentWord) {
          this.wordCorrect();
        }
      }, error => {
        this.wordInvalid = true;
      });
  }

  private wordCorrect() {
    this.gameService.score += this.calculateScore(this.currentWord);
    this.shoot();
    this.shoot();
    this.shoot();
    this.gameService.guessedWords.push(this.currentWord)
    this.currentWord = '';
    this.wordInvalid = false
    this.gameService.replaceSelectedCells();
    this.gameService.levelUp();
    this.gameService.createTimer();
  }

  shoot() {
    try {
      this.confetti({
        angle: this.random(60, 120),
        spread: this.random(10, 50),
        particleCount: this.random(40, 50),
        origin: {
          y: 0.5
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
    this.gameService.boardBag.forEach(value => {
      value.selected = false
    })
  }

  private getSortedBySelectedIndex() {
    const copy: BoggleLetter[] = Object.assign([], this.gameService.boardBag);
    return copy.sort((a, b) => b.selectedIndex - a.selectedIndex);
  }
}
