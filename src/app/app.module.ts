import { isDevMode, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { HttpClientModule } from "@angular/common/http";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { connectAuthEmulator, getAuth, provideAuth } from "@angular/fire/auth";
import { ServiceWorkerModule } from "@angular/service-worker";
import { ModalModule } from "ngx-bootstrap/modal";
import { environment } from "../environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AchievementsComponent } from "./components/achievements/achievements.component";
import { BoardKeyComponent } from "./components/board-key/board-key.component";
import { BoardComponent } from "./components/board/board.component";
import { InventoryComponent } from "./components/inventory/inventory.component";
import { LeaderBoardFormComponent } from "./components/leader-board-form/leader-board-form.component";
import { LeaderBoardModalComponent } from "./components/leader-board-modal/leader-board-modal.component";
import { LeaderBoardComponent } from "./components/leader-board/leader-board.component";
import { MenuComponent } from "./components/menu/menu.component";
import { ModalComponent } from "./components/modal/modal.component";
import { ScoreComponent } from "./components/score/score.component";
import { TimerComponent } from "./components/timer/timer.component";
import { VictoryConfettiComponent } from "./components/victory-confetti/victory-confetti.component";
import { GameOverComponent } from "./views/game-over/game-over.component";
import { GameComponent } from "./views/game/game.component";
import { MainMenuComponent } from "./views/main-menu/main-menu.component";
import { AuthComponent } from './views/auth/auth.component';

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
    GameOverComponent,
    TimerComponent,
    BoardKeyComponent,
    AuthComponent,
  ],
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });
      return auth;
    }),
    ModalModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
