import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {GameService} from "../game.service";

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit, AfterViewInit {
    modalRef?: BsModalRef;
    @ViewChild("goals")
    templateRef!: TemplateRef<any>;

    constructor(private modalService: BsModalService, public gameService: GameService, private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.gameService.$gameStateSubject.subscribe(value => {
            this.cdr.markForCheck();
        })
    }

    actionOpenInventoryModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    }

    ngAfterViewInit(): void {
        // this.actionOpenInventoryModal(this.templateRef);
    }
}
