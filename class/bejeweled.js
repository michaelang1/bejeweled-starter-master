const Screen = require('./screen');
const Cursor = require('./cursor');

class Bejeweled {
	constructor() {
		this.itemList = ['🥝', '🍋', '🍊', '🍌', '🥥', '🍇', '🍉'];
		this.grid = [];
		this.matches = []; // store all the matches found

		// total scores
		this.score = 0;
		this.comboScore = 0;
		this.comboTimes = 0;

		// current scores of most recent swap
		this.scoreCurr = 0;
		this.comboScoreCurr = 0;
		this.comboTimesCurr = 0;

		this.cursor = new Cursor(8, 8);

		// Initialize an 8 x 8 bejeweled grid
		Screen.initialize(8, 8);
		Screen.setGridlines(false);

		// add commands
		Screen.addCommand('up', 'go up', this.cursor.up.bind(this.cursor));
		Screen.addCommand(
			'left',
			'go left',
			this.cursor.left.bind(this.cursor)
		);
		Screen.addCommand(
			'right',
			'go right',
			this.cursor.right.bind(this.cursor)
		);
		Screen.addCommand(
			'down',
			'go down',
			this.cursor.down.bind(this.cursor)
		);
		Screen.addCommand(
			'space',
			'select and then swap',
			this.selectOrSwap.bind(this)
		);
		Screen.addCommand(
			'r',
			'recommend a valid move',
			this.randomValidMove.bind(this)
		);
		Screen.addCommand(
			'e',
			'show all valid moves',
			this.allValidMoves.bind(this)
		);
		Screen.addCommand('s', 'show total score', this.printScore.bind(this));
		Screen.addCommand(
			'a',
			'show score of most recent swap',
			this.printScoreCurr.bind(this)
		);

		// fill the board with items
		this.fillBoard();

		// recursively remove matches and fill with random items until no matches
		// exist before the player can start
		// argument is to show delayed animation (true) or not (false)
		this.repairBoard(false);
	}

	fillBoard() {
		for (let i = 0; i < this.cursor.numRows; i++) {
			let row = [];
			for (let j = 0; j < this.cursor.numCols; j++) {
				let item = Bejeweled.randomItem(this.itemList);
				row.push(item);
				Screen.setGrid(i, j, item);
			}
			this.grid.push(row);
		}
		Screen.render();
	}

	repairBoard(delay = false) {
		this.matches = Bejeweled.checkForMatches(this.grid);
		let bejeweled = this;

		if (delay === true) {
			// to have a delay between each step of the repair process
			// recursively remove matches -> fill with random items
			setTimeout(function () {
				// 1st timeout
				bejeweled.highlightMatches('cyan');
				setTimeout(function () {
					// 2nd timeout
					bejeweled.removeMatches();
					setTimeout(function () {
						// 3rd timeout
						bejeweled.fillRandomItems();
						setTimeout(function () {
							// 4th timeout
							bejeweled.cursor.resetAllBackgroundColor();
							bejeweled.matches = Bejeweled.checkForMatches(
								bejeweled.grid
							);

							// if there are still matches, continue recursively
							if (bejeweled.matches.length > 0) {
								bejeweled.repairBoard(delay);
							} else {
								// set initial highlight at 0, 0 location
								// has to be done in the nested setTimeouts, not under it
								bejeweled.cursor.setBackgroundColor();
							}
						}, 0);
					}, 500);
				}, 500);
			}, 700);
		} else {
			// no delay between remove and fill
			this.removeMatches();
			this.fillRandomItems();
			this.matches = Bejeweled.checkForMatches(this.grid);
			if (this.matches.length > 0) {
				this.repairBoard();
			}
			// set initial highlight at 0, 0 location
			bejeweled.cursor.setBackgroundColor();
		}
	}

	selectOrSwap(delay = true) {
		// check if there are valid moves still left
		let validMoves = Bejeweled.checkValidMoves(this.grid);
		if (validMoves.length === 0) {
			Screen.printMessage(
				"No more valid moves available! Press 'q' to quit game."
			);
		} else {
			// if no cell is selected, select current cell
			// and change current cell background to special color
			if (this.cursor.selectedCell === null) {
				this.cursor.setSelection();
				Screen.printMessage('Selection made!');
			} else {
				// if a cell is already selected, check if the item is adjacent
				let posDiffRow = Math.abs(
					this.cursor.row - this.cursor.selectedRow
				);
				let posDiffCol = Math.abs(
					this.cursor.col - this.cursor.selectedCol
				);
				let posDiff = posDiffRow + posDiffCol;

				// if not adjacent, select the current item instead
				if (posDiff !== 1) {
					this.cursor.resetSelection();
					this.cursor.setSelection();
					Screen.printMessage(
						'New selection made, you can only swap with an adjacent item!'
					);
				} else {
					// if adjacent, perform a swap
					// argument is to show delayed animation (true) or not (false)
					this.swap(delay);
				}
			}
		}
	}

	swap(delay) {
		// Does the swap lead to matches? Try swapping first, and then check
		let selectedItem =
			this.grid[this.cursor.selectedRow][this.cursor.selectedCol];
		let currentItem = this.grid[this.cursor.row][this.cursor.col];

		this.grid[this.cursor.selectedRow][this.cursor.selectedCol] =
			currentItem;
		this.grid[this.cursor.row][this.cursor.col] = selectedItem;

		// check if the swapped grid has any matches
		this.matches = Bejeweled.checkForMatches(this.grid);

		// if the swapped grid has >= 1 matches, update screen grid
		if (this.matches.length > 0) {
			Screen.setGrid(
				this.cursor.selectedRow,
				this.cursor.selectedCol,
				currentItem
			);
			Screen.setGrid(this.cursor.row, this.cursor.col, selectedItem);

			// before executing the successful swap, reset selection to null
			this.cursor.resetSelection();
			// reset current scores
			this.resetScoreCurr();

			// remove the match, drop items, and remove combos recursively
			// and update total score board
			// argument is to show delayed animation (true) or not (false)
			this.removeNDrop(delay);
		} else {
			// if no matches, revert the grid back to where it was
			this.grid[this.cursor.selectedRow][this.cursor.selectedCol] =
				selectedItem;
			this.grid[this.cursor.row][this.cursor.col] = currentItem;

			// after a failed swap try, reset selection to null, print message
			this.cursor.resetSelection();
			Screen.printMessage(
				"Won't line up 3 or more of the same item, try again!"
			);
		}
	}

	removeNDrop(delay) {
		this.matches = Bejeweled.checkForMatches(this.grid);
		let bejeweled = this;

		if (delay === true) {
			// to have a delay between each step of the removal and drop (recursive),
			// also keep track of current score and current combo score
			setTimeout(function () {
				// 1st timeout
				bejeweled.highlightMatches('cyan');

				setTimeout(function () {
					// 2nd timeout
					let amountRemoved = bejeweled.removeMatches();
					// update current scores
					bejeweled.updateScoreCurr(amountRemoved);

					setTimeout(function () {
						// 3rd timeout
						bejeweled.dropItems();

						setTimeout(function () {
							// 4th timeout
							bejeweled.cursor.resetAllBackgroundColor();
							bejeweled.matches = Bejeweled.checkForMatches(
								bejeweled.grid
							);

							// if there are still matches, continue recursively
							if (bejeweled.matches.length > 0) {
								bejeweled.removeNDrop(delay);
							} else {
								// when no more matches and all the setTimeouts are finally done:

								// set cursor background
								bejeweled.cursor.setBackgroundColor();
								// print current scores summary for this round
								bejeweled.printScoreCurr();
								// update total score board.
								// - It has to be updated within the nested setTimeouts.
								// If it's updated below the setTimeouts, the scores will be updated too soon.
								bejeweled.updateScore();
							}
						}, 0);
					}, 1100);
				}, 900);
			}, 700);
		} else {
			// run remove and drop recursively without delay in between
			let amountRemoved = bejeweled.removeMatches();
			bejeweled.updateScoreCurr(amountRemoved);
			bejeweled.dropItems();
			bejeweled.matches = Bejeweled.checkForMatches(bejeweled.grid);
			if (bejeweled.matches.length > 0) {
				bejeweled.removeNDrop(delay);
			} else {
				bejeweled.printScoreCurr();
				bejeweled.updateScore();
			}
		}
	}

	removeMatches() {
		// go through each item within each match, replace item with ''
		if (this.matches.length > 0) {
			for (let match of this.matches) {
				for (let i = 0; i < match.length; i++) {
					let row = match[i]['row'];
					let col = match[i]['col'];
					this.grid[row][col] = '  ';
					Screen.setGrid(row, col, '  ');
				}
			}
		}
		Screen.render();

		// count how many items are removed in total for keeping sore
		// can't use the loop above because there may be items that belong to
		// both a row match and a column match at the same time
		let amountRemoved = 0;
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[0].length; j++) {
				if (this.grid[i][j] === '  ') {
					amountRemoved++;
				}
			}
		}
		return amountRemoved;
	}

	dropItems() {
		// fill emptied grid with items from above, from bottom to top, left to right
		for (let i = this.grid.length - 1; i >= 0; i--) {
			for (let j = 0; j < this.grid[0].length; j++) {
				if (this.grid[i][j] === '  ') {
					// find nearest item above
					let itemToDrop = null;
					for (let c = i - 1; c >= 0; c--) {
						if (this.grid[c][j] !== '  ') {
							// if found, set the found item to be empty (swap)
							itemToDrop = this.grid[c][j];
							this.grid[c][j] = '  ';
							Screen.setGrid(c, j, '  ');
							break;
						}
					}

					// if fails to find an item above (out of boarder), use random
					if (itemToDrop === null) {
						itemToDrop = Bejeweled.randomItem(this.itemList);
					}

					// update the empty grid with dropped item
					this.grid[i][j] = itemToDrop;
					Screen.setGrid(i, j, itemToDrop);
				}
			}
		}
		Screen.render();
	}

	fillRandomItems() {
		// after removing matches, fill with random items before the player can start
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[0].length; j++) {
				if (this.grid[i][j] === '  ') {
					this.grid[i][j] = Bejeweled.randomItem(this.itemList);
					Screen.setGrid(i, j, this.grid[i][j]);
				}
			}
		}
		Screen.render();
	}

	static randomItem(array) {
		let min = Math.ceil(0);
		let max = Math.floor(array.length - 1);
		let randomIndex = Math.floor(Math.random() * (max - min + 1) + min);
		return array[randomIndex];
	}

	updateScoreCurr(amountRemoved) {
		// if current score is zero, update it, if not, count as a combo instead
		// and update current swap & combo scores respectively
		if (this.scoreCurr === 0) {
			Screen.printMessage(` ${amountRemoved} items removed!`);
			this.scoreCurr = amountRemoved;
		} else {
			this.comboTimesCurr++;
			Screen.printMessage(
				`Combo #${this.comboTimesCurr}, ${amountRemoved} extra items removed!`
			);
			this.comboScoreCurr += amountRemoved;
		}
	}

	resetScoreCurr() {
		// reset current scores
		this.scoreCurr = 0;
		this.comboScoreCurr = 0;
		this.comboTimesCurr = 0;
	}

	updateScore() {
		// add current score and current combo scores to the score board
		this.score += this.scoreCurr;
		this.comboScore += this.comboScoreCurr;
		this.comboTimes += this.comboTimesCurr;
	}

	printScoreCurr() {
		let validMoves = Bejeweled.checkValidMoves(this.grid);
		Screen.printMessage(`
 || Summary for This Swap ||\n
 🔹 Total removed: ${this.scoreCurr + this.comboScoreCurr}\n
 🔹 Removed by combos: ${this.comboScoreCurr}\n
 🔹 Combos created: ${this.comboTimesCurr}\n
 🔅 ${validMoves.length} valid moves are now available.\n`);
	}

	printScore() {
		let validMoves = Bejeweled.checkValidMoves(this.grid);
		Screen.printMessage(`
 || Total Score Board ||\n
 🔸 Total removed : ${this.score + this.comboScore}\n
 🔸 Total Removed by combos: ${this.comboScore}\n
 🔸 Total Combos created: ${this.comboTimes}\n
 🔅 ${validMoves.length} valid moves are now available.\n`);
	}

	randomValidMove() {
		// reset all background colors first
		this.cursor.resetAllBackgroundColor();

		let validMoves = Bejeweled.checkValidMoves(this.grid);
		if (validMoves.length === 0) {
			Screen.printMessage(
				"No more valid moves available! Press 'q' to quit game."
			);
		} else {
			let min = Math.ceil(0);
			let max = Math.floor(validMoves.length - 1);
			let randomIndex = Math.floor(Math.random() * (max - min + 1) + min);
			let move = validMoves[randomIndex];

			// highlight the suggested random valid move
			Screen.setBackgroundColor(move[0], move[1], 'white');
			Screen.setBackgroundColor(move[2], move[3], 'white');
		}

		// reset selection
		if (this.cursor.selectedCell !== null) {
			this.cursor.resetSelection();
		}
		// set cursor background again
		this.cursor.setBackgroundColor();
		Screen.render();
	}

	allValidMoves() {
		// reset all background colors first
		this.cursor.resetAllBackgroundColor();
		let validMoves = Bejeweled.checkValidMoves(this.grid);
		if (validMoves.length === 0) {
			Screen.printMessage(
				"No more valid moves available! Press 'q' to quit game."
			);
		} else {
			for (let i = 0; i < validMoves.length; i++) {
				Screen.setBackgroundColor(
					validMoves[i][0],
					validMoves[i][1],
					'white'
				);
				Screen.setBackgroundColor(
					validMoves[i][2],
					validMoves[i][3],
					'white'
				);
			}
		}

		// reset selection
		if (this.cursor.selectedCell !== null) {
			this.cursor.resetSelection();
		}
		// set cursor background again
		this.cursor.setBackgroundColor();
		Screen.render();
	}

	highlightMatches(matchBgColor) {
		// reset all background colors first
		this.cursor.resetAllBackgroundColor();
		// highlight matches' background, for better visuals only
		// go through each item within each match, highlight the backgrounds
		if (this.matches.length > 0) {
			for (let match of this.matches) {
				for (let i = 0; i < match.length; i++) {
					let row = match[i]['row'];
					let col = match[i]['col'];
					Screen.setBackgroundColor(row, col, matchBgColor);
				}
			}
		}
		Screen.render();
	}

	static checkForMatches(grid) {
		let matches = [];

		// check rows
		for (let i = 0; i < grid.length; i++) {
			let firstEl = grid[i][0];
			let match = [{ item: firstEl, row: i, col: 0 }];

			// starting from the 2nd element
			for (let j = 1; j < grid[0].length; j++) {
				let el = grid[i][j];
				let tryMatch = { item: el, row: i, col: j };

				// check if last element in match array = current element
				if (match[match.length - 1].item === el) {
					match.push(tryMatch);
					// if it's the last element to check and match has gathered
					// >= 3 items, push match into matches array
					if (j === grid[0].length - 1 && match.length >= 3) {
						matches.push(match);
					}
					// if !== and match array length < 3, reset match to current element
				} else if (match.length < 3) {
					match = [tryMatch];
					// if !== and match array length >= 3, push match into matches array
					// and reset match to current element
				} else {
					matches.push(match);
					match = [tryMatch];
				}
			}
		}

		// check columns
		for (let j = 0; j < grid[0].length; j++) {
			let firstEl = grid[0][j];
			let match = [{ item: firstEl, row: 0, col: j }];

			// starting from the 2nd element
			for (let i = 1; i < grid.length; i++) {
				let el = grid[i][j];
				let tryMatch = { item: el, row: i, col: j };

				// check if last element in match array = current element
				if (match[match.length - 1].item === el) {
					// if yes, push it into match array
					match.push(tryMatch);
					// if it's the final element to check and match has gathered
					// >= 3 items, push match into matches array
					if (i === grid.length - 1 && match.length >= 3) {
						matches.push(match);
					}
					// if no, and match array length < 3, reset match to current element
				} else if (match.length < 3) {
					match = [tryMatch];
					// if no, and match array length >= 3, push match into matches array
					// and reset match to current element
				} else {
					matches.push(match);
					match = [tryMatch];
				}
			}
		}

		return matches;
	}

	static checkValidMoves(grid) {
		let validMoves = [];
		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[0].length; j++) {
				// try to swap with above and then left, see if there are matches
				let el = grid[i][j];

				// swap with above
				if (i > 0) {
					// only 2nd row and lower can do this
					let aboveEl = grid[i - 1][j];
					// try swap with above
					grid[i][j] = aboveEl;
					grid[i - 1][j] = el;
					if (Bejeweled.checkForMatches(grid).length > 0) {
						validMoves.push([i - 1, j, i, j]);
					}
					// revert
					grid[i][j] = el;
					grid[i - 1][j] = aboveEl;
				}

				// swap with left
				if (j > 0) {
					// only 2nd column and on the right can do this
					let leftEl = grid[i][j - 1];
					// try swap with left
					grid[i][j] = leftEl;
					grid[i][j - 1] = el;
					if (Bejeweled.checkForMatches(grid).length > 0) {
						validMoves.push([i, j - 1, i, j]);
					}
					// revert
					grid[i][j] = el;
					grid[i][j - 1] = leftEl;
				}
			}
		}
		return validMoves;
	}
}

module.exports = Bejeweled;
