import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GameService} from "../game.service";
import {environment} from '../../environments/environment';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent {

    currentWord: string = '';
    wordInvalid = false;
    lastSelectedIndex = 0

    constructor(private httpClient: HttpClient, public gameService: GameService) {
        const boggleLettersBySelectedIndex = this.gameService.boardBag.sort((a, b) => b.selectedIndex - a.selectedIndex);

        let currentWordInReverse = '';
        boggleLettersBySelectedIndex.forEach(letter => {
            if (letter.selectedIndex > 0) {
                currentWordInReverse += letter.value;
            }
        })
        this.currentWord = this.reverse(currentWordInReverse);
        this.lastSelectedIndex = boggleLettersBySelectedIndex[0].selectedIndex;
    }

    selectCell(row: number, index: number) {
        this.wordInvalid = false
        let cell = this.gameService.gameState.lettersBag[row][index];

        if (cell.selected && cell.selectedIndex === this.lastSelectedIndex) {
            // unselect
            cell.selected = false;
            cell.selectedIndex = 0;
            this.currentWord = this.currentWord.substring(0, this.currentWord.length - 1);
            this.lastSelectedIndex -= 1
            return;
        }

        if (cell.selected) {
            return;
        }

        cell.selectedIndex = this.lastSelectedIndex += 1;

        // Get the selected letter
        const letter = cell.value;

        // Select the new cell and update the selected row and col
        cell.selected = true;

        // Add the selected letter to the current word
        this.currentWord += letter;

        this.gameService.stateChanged();
    }

    calculateScore(word: string): number {

        let score = 0;

        for (const letter of word) {
            score += this.gameService.letterValues[letter];
        }

        return score;
    }

    submit() {
        // this.wordCorrect();
        // this.wordInvalid = true;
        this.httpClient.get(`${environment.wordCheckFunction}?word=${this.currentWord}`, {responseType: "text"})
            .subscribe(value => {
                if (value === this.currentWord) {
                    this.wordCorrect();
                }
            }, error => {
                this.wordInvalid = true;
            });
    }

    restCurrentWord() {
        this.currentWord = '';
        this.wordInvalid = false
        this.gameService.boardBag.forEach(value => {
            value.selected = false
            value.selectedIndex = 0
        })
        this.gameService.stateChanged();
    }

    private reverse(s: string) {
        return s.split("").reverse().join("");
    }

    private wordCorrect() {
        this.gameService.score += this.calculateScore(this.currentWord);
        this.gameService.addGuessedWord(this.currentWord)
        this.currentWord = '';
        this.wordInvalid = false
        this.gameService.replaceSelectedCells();
        this.gameService.calculateGoalProgress();
        this.gameService.createTimer();
    }
}
