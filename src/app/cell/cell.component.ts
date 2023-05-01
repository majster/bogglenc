import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {
  selected = false;
  @Input()
  letter!: string;
  @Output()
  selectedEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  selectCell() {

  }
}
