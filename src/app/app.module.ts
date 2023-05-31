import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BoardComponent} from './board/board.component';
import {HttpClientModule} from "@angular/common/http";
import {GoalsComponent} from './goals/goals.component';
import {ScoreComponent} from './score/score.component';
import {InventoryComponent} from './inventory/inventory.component';
import {ModalModule} from "ngx-bootstrap/modal";
import {MenuComponent} from './menu/menu.component';
import {LeaderBoardComponent} from './leader-board/leader-board.component';
import {LeaderBoardFormComponent} from './leader-board-form/leader-board-form.component';
import {LeaderBoardModalComponent} from './leader-board-modal/leader-board-modal.component';
import {MainMenuComponent} from './main-menu/main-menu.component';
import {VictoryConfettiComponent} from './victory-confetti/victory-confetti.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    GoalsComponent,
    ScoreComponent,
    InventoryComponent,
    MenuComponent,
    LeaderBoardComponent,
    LeaderBoardFormComponent,
    LeaderBoardModalComponent,
    MainMenuComponent,
    VictoryConfettiComponent
  ],
  imports: [
    ModalModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
