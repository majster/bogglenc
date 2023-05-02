import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

export interface BoggleLetter {
    value: string
    selected: boolean
    selectedIndex: number
    boardIndex?: number | undefined
}

@Injectable({
    providedIn: 'root'
})
export class GameService {

    public static BOARD_SIZE = 16;
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

    goalsByLength: { [key: string]: number } = {
        "8": 2,
        "7": 3,
        "6": 5,
        "5": 6,
        "4": 7,
        "3": 8
    }


    gameState!: {
        score: number;
        goalProgress: number;
        guessedWords: string[];
        lettersBag: BoggleLetter[];
        timeProgress: number;
    }

    $gameStateSubject = new Subject<any>();
    private timerInterval: any;

    constructor() {
    }

    get score() {
        return this.gameState.score;
    }

    set score(value: number) {
        this.gameState.score = value;
        this.stateChanged();
    }

    get guessedWords() {
        return this.gameState.guessedWords;
    }

    get goalProgress(): number {
        return this.gameState.goalProgress;
    }

    set goalProgress(value: number) {
        this.gameState.goalProgress = value;
        this.stateChanged();
    }


    get boardBag() {
        return this.gameState.lettersBag
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

    get timeProgress(): number {
        return this.gameState.timeProgress;
    }

    set timeProgress(value: number) {
        this.gameState.timeProgress = value;
        this.stateChanged();
    }

    get selectedLetters() {
        return this.gameState.lettersBag.filter(letter => letter.selected);
    }

    addGuessedWord(word: string) {
        this.gameState.guessedWords.push(word);
        this.stateChanged(true);
    }

    getGuessedWordsByLength(length: string) {
        const lengthAsNum = parseInt(length);
        return this.gameState.guessedWords.filter(word => {
            if (lengthAsNum < 8) {
                return word.length === lengthAsNum
            } else {
                return word.length >= lengthAsNum
            }
        })
    }

    calculateGoalProgress() {

        let full = 0;
        let progress = 0;
        Object.keys(this.goalsByLength).forEach(wordLength => {
            const guessedWordsByLength = this.getGuessedWordsByLength(wordLength);
            const value = this.goalsByLength[wordLength];
            full += value;
            if (guessedWordsByLength.length > value) {
                progress += value;
            } else {
                progress += guessedWordsByLength.length;
            }
        })

        this.goalProgress = Math.ceil((progress / full) * 100);
    }

    replaceSelectedCells() {
        const selected = this.selectedLetters;

        const randomLetters: string[] = [];
        for (let i = 0; i < selected.length; i++) {

            let randomLetter!: string;
            while (!randomLetter ||
            (randomLetters.includes(randomLetter)
                && randomLetters.filter(value => value === randomLetter).length > 1
                && this.boardBag.filter(boggleLetter => boggleLetter.value === randomLetter).length > 1)) {
                randomLetter = this.getRandomLetter2();
            }

            randomLetters.push(randomLetter)
        }


        selected.forEach((letter, index) => {
            letter.selected = false;
            letter.selectedIndex = 0;
            letter.boardIndex = undefined;
            letter.value = randomLetters[index];
        });
    }

    getCopyOfArray(arr: any[]): any[] {
        return Object.assign([], arr);
    }

    setupGame() {

        const existingGameState = localStorage.getItem(GameService.LOCAL_STORAGE_GAME_STATE);
        if (existingGameState) {
            this.gameState = JSON.parse(existingGameState);
            this.resumeTimer();
        } else {
            this.createNewGame();
        }
    }

    getRandomLetter2() {
        const rndInteger = this.getRandomLetterValue();
        const pairs = Object.entries(this.letterValues);
        this.shuffleArray(pairs);
        const filter = pairs.filter(pair => {
            return pair[1] - rndInteger === 0;
        });
        return filter[0][0];
    }

    createNewGame() {

        const randomLetters: string[] = [];
        for (let i = 0; i < GameService.BOARD_SIZE; i++) {

            let randomLetter!: string;
            while (!randomLetter || (randomLetters.includes(randomLetter) && randomLetters.filter(value => value === randomLetter).length > 1)) {
                randomLetter = this.getRandomLetter2();
            }

            randomLetters.push(randomLetter)
        }

        const playerLettersBag = randomLetters.map((value, index) => {
            return {
                value: value,
                selected: false,
                selectedIndex: 0,
                boardIndex: index
            } as BoggleLetter
        })

        // const playerLettersBag = this.getRandomLettersArray(GameService.BOARD_SIZE);

        this.gameState = {
            score: 0,
            goalProgress: 0,
            lettersBag: playerLettersBag,
            guessedWords: [],
            timeProgress: 0
        }
        this.persistState();
        this.createTimer();
    }

    createTimer() {
        this.gameState.timeProgress = 0;
        this.pauseTimer()
        this.resumeTimer();
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
    }

    resumeTimer() {
        this.timerInterval = setInterval(() => {
            this.timeProgress += 1;
        }, 1000)
    }

    stateChanged(wordGuess?: boolean) {
        this.$gameStateSubject.next(wordGuess);
        this.persistState();
    }

    private getRandomLetterValue(): number {
        let rndInteger: number | undefined;

        while (rndInteger === undefined || [6, 8, 9].includes(rndInteger)) {
            const rnd = Math.random();
            if (rnd < 0.5) {
                rndInteger = 1;
            } else if (rnd < 0.6) {
                rndInteger = 2;
            } else if (rnd < 0.7) {
                rndInteger = 3;
            } else if (rnd < 0.8) {
                rndInteger = 4;
            } else if (rnd < 0.85) {
                rndInteger = 5;
            } else if (rnd < 0.95) {
                rndInteger = 7;
            } else {
                rndInteger = 10;
            }
        }

        return rndInteger;
    }

    private persistState() {
        localStorage.setItem(GameService.LOCAL_STORAGE_GAME_STATE, JSON.stringify(this.gameState));
    }

    private getRndInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
