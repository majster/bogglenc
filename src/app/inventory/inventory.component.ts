import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {GameService} from "../game.service";

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, AfterViewInit {
  modalRef?: BsModalRef;
  @ViewChild("lettersBag")
  lettersBag!: TemplateRef<any>;

  constructor(private modalService: BsModalService, public gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.startTimer();
  }

  actionOpenInventoryModal(template: TemplateRef<any>){
    this.modalRef = this.modalService.show(template);
  }

  ngAfterViewInit(): void {
    // this.actionOpenInventoryModal(this.lettersBag);
  }

}
