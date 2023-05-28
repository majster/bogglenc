import {Component} from '@angular/core';
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent {
  constructor(public gameService: GameService) {
  }
}
