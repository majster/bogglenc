import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";

@Component({
    selector: 'app-goals',
    templateUrl: './goals.component.html',
    styleUrls: ['./goals.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent implements OnInit {


    byLengthExpandedMap = {} as any;

    constructor(public gameService: GameService) {
    }

    ngOnInit(): void {
    }

}
