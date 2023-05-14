import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BsModalService} from "ngx-bootstrap/modal";
import {LeaderBoardFormComponent} from "../leader-board-form/leader-board-form.component";
import {GameService} from "../game.service";

@Component({
    selector: 'app-leader-board',
    templateUrl: './leader-board.component.html',
    styleUrls: ['./leader-board.component.scss']
})
export class LeaderBoardComponent implements AfterViewInit, OnInit {
    numbers = Array(50).fill(0).map((x, i) => i);
    data = [] as any[];

    constructor(private modalService: BsModalService, public gameService: GameService) {
        this.setupDemoData();
    }

    ngOnInit() {
        // call gateway for hi-score

        this.gameService.gameDataSubject$.subscribe(value => {
            if (this.gameService.gameData.victoryName) {
                const entry = this.data.filter(entry => {
                    return entry.victory;
                })

                entry[0].name = this.gameService.gameData.victoryName
            }
        })
    }

    ngAfterViewInit() {
        const element = document.getElementById('25')
        if (element) {
            setTimeout(()=> element.scrollIntoView({block: "start", behavior: "auto"}), 700);
        }
    }

    openLeaderBoardForm() {
        this.modalService.show(LeaderBoardFormComponent)
    }

    private setupDemoData() {
        for (let i = 0; i < this.numbers.length; i++) {
            this.data.push({
                name: this.randomName(),
                score: i,
                victory: i === 25
            } as any)
        }
    }

    private randomName() {
        let s = '';
        for (var i = 0; i <= this.randomIntFromInterval(1, 10); i++) {
            s += String.fromCharCode(this.randomIntFromInterval(41, 132));
        }
        return s;
    }


    private randomIntFromInterval(min: number, max: number) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
