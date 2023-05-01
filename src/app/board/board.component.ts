import {Component, TemplateRef} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GameService} from "../game.service";
import {environment} from '../../environments/environment';
import {catchError, throwError} from "rxjs";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent {
    modalRef?: BsModalRef;
    currentWord: string = '';
    wordInvalid = false;
    lastSelectedIndex = 0
    inProgress: boolean = false;
    flipCards: number[] =[];
    goalAlreadyAccomplished = false;

    constructor(private httpClient: HttpClient, public gameService: GameService, private modalService: BsModalService) {
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
        this.goalAlreadyAccomplished = false;
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

        if(this.gameService.isGoalAccomplished(this.currentWord.length)){
            this.goalAlreadyAccomplished = true;
            return;
        }

        this.inProgress = true;
        // this.wordCorrect();
        // this.wordInvalid = true;
        this.httpClient.get(`${environment.wordCheckFunction}?word=${this.currentWord}`, {responseType: "text"})
            .pipe(
                catchError(err => {
                    this.inProgress = false;
                    this.wordInvalid = true;
                    console.log('Handling error locally and rethrowing it...', err);
                    return throwError(err);
                })
            )
            .subscribe(value => {
                if (value === this.currentWord) {
                    this.wordCorrect();
                }
                this.inProgress = false;
            });
    }

    restCurrentWord() {
        this.currentWord = '';
        this.wordInvalid = false
        this.goalAlreadyAccomplished = false;
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
        this.flipCards = this.gameService.boardBag
            .filter(letter => letter.selectedIndex > 0)
            .map(letter => letter.boardIndex);

        setTimeout(() => {this.flipCards = []}, 1000)

        this.gameService.score += this.calculateScore(this.currentWord);
        this.gameService.addGuessedWord(this.currentWord)
        this.currentWord = '';
        this.wordInvalid = false
        setTimeout(() => this.gameService.replaceSelectedCells(), 700);
        this.gameService.calculateGoalProgress();
        this.gameService.createTimer();
    }

    actionOpenInventoryModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    }
}
