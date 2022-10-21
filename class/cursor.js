const Screen = require('./screen');

class Cursor {
	constructor(numRows, numCols) {
		this.numRows = numRows;
		this.numCols = numCols;

		this.row = 0;
		this.col = 0;
		this.cell = '0, 0';

		this.selectedRow = null;
		this.selectedCol = null;
		this.selectedCell = null;

		this.gridColor = 'black';
		this.cursorColor = 'yellow';
		this.selectedColor = 'blue';
		this.swapColor = 'magenta';
	}

	setBackgroundColor() {
		// if no cell selected, set to default background highlight
		this.cell = `${this.row}, ${this.col}`;
		if (this.selectedCell === null) {
			Screen.setBackgroundColor(this.row, this.col, this.cursorColor);
		} else if (this.cell === this.selectedCell) {
			// if selected cell is current cell, set to selected background color
			Screen.setBackgroundColor(this.row, this.col, this.selectedColor);
		} else {
			// if a cell is selected and it's not the current cell,
			// set to special swap background highlight before swapping
			Screen.setBackgroundColor(this.row, this.col, this.swapColor);
		}
		Screen.render();
	}

	resetBackgroundColor() {
		// if current cell is not the selected, reset background color
		this.cell = `${this.row}, ${this.col}`;
		if (this.selectedCell !== this.cell) {
			Screen.setBackgroundColor(this.row, this.col, this.gridColor);
		}
		Screen.render();
	}

	resetAllBackgroundColor() {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				Screen.setBackgroundColor(i, j, this.gridColor);
			}
		}
		Screen.render();
	}

	setSelection() {
		this.selectedRow = this.row;
		this.selectedCol = this.col;
		this.selectedCell = `${this.row}, ${this.col}`;
		this.setBackgroundColor();
	}

	resetSelection() {
		// reset background color of the selected cell
		Screen.setBackgroundColor(
			this.selectedRow,
			this.selectedCol,
			this.gridColor
		);

		this.selectedRow = null;
		this.selectedCol = null;
		this.selectedCell = null;

		// highlight current cell appropriately
		this.setBackgroundColor();
	}

	up() {
		this.resetBackgroundColor();
		if (this.row > 0) this.row -= 1;
		this.setBackgroundColor();
	}

	down() {
		this.resetBackgroundColor();
		if (this.row < this.numRows - 1) this.row += 1;
		this.setBackgroundColor();
	}

	left() {
		this.resetBackgroundColor();
		if (this.col > 0) this.col -= 1;
		this.setBackgroundColor();
	}

	right() {
		this.resetBackgroundColor();
		if (this.col < this.numCols - 1) this.col += 1;
		this.setBackgroundColor();
	}
}

module.exports = Cursor;
