import {ChangeDetectorRef, Component} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {GameService} from "../game.service";
import {LeaderBoardModalComponent} from "../leader-board-modal/leader-board-modal.component";

export enum LumMode {
    LIGHT, DARK
}

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

    mode = LumMode.LIGHT;
    protected readonly GameService = GameService;

    constructor(public modalRef: BsModalRef, public gameService: GameService, private cdr: ChangeDetectorRef, private modalService: BsModalService) {
        if (document.body.classList.contains('dark')) {
            this.mode = LumMode.DARK;
        }
    }

    actionNewGame() {
        this.gameService.newGame();
        this.modalRef.hide();
    }

    toggleLightDarkMode() {
        if (this.mode === LumMode.LIGHT) {
            this.mode = LumMode.DARK;
            document.body.classList.add('dark')
        } else {
            this.mode = LumMode.LIGHT;
            document.body.classList.remove('dark')
        }
    }

    actionOpenLeaderBoard() {
        this.modalRef.hide();
        this.modalService.show(LeaderBoardModalComponent)
    }
}
