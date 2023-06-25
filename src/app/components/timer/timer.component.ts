import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent implements OnInit {

    @Input()
    timeProgress$!: BehaviorSubject<number>;

    time = 0;

    constructor(private cdr: ChangeDetectorRef) {

    }

    ngOnInit(): void {
        this.timeProgress$.subscribe(value => {
            this.time = value;
            this.cdr.markForCheck();
        });
    }
}
