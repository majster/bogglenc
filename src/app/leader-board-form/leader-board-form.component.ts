import {Component} from '@angular/core';
import {BoggleLetter, GameService} from "../game.service";
import {BsModalRef} from "ngx-bootstrap/modal";

@Component({
    selector: 'app-leader-board-form',
    templateUrl: './leader-board-form.component.html',
    styleUrls: ['./leader-board-form.component.scss']
})
export class LeaderBoardFormComponent {
    public static VICTORY_ENTRY_MAX_LEN = 16;
    boardBag!: BoggleLetter[][];
    inProgress!: boolean;
    charArr!: string[]
    maxLength = false;

    constructor(public gameService: GameService, public modalRef: BsModalRef) {

        let s = '';
        for (var i = 41; i <= 64; i++) {
            s += String.fromCharCode(i);
        }

        this.charArr = Object.keys(this.gameService.letterValues);
        this.charArr.push(...s.split(''))
        this.generateBoardBag();
    }

    _currentWord = ''

    get currentWord() {
        return this._currentWord;
    }

    set currentWord(value: string) {
        this._currentWord = value
        this.maxLength = this._currentWord.length >= LeaderBoardFormComponent.VICTORY_ENTRY_MAX_LEN;
    }

    get sortBySelectedIndex() {
        return this.gameService.sortBySelectedIndex(this.boardBag.flat())
    }

    selectCell(row: number, index: number) {

        let cell = this.boardBag[row][index];

        const selectedByLastIndex = this.sortBySelectedIndex[0];
        if (cell.selected && cell.selectedIndex === selectedByLastIndex.selectedIndex) {
            // unselect
            cell.selected = false;
            cell.selectedIndex = 0;
            this.currentWord = this.currentWord.substring(0, this.currentWord.length - 1);
            return;
        }

        if (cell.selected) {
            return;
        }

        if (selectedByLastIndex) {
            cell.selectedIndex = selectedByLastIndex.selectedIndex + 1;
        } else {
            cell.selectedIndex = 1;
        }


        // Select the new cell and update the selected row and col
        cell.selected = true;

        this.currentWord += cell.value
    }

    submit() {
        this.gameService.gameData.victoryName = this.currentWord;
        this.gameService.stateChanged(false)
        this.modalRef.hide();
    }

    restCurrentWord() {
        this.currentWord = '';
    }

    reRoll() {
        this.generateBoardBag();
    }

    private generateBoardBag() {
        const arr = [];
        for (let i = 0; i < GameService.BOARD_SIZE; i++) {
            this.gameService.shuffleArray(this.charArr);
            arr.push({
                value: this.charArr[0],
                selectedIndex: 0,
                boardIndex: i,
                selected: false
            })
        }

        this.boardBag = this.gameService.convertToMultiDimensionalBoardBag(arr)
    }
}
