import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {GameService} from "./game.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    modalRef?: BsModalRef;

    gameOver = false
    gameWon = false;
    private timeout: any;

    constructor(private modalService: BsModalService,
                public gameService: GameService) {

    }


    ngOnInit() {
        this.gameService.setupGame()
        this.gameService.$gameStateSubject.subscribe(value => {
            if (this.gameService.timeProgress >= 100) {
                // game over
                this.gameService.pauseTimer();
                this.gameOver = true;
            }

            if (this.gameService.goalProgress >= 100) {
                // game won
                this.gameService.pauseTimer();
                this.gameWon = true;
                this.victoryConfetti();
            }

            if(value){
                this.shoot();
                this.shoot();
                this.shoot();
            }
        });
    }

    confetti(args: any) {
        return (window as any)['confetti'].apply(this, arguments);
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

    victoryConfetti(){
        const randomNumberInMilliseconds = this.random(300, 1200);
        this.shoot();
        this.timeout = setTimeout(() => this.victoryConfetti(), randomNumberInMilliseconds);
    }

    newGameModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template)
    }

    actionConfirmNewGame() {
        this.modalRef?.hide();
        clearTimeout(this.timeout);
        this.gameOver = false
        this.gameWon = false;
        this.gameService.createNewGame();
    }
}
