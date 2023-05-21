import {Component} from '@angular/core';
import {GameService} from "../game.service";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {MenuComponent} from "../menu/menu.component";

@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent {
    constructor(public gameService: GameService, private modalService: BsModalService) {

    }

    get existingGame() {
        return localStorage.getItem(GameService.LOCAL_STORAGE_GAME_DATA);
    }

    actionNewGame() {
        this.gameService.newGame();
    }

    actionOpenMenu(): BsModalRef {
        return this.modalService.show(MenuComponent);
    }

    actionResumeGame() {
        if (this.existingGame) {
            this.gameService.resumeGame(this.existingGame);
        }
    }
}
