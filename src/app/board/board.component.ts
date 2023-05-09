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

    wordInvalid = false;
    inProgress: boolean = false;
    flipCards: number[] = [];
    goalAlreadyAccomplished = false;

    constructor(private httpClient: HttpClient, public gameService: GameService, private modalService: BsModalService) {

    }

    selectCell(row: number, index: number) {
        this.goalAlreadyAccomplished = false;
        this.wordInvalid = false
        let cell = this.gameService.gameData.lettersBag[row][index];

        const selectedByLastIndex = this.gameService.selectedByLastIndex[0];
        if (cell.selected && cell.selectedIndex === selectedByLastIndex.selectedIndex) {
            // unselect
            cell.selected = false;
            cell.selectedIndex = 0;
            return;
        }

        if (cell.selected) {
            return;
        }

        if (selectedByLastIndex) {
            cell.selectedIndex = selectedByLastIndex.selectedIndex + 1;
        } else {
            cell.selectedIndex = 1;
        }

        // Get the selected letter
        const letter = cell.value;

        // Select the new cell and update the selected row and col
        cell.selected = true;

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

        if (this.gameService.isGoalAccomplished(this.gameService.currentWord.length)) {
            this.goalAlreadyAccomplished = true;
            return;
        }

        this.inProgress = true;
        // this.wordCorrect();
        // this.inProgress = false;
        // this.wordInvalid = true;
        this.httpClient.get(`${environment.wordCheckFunction}?word=${this.gameService.currentWord}`, {responseType: "text"})
            .pipe(
                catchError(err => {
                    this.inProgress = false;
                    this.wordInvalid = true;
                    console.log('Handling error locally and rethrowing it...', err);
                    return throwError(err);
                })
            )
            .subscribe(value => {
                if (value === this.gameService.currentWord) {
                    this.wordCorrect();
                }
                this.inProgress = false;
            });
    }

    restCurrentWord() {
        this.wordInvalid = false
        this.goalAlreadyAccomplished = false;
        this.gameService.boardBag.forEach(value => {
            value.selected = false
            value.selectedIndex = 0
        })
        this.gameService.stateChanged();
    }

    actionOpenInventoryModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    }

    private wordCorrect() {
        this.flipCards = this.gameService.boardBag
            .filter(letter => letter.selectedIndex > 0)
            .map(letter => letter.boardIndex);

        setTimeout(() => {
            this.flipCards = []
        }, 1000)

        this.gameService.score += this.calculateScore(this.gameService.currentWord);
        this.gameService.addGuessedWord(this.gameService.currentWord)
        this.wordInvalid = false
        setTimeout(() => this.gameService.replaceSelectedCells(), 700);
        this.gameService.calculateGoalProgress();
        this.gameService.createTimer();
    }
}
