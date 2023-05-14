import {ChangeDetectorRef, Component} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";
import {GameService} from "../game.service";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

    constructor(public modalRef: BsModalRef, public gameService: GameService, private cdr: ChangeDetectorRef) {
    }


    actionNewGame() {
        this.gameService.newGame();
        this.modalRef.hide();
    }

    protected readonly GameService = GameService;
}
