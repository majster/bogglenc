import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BoardComponent} from './components/board/board.component';
import {HttpClientModule} from "@angular/common/http";
import {ScoreComponent} from './components/score/score.component';
import {InventoryComponent} from './components/inventory/inventory.component';
import {ModalModule} from "ngx-bootstrap/modal";
import {NgCircleProgressModule} from "ng-circle-progress";
import {MenuComponent} from './components/menu/menu.component';
import {LeaderBoardComponent} from './components/leader-board/leader-board.component';
import {LeaderBoardFormComponent} from './components/leader-board-form/leader-board-form.component';
import {LeaderBoardModalComponent} from './components/leader-board-modal/leader-board-modal.component';
import {MainMenuComponent} from './views/main-menu/main-menu.component';
import {VictoryConfettiComponent} from './components/victory-confetti/victory-confetti.component';
import {ModalComponent} from './components/modal/modal.component';
import {AchievementsComponent} from './components/achievements/achievements.component';
import {GameComponent} from './views/game/game.component';
import {GameOverComponent} from './views/game-over/game-over.component';

@NgModule({
    declarations: [
        AppComponent,
        BoardComponent,
        ScoreComponent,
        InventoryComponent,
        MenuComponent,
        LeaderBoardComponent,
        LeaderBoardFormComponent,
        LeaderBoardModalComponent,
        MainMenuComponent,
        VictoryConfettiComponent,
        ModalComponent,
        AchievementsComponent,
        GameComponent,
        GameOverComponent
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
export class AppModule {
}
