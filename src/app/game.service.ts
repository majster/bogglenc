import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

export enum BoggleLetterState {
    ON_BOARD = "ON_BOARD", DISCARDED = "DISCARDED", UPCOMONG = "UPCOMONG"
}

export interface BoggleLevelUp {
    powerUp: string;
    commonLetter: string;
    unCommonLetter: string;
    applied: boolean
    appliedType: string | undefined
}

export interface BoggleLetter {
    value: string
    selected: boolean
    selectedIndex: number
    state: BoggleLetterState
    boardIndex?: number | undefined
}

@Injectable({
    providedIn: 'root'
})
export class GameService {

    public static BOARD_SIZE = 16;
    public static BAG_INITIAL_SIZE = 20;
    public static LOCAL_STORAGE_GAME_STATE = 'gameState';

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

    gameState!: {
        score: number;
        guessedWords: string[];
        lettersBag: BoggleLetter[];
        level: number;
        levelUps: BoggleLevelUp[]
        appliedLevelUps: number;
    }

    $timeProgressSubject = new BehaviorSubject<number>(0);
    timeProgress: number = 0;
    private timerInterval: any;

    constructor() {
    }

    get score() {
        return this.gameState.score;
    }

    set score(value: number) {
        this.gameState.score = value;
    }

    get guessedWords() {
        return this.gameState.guessedWords;
    }


    get discardedLetters() {
        return this.gameState.lettersBag.filter(letter => letter.state === BoggleLetterState.DISCARDED);
    }

    get upcomingLetters() {
        return this.gameState.lettersBag.filter(letter => letter.state === BoggleLetterState.UPCOMONG);
    }

    get selectedLetters() {
        return this.gameState.lettersBag.filter(letter => letter.selected && letter.state === BoggleLetterState.ON_BOARD);
    }

    get boardBag() {
        return this.gameState.lettersBag
            .filter(letter => letter.state === BoggleLetterState.ON_BOARD)
            .sort((a, b) => (a.boardIndex as any) - (b.boardIndex as any));
    }

    get commonLetters(): string[] {
        return this.allLetters.filter(letter => {
            let letterValue = this.letterValues[letter];
            return letterValue < 3;
        })
    }

    get unCommonLetters(): string[] {
        return this.allLetters.filter(letter => {
            let letterValue = this.letterValues[letter];
            return letterValue > 2;
        })
    }

    get allLetters(): string[] {
        return this.getCopyOfArray(Object.keys(this.letterValues));
    }

    get unAppliedLevelUps(): BoggleLevelUp[] {
        return this.gameState.levelUps.filter(value => !value.applied)
    }

    get appliedLevelUps(): BoggleLevelUp[] {
        return this.gameState.levelUps.filter(value => value.applied)
    }

    replaceSelectedCells() {

        const selected = this.selectedLetters;
        const boardIndexesToReplace = selected.map(letter => letter.boardIndex);

        selected.forEach(letter => {
            letter.state = BoggleLetterState.DISCARDED;
            letter.selected = false;
            letter.selectedIndex = 0;
            letter.boardIndex = undefined;
        });

        let upcoming = this.upcomingLetters;

        if (boardIndexesToReplace.length > upcoming.length) {

            this.discardedLetters.forEach(letter => {
                letter.state = BoggleLetterState.UPCOMONG
            })

            upcoming = this.upcomingLetters;
        }

        const upcomingShuffled = upcoming.sort(() => 0.5 - Math.random());
        boardIndexesToReplace.forEach((boardIndex, index) => {
            const randomArrayEntry: BoggleLetter = upcoming[index];
            // put on board a random letter
            randomArrayEntry.boardIndex = boardIndex;
            randomArrayEntry.state = BoggleLetterState.ON_BOARD
        })
    }

    getCopyOfArray(arr: any[]): any[] {
        return Object.assign([], arr);
    }

    getLettersLevelOneBag(): BoggleLetter[] {
        const levelOneLetters = this.commonLetters;
        const levelOneBagLetters: BoggleLetter[] = [];
        for (let i = 0; i < GameService.BAG_INITIAL_SIZE; i++) {
            const randomLetter = this.randomArrayEntry(levelOneLetters);
            levelOneBagLetters.push({
                value: randomLetter,
                state: BoggleLetterState.UPCOMONG,
                selected: false,
                selectedIndex: 0,
            });
        }

        return levelOneBagLetters;
    }

    setupGame() {

        const existingGameState = localStorage.getItem(GameService.LOCAL_STORAGE_GAME_STATE);
        if (existingGameState) {
            this.gameState = JSON.parse(existingGameState);
            this.createTimer();
        } else {
            this.createNewGame();
        }
    }

    generateBoardBag(lettersBag: BoggleLetter[]): BoggleLetter[] {

        // put random number of letters on board
        const shuffled = lettersBag.sort(() => 0.5 - Math.random());
        const boardBag: BoggleLetter[] = [];

        for (let i = 0; i < GameService.BOARD_SIZE; i++) {
            (shuffled[i] as BoggleLetter).boardIndex = i;
            (shuffled[i] as BoggleLetter).state = BoggleLetterState.ON_BOARD;
        }

        return boardBag;
    }

    createNewGame() {
        const playerLettersBag = this.getLettersLevelOneBag();
        this.generateBoardBag(playerLettersBag);
        this.gameState = {
            score: 0,
            lettersBag: playerLettersBag,
            guessedWords: [],
            level: 0,
            levelUps: [],
            appliedLevelUps: 0
        }
        this.persistState();
        this.createTimer();
    }

    createTimer() {
        this.timeProgress = 0;
        this.pauseTimer()
        this.resumeTimer();
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
    }

    resumeTimer() {
        this.timerInterval = setInterval(() => {
            this.timeProgress += 1;
            this.$timeProgressSubject.next(this.timeProgress);
        }, 1000)
    }

    levelUp() {
        this.gameState.level = Math.floor(this.gameState.score / 10);

        if (this.appliedLevelUps.length < this.gameState.level) {
            this.gameState.levelUps.push({
                commonLetter: this.randomArrayEntry(this.commonLetters),
                unCommonLetter: this.randomArrayEntry(this.unCommonLetters),
                powerUp: '',
                applied: false,
                appliedType: undefined
            })

            this.persistState();
        }
    }

    addUpgrade(selectedUpgrade: string) {
        this.gameState.lettersBag.push({
            state: BoggleLetterState.UPCOMONG,
            selected: false,
            value: selectedUpgrade,
            selectedIndex: 0
        })

        this.persistState();
    }

    private persistState() {
        localStorage.setItem(GameService.LOCAL_STORAGE_GAME_STATE, JSON.stringify(this.gameState));
    }

    private randomArrayEntry(arr: any[]): any {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
