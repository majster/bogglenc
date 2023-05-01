import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent implements OnInit {

  wordLengthAchievementCountMap = {
    "8": 2,
    "7": 3,
    "6": 5,
    "5": 6,
    "4": 7,
    "3": 8
  } as any

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

  getAchievementProgress(wordLength: string): number{
    return this.gameService.guessedWords.filter(value => {
      return value.length.toString() === wordLength
    }).length;
  }

}
