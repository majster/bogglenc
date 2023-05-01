import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";

@Component({
  selector: 'app-game',
  template: ''
})
export class GameComponent implements OnInit {

  constructor(public gameService: GameService) { }

  ngOnInit(): void {

  }


}
