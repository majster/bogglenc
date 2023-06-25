import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-board-key',
  templateUrl: './board-key.component.html',
  styleUrls: ['./board-key.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardKeyComponent {

  @Output()
  selectedEvent = new EventEmitter()

  @Input()
  isFlipping = false;

  @Input()
  isInvalid = false;

  @Input()
  isLastSelected = false;

  @Input()
  isSelected = false;

  @Input()
  isDisabled!: boolean | null;

  @Input()
  character!: string

  @Input()
  value!: number;

}
