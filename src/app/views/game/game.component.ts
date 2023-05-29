import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {GameService} from "../../services/game.service";
import {MenuComponent} from "../../components/menu/menu.component";
import {BsModalService} from "ngx-bootstrap/modal";
import {catchError, Subject, throwError} from "rxjs";
import {BackendService, CheckWordResult} from "../../services/backend.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

    inProgress = false;
    wordValid$ = new Subject<boolean>()
    gameOverCondition = 100;
    private timerInterval!: any
    private applyChangesTimeout!: number;

    constructor(public gameService: GameService,
                private modalService: BsModalService,
                private backendService: BackendService,
                private cdr: ChangeDetectorRef,
                private router: Router) {
    }


    get timeProgress() {
        return this.gameService.gameData?.timerProgress || 0;
    }

    ngOnInit() {
        if (this.gameService.gameData?.timerProgress) {
            this.resumeTimer();
        } else {
            this.createTimer();
        }
    }

    actionOpenMenu() {
        return this.modalService.show(MenuComponent);
    }

    ngOnDestroy(): void {
        clearInterval(this.timerInterval);
    }

    handleWordSubmittedEvent(selectedLetterIndexes: number[]) {
        this.inProgress = true;
        this.pauseTimer();
        this.cdr.detectChanges();

        this.backendService.guessTheWord(this.gameService.gameData!.game.id, selectedLetterIndexes)
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
                this.gameService.gameData!.game = check.game;
                this.inProgress = false;
                this.resumeTimer();
            });
    }

    private wordIncorrect() {
        this.inProgress = false;
        this.resumeTimer();
        this.cdr.detectChanges();
        this.gameService.missedWords?.push(this.gameService.currentWord)
        this.wordValid$.next(false);
    }

    private createTimer() {
        this.gameService.gameData!.timerProgress = 0;
        this.resumeTimer();
    }

    private pauseTimer() {
        clearInterval(this.timerInterval);
    }

    private resumeTimer() {
        if (this.timerInterval) {
            this.pauseTimer()
        }

        this.timerInterval = setInterval(() => {
            this.gameService.gameData!.timerProgress += 1;
            this.gameService.persistGameData();
            if (this.gameService.gameData!.timerProgress >= this.gameOverCondition) {
                this.handleGameOverCondition();
            }

        }, GameService.GAME_TIME_OUT_MILIS)
    }

    private handleGameOverCondition() {
        this.inProgress = true;
        this.cdr.detectChanges();
        this.router.navigate(['game-over'], {skipLocationChange: true})
    }

    private wordCorrect(check: CheckWordResult) {
        this.applyChangesTimeout = setTimeout(() => {
            // wait for animation to apply changes
            this.gameService.applyBackendGame(check.game);
            this.cdr.detectChanges();
        }, 700);
        this.gameService.guessedWords?.push(this.gameService.currentWord)
        this.wordValid$.next(true);
        this.gameService.gameData!.timerProgress = Math.max(this.gameService.gameData!.timerProgress - this.gameService.timeBonusByWord(), 0);
        this.inProgress = false;
        this.cdr.detectChanges();
    }

}
