import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

export interface BoggleLetter {
    value: string
    selected: boolean
    selectedIndex: number
    boardIndex: number
}

export enum GameState {
    SELECTING, VICTORY, LOSS
}

@Injectable({
    providedIn: 'root'
})
export class GameService {

    public static GAME_GOAL = 35;
    public static BOARD_SIZE = 16;
    public static LOCAL_STORAGE_GAME_DATA = 'gameData';

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
        score: number;
        goalProgress: number;
        guessedWords: string[];
        missedWords: string[];
        lettersBag: BoggleLetter[][];
        timeProgress: number;
        victoryName?: string;
    }

    gameDataSubject$ = new Subject<any>();

    private timerInterval: any;

    constructor() {
    }

    get score() {
        return this.gameData.score;
    }

    set score(value: number) {
        this.gameData.score = value;
        this.stateChanged();
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
        return this.gameData.goalProgress;
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
        return this.gameData.timeProgress;
    }

    set timeProgress(value: number) {
        this.gameData.timeProgress = value;
        this.stateChanged();
    }

    get selectedLetters() {
        return this.gameData.lettersBag.flat().filter(letter => letter.selected);
    }

    get unSlectedLetters() {
        return this.gameData.lettersBag.flat().filter(letter => !letter.selected);
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

    replaceSelectedCells() {
        const selected = this.selectedLetters;
        const unSelected = this.unSlectedLetters.map(letter => letter.value);

        const randomLetters: string[] = [];
        for (let i = 0; i < selected.length; i++) {

            let randomLetter!: string;
            while (!randomLetter || this.rejectLetter(unSelected, randomLetter)) {
                randomLetter = this.getRandomLetter();
            }

            randomLetters.push(randomLetter)
            unSelected.push(randomLetter)
        }

        selected.forEach((letter, index) => {
            letter.selected = false;
            letter.selectedIndex = 0;
            letter.value = randomLetters[index];
        });
    }

    public resumeGame(existingGameState: string) {
        this.gameData = JSON.parse(existingGameState);
        this.gameData.lettersBag.flat().forEach((letter, index) => {
            // fix a bug where boardIndex was not set
            letter.boardIndex = index;
        })

        this.resumeTimer();
    }

    newGame() {
        this.gameData = this.createNewState();
        this.gameDataSubject$.next(false);
        this.persistState();
        this.createTimer();
    }

    getRandomLetter() {
        const rndInteger = this.getRandomLetterValue();
        const pairs = Object.entries(this.letterValues);
        this.shuffleArray(pairs);
        const filter = pairs.filter(pair => {
            return pair[1] - rndInteger === 0;
        });
        return filter[0][0];
    }

    createNewState() {
        const randomLetters: string[] = [];
        for (let i = 0; i < GameService.BOARD_SIZE; i++) {

            let randomLetter!: string;
            while (!randomLetter || this.rejectLetter(randomLetters, randomLetter)) {
                randomLetter = this.getRandomLetter();
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
        }).sort((a, b) => (a.boardIndex as any) - (b.boardIndex as any))

        return {
            score: 0,
            goalProgress: 0,
            lettersBag: this.convertToMultiDimensionalBoardBag(playerLettersBag),
            guessedWords: [],
            missedWords: [],
            timeProgress: 0
        }
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
        this.timerInterval = setInterval(() => {
            this.timeProgress += 1;
        }, 1000)
    }

    stateChanged(wordGuess?: boolean) {
        this.gameDataSubject$.next(wordGuess);
        this.persistState();
    }

    public shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    private rejectLetter(arr: string[], letter: string): boolean {

        const lettersAlreadyInArray = arr.filter(value => value === letter);
        if (lettersAlreadyInArray.length >= 2) {
            return true;
        }

        const countMap = {} as any;
        const finalArr = [letter, ...arr]

        for (let i = 0; i < finalArr.length; i++) {
            if (!countMap[finalArr[i]]) {
                countMap[finalArr[i]] = 0;
            }
            countMap[finalArr[i]] += 1
        }

        const moreThanTwoTimes = Object.keys(countMap).filter(key => countMap[key] >= 2).length;

        if (moreThanTwoTimes > 2) {
            return true;
        }

        return false;
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
        localStorage.setItem(GameService.LOCAL_STORAGE_GAME_DATA, JSON.stringify(this.gameData));
    }

}
