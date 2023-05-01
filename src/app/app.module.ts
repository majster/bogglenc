import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GameComponent} from './game/game.component';
import {BoardComponent} from './board/board.component';
import {CellComponent} from './cell/cell.component';
import {HttpClientModule} from "@angular/common/http";
import {ScoreBoardComponent} from './score-board/score-board.component';
import {ScoreComponent} from './score/score.component';
import {InventoryComponent} from './inventory/inventory.component';
import {ModalModule} from "ngx-bootstrap/modal";
import {NgCircleProgressModule} from "ng-circle-progress";

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    BoardComponent,
    CellComponent,
    ScoreBoardComponent,
    ScoreComponent,
    InventoryComponent
  ],
  imports: [
    ModalModule.forRoot(),
    NgCircleProgressModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
