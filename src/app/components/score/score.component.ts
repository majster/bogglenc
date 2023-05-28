import {Component} from '@angular/core';
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss']
})
export class ScoreComponent {

  constructor(public gameService: GameService) { }
}
