import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {


  byLengthExpandedMap = {} as any;

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

  getAchievementProgress(wordLength: string): number{
    return this.gameService.guessedWords.filter(value => {
      return value.length.toString() === wordLength
    }).length;
  }

  byLengthExpanded(key: string) {

  }
}
