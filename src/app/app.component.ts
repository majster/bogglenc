import {Component, OnInit} from '@angular/core';
import {GameService, GameSettings} from "./services/game.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    constructor(public gameService: GameService) {

    }

    ngOnInit() {
        const gameSettingsLS = localStorage.getItem(GameService.LOCAL_STORAGE_GAME_SETTINGS);
        if (gameSettingsLS) {
            const settings = JSON.parse(gameSettingsLS) as GameSettings;
            this.gameService.gameSettings = settings;
            if (settings.lumMode) {
                this.gameService.setLumMode(settings.lumMode);
            }
        }
    }
}
