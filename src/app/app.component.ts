import {Component, OnInit} from '@angular/core';
import {GameService, GameState} from "./game.service";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {MenuComponent} from "./menu/menu.component";
import {combineLatest, take} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    protected readonly GameState = GameState;
    private timeout: any;
    private currentState!: GameState;

    constructor(public gameService: GameService, private modalService: BsModalService) {

    }

    ngOnInit() {
        const existingGameState = localStorage.getItem(GameService.LOCAL_STORAGE_GAME_DATA);
        if (existingGameState) {
            this.gameService.resumeGame(existingGameState);
            this.gameStateChangeHandler(false);
        } else {
            this.openInitialMenu();
        }

        this.gameService.gameDataSubject$.subscribe(value => {
            this.gameStateChangeHandler(value);
        });
    }

    actionConfirmNewGame() {
        this.gameService.newGame();
        clearTimeout(this.timeout);
    }

    actionOpenMenu(): BsModalRef {
        return this.modalService.show(MenuComponent);
    }

    private confetti(args: any) {
        return (window as any)['confetti'].apply(this, arguments);
    }

    private shoot() {
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

    private random(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    private victoryConfetti() {
        const randomNumberInMilliseconds = this.random(300, 1200);
        this.shoot();
        this.timeout = setTimeout(() => this.victoryConfetti(), randomNumberInMilliseconds);
    }

    /**
     * Open initial menu to show player some information about the game.
     * @private
     */
    private openInitialMenu() {
        const bsModalRef = this.actionOpenMenu();
        if (bsModalRef?.onHide && bsModalRef?.onHidden) {
            combineLatest(
                [bsModalRef.onHide,
                    bsModalRef.onHidden]
            )
                .pipe(take(1))
                .subscribe(() => {
                    this.gameService.newGame();
                });
        }
    }

    private gameStateChangeHandler<T>(value: T) {
        clearTimeout(this.timeout);

        const gameState = this.gameService.gameState;
        if (gameState === GameState.VICTORY || gameState === GameState.LOSS) {
            this.gameService.pauseTimer();
        }

        if (gameState === GameState.VICTORY) {
            // game won
            this.gameService.pauseTimer();
            this.victoryConfetti();
        }

        if (value) {
            this.shoot();
            this.shoot();
            this.shoot();
        }

        this.currentState = gameState;
    }
}
