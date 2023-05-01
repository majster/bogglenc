import {Component} from '@angular/core';
import {GameComponent} from "./game/game.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends GameComponent {

  override ngOnInit() {
    super.ngOnInit();
    this.gameService.generateLevelOneBag();
  }
}
