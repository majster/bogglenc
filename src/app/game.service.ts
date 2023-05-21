import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Subject, throwError} from "rxjs";
import {BackendService, Game} from "./backend.service";

export interface BoggleLetter {
    value: string
    selected: boolean
    selectedIndex: number
    boardIndex: number
}

export enum GameState {
    SELECTING, VICTORY, LOSS
}

export interface GameSettings {
    lumMode?: string
}

@Injectable({
    providedIn: 'root'
})
export class GameService {

    public static GAME_GOAL = 35;
    public static BOARD_SIZE = 16;
    public static LOCAL_STORAGE_GAME_DATA = 'gameDataV2';
    public static LOCAL_STORAGE_GAME_SETTINGS = 'gameSettings';

    isShowMainMenu = true;

    letterValues: { [key: string]: number } = {
        'a': 1,
        'b': 3,
        'c': 3,
        'č': 4,
        'd': 2,
        'e': 1,
        'f': 7,
        'g': 4,
        'h': 5,
        'i': 1,
        'j': 4,
        'k': 2,
        'l': 1,
        'm': 2,
        'n': 2,
        'o': 1,
        'p': 3,
        'r': 1,
        's': 2,
        'š': 4,
        't': 2,
        'u': 4,
        'v': 4,
        'z': 2,
        'ž': 10,
    };

    gameData!: {
        goalProgress: number;
        guessedWords: string[];
        missedWords: string[];
        lettersBag: BoggleLetter[][];
        timeProgress: number;
        game: Game;
    }

    gameSettings: GameSettings = {} as GameSettings

    gameDataSubject$ = new Subject<any>();
    leaderBoardFormSubject$ = new Subject<any>();
    newGameCreating$ = new BehaviorSubject<boolean>(false);
    private timerInterval: any;

    constructor(private backendService: BackendService) {
    }

    get score() {
        return this.gameData.game.score;
    }

    get guessedWords() {
        return this.gameData.guessedWords;
    }

    get missedWords() {
        return this.gameData.missedWords;
    }

    get currentWord(): string {
        const boggleLettersBySelectedIndex = this.selectedByLastIndex;
        let currentWordInReverse = '';
        boggleLettersBySelectedIndex.forEach(letter => {
            if (letter.selectedIndex > 0) {
                currentWordInReverse += letter.value;
            }
        })
        return currentWordInReverse.split("").reverse().join("");
    }

    get selectedByLastIndex() {
        return this.sortBySelectedIndex(this.selectedLetters);
    }

    get goalProgress(): number {
        return this.gameData.goalProgress!;
    }

    set goalProgress(value: number) {
        this.gameData.goalProgress = value;
        this.stateChanged();
    }

    get boardBag(): BoggleLetter[] {
        return this.gameData.lettersBag
            .flat();
    }

    get timeProgress(): number {
        return this.gameData.timeProgress!;
    }

    set timeProgress(value: number) {
        this.gameData.timeProgress = value;
        this.stateChanged();
    }

    get selectedLetters() {
        return this.gameData.lettersBag.flat().filter(letter => letter.selected);
    }


    /**
     * Get GameState based on gameData
     */
    get gameState(): GameState {
        if (this.timeProgress >= 100) {
            return GameState.LOSS;
        } else if (this.goalProgress >= 100) {
            return GameState.VICTORY;
        } else {
            return GameState.SELECTING;
        }
    }

    public sortBySelectedIndex(arr: any[]) {
        return arr.sort((a, b) => b.selectedIndex - a.selectedIndex);
    }

    addGuessedWord(word: string) {
        this.gameData.guessedWords.push(word);
        this.stateChanged(true);
    }

    calculateGoalProgress() {

        let progress = this.guessedWords.length;
        this.goalProgress = Math.ceil((progress / GameService.GAME_GOAL) * 100);
    }


    public resumeGame(existingGameState: string) {
        this.gameData = JSON.parse(existingGameState);
        this.gameData.lettersBag.flat().forEach((letter, index) => {
            // fix a bug where boardIndex was not set
            letter.boardIndex = index;
        })
        this.isShowMainMenu = false;
        this.resumeTimer();
    }

    newGame() {
        this.createNewState();
    }

    createNewState() {
        this.newGameCreating$.next(true);
        this.backendService.startGame()
            .pipe(
                catchError(err => {
                    this.newGameCreating$.next(false);
                    console.log('Handling error locally and rethrowing it...', err);
                    return throwError(err);
                })
            )
            .subscribe(game => {
                this.gameData = {
                    goalProgress: 0,
                    guessedWords: [],
                    missedWords: [],
                    timeProgress: 0
                } as any;
                this.applyBackendGame(game);

                this.gameDataSubject$.next(false);
                this.persistState();
                this.createTimer();
                this.isShowMainMenu = false;
                this.newGameCreating$.next(false);
            })
    }

    createTimer() {
        this.gameData.timeProgress = 0;
        this.pauseTimer()
        this.resumeTimer();
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
    }

    resumeTimer() {
        if (this.timerInterval) {
            this.pauseTimer()
        }
        this.timerInterval = setInterval(() => {
            this.timeProgress += 1;
        }, 1000)
    }

    stateChanged(wordGuess?: boolean) {
        this.gameDataSubject$.next(wordGuess);
        this.persistState();
    }

    public convertToMultiDimensionalBoardBag(arr: BoggleLetter[]): BoggleLetter[][] {

        const multidimensional: any[] = [];

        arr.forEach((value, index) => {
            const rowIndex = Math.floor(index / 4);

            if (!multidimensional[rowIndex]) {
                multidimensional[rowIndex] = [];
            }
            multidimensional[rowIndex].push(value);
        })

        return multidimensional;
    }

    public toggleLightDarkMode() {
        const token = 'dark';
        if (document.body.classList.contains(token)) {
            document.body.classList.remove(token)
            this.setLumMode('');
        } else {
            this.setLumMode(token);
        }
    }

    public setLumMode(token: string) {
        if (token) {
            document.body.classList.add(token)
        }
        this.gameSettings.lumMode = token;
        localStorage.setItem(GameService.LOCAL_STORAGE_GAME_SETTINGS, JSON.stringify(this.gameSettings));
    }

    public exitGame() {
        this.pauseTimer();
        this.isShowMainMenu = true;
    }

    public applyBackendGame(game: Game) {
        const playerLettersBag = game.board.map((letter, index) => {
            return {
                value: letter.char,
                selected: false,
                selectedIndex: 0,
                boardIndex: index
            } as BoggleLetter
        });

        this.gameData.game = game;
        this.gameData.lettersBag = this.convertToMultiDimensionalBoardBag(playerLettersBag);
    }

    private persistState() {
        localStorage.setItem(GameService.LOCAL_STORAGE_GAME_DATA, JSON.stringify(this.gameData));
    }
}
