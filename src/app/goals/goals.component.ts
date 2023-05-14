import {ChangeDetectionStrategy, Component} from '@angular/core';
import {GameService, GameState} from "../game.service";

@Component({
    selector: 'app-goals',
    templateUrl: './goals.component.html',
    styleUrls: ['./goals.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

    constructor(public gameService: GameService) {
    }

    protected readonly GameService = GameService;
    protected readonly GameState = GameState;
}
