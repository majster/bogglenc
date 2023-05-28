import {Component} from '@angular/core';
import {GameService} from "../../services/game.service";
import {BsModalService} from "ngx-bootstrap/modal";
import {LeaderBoardFormComponent} from "../../components/leader-board-form/leader-board-form.component";
import {Router} from "@angular/router";

@Component({
    selector: 'app-game-over',
    templateUrl: './game-over.component.html',
    styleUrls: ['./game-over.component.scss']
})
export class GameOverComponent {
    constructor(public gameService: GameService,
                private modalService: BsModalService,
                private router: Router) {

    }

    get enteredToLeaderBoard(): boolean {
        return true;
    }

    actionOpenLeaderBoardForm() {
        this.modalService.show(LeaderBoardFormComponent)
    }

    actionBackToMainMenu() {
        this.router.navigate([''], {skipLocationChange: true})
    }
}
