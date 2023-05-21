import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {GameService} from "../game.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit, AfterViewInit, OnDestroy {
    modalRef?: BsModalRef;
    @ViewChild("goals")
    templateRef!: TemplateRef<any>;
    protected readonly GameService = GameService;
    private gameDataSubscription!: Subscription;

    constructor(private modalService: BsModalService, public gameService: GameService, private cdr: ChangeDetectorRef) {
    }

    get time() {
        return Math.abs(100 - this.gameService.timeProgress)
    }

    ngOnInit(): void {
        this.gameDataSubscription = this.gameService.gameDataSubject$.subscribe(value => {
            this.cdr.markForCheck();
        });
    }

    actionOpenInventoryModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    }

    ngAfterViewInit(): void {
        // this.actionOpenInventoryModal(this.templateRef);
    }

    ngOnDestroy(): void {
        this.gameDataSubscription.unsubscribe();
    }
}
