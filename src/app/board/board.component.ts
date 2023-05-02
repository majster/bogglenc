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
        this.httpClient.get(`https://europe-west1-boggelnc.cloudfunctions.net/wordCheck?word=${this.currentWord}`, {responseType: "text"})
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
        })
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

    private getSortedBySelectedIndex() {
        const copy: BoggleLetter[] = Object.assign([], this.gameService.boardBag);
        return copy.sort((a, b) => b.selectedIndex - a.selectedIndex);
    }
}
