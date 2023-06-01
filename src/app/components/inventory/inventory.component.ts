import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {GameService} from "../../services/game.service";
import {Subscription} from "rxjs";
import {AchievementsComponent} from "../achievements/achievements.component";

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit, OnDestroy {
    @Input()
    time!: number;

    @Input()
    gameOverCondition!: number;

    modalRef?: BsModalRef;
    @ViewChild("goals")
    templateRef!: TemplateRef<any>;
    protected readonly GameService = GameService;
    private gameDataSubscription!: Subscription;

    constructor(private modalService: BsModalService, public gameService: GameService, private cdr: ChangeDetectorRef) {
    }

    get timeProgressBarWidth() {
        return this.time
    }

    get timeProgress(){
        return Math.abs(this.gameOverCondition - this.time);
    }

    ngOnInit(): void {
        this.gameDataSubscription = this.gameService.gameDataSubject$.subscribe(value => {
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.gameDataSubscription.unsubscribe();
    }

    actionOpenAchievementsModal() {
        this.modalRef = this.modalService.show(AchievementsComponent, {class: 'modal-lg'})
    }
}
