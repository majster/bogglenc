import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BoggleLetter, GameService} from "../game.service";
import {catchError, throwError} from "rxjs";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {BackendService, CheckWordResult} from "../backend.service";

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent {
    modalRef?: BsModalRef;

    wordInvalid = false;
    inProgress: boolean = false;
    flipCards: number[] = [];

    @Input()
    lettersBag!: BoggleLetter[][];

    constructor(private httpClient: HttpClient,
                public gameService: GameService,
                private modalService: BsModalService,
                private backendService: BackendService,
                private cdr: ChangeDetectorRef) {

    }

    selectCell(row: number, index: number) {
        this.wordInvalid = false

        let cell = this.lettersBag[row][index];

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


        this.inProgress = true;
        this.gameService.pauseTimer();
        // this.wordCorrect({} as any);
        // this.inProgress = false;
        // this.wordInvalid = true;

        const selectedLetters = this.gameService.boardBag
            .filter(letter => {
                return letter.selected
            });

        console.log(selectedLetters);

        selectedLetters.sort((a, b) => a.selectedIndex - b.selectedIndex);

        console.log(selectedLetters);

        const selectedLetterIndexes = selectedLetters.map(letter => {
            return letter.boardIndex;
        })

        this.backendService.guessTheWord(this.gameService.gameData.game.id, selectedLetterIndexes)
            .pipe(
                catchError(err => {
                    this.wordIncorrect();
                    console.log('Handling error locally and rethrowing it...', err);
                    return throwError(err);
                })
            )
            .subscribe(check => {
                if (check.correct) {
                    this.wordCorrect(check);
                } else {
                    this.wordIncorrect();
                }
                this.gameService.gameData.game = check.game;
                this.inProgress = false;
                this.gameService.resumeTimer();
            });
    }

    restCurrentWord() {
        this.wordInvalid = false
        this.gameService.boardBag.forEach(value => {
            value.selected = false
            value.selectedIndex = 0
        })
        this.gameService.stateChanged();
    }

    private wordIncorrect() {
        this.inProgress = false;
        this.wordInvalid = true;
        this.gameService.resumeTimer();
        this.gameService.gameData.missedWords.push(this.gameService.currentWord);
        this.cdr.markForCheck();
    }

    private wordCorrect(check: CheckWordResult) {
        this.flipCards = this.gameService.boardBag
            .filter(letter => letter.selectedIndex > 0)
            .map(letter => letter.boardIndex);

        setTimeout(() => {
            this.flipCards = []
        }, 1000)

        this.gameService.addGuessedWord(this.gameService.currentWord)
        this.wordInvalid = false
        setTimeout(() => {
            this.gameService.applyBackendGame(check.game);
            this.restCurrentWord()
            this.cdr.markForCheck();
        }, 700);
        this.gameService.calculateGoalProgress();
        this.gameService.timeProgress = 0;
        this.cdr.markForCheck();
    }

}
