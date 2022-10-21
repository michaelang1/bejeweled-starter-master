const { expect } = require('chai');

const Bejeweled = require('../class/bejeweled.js');
const Screen = require('../class/screen');

describe('Bejeweled', function () {
	let bejeweled;
	bejeweled = new Bejeweled();

	let grid = [
		['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
		['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
		['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
		['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
		['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
		['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
		['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
		['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
	];

	// Add tests for setting up a basic board
	it('should set up a 8 x 8 grid full of `random items', function () {
		// check board is full of items from the list
		isFullBoard = bejeweled.grid.every(row =>
			row.every(el => bejeweled.itemList.includes(el))
		);
		expect(isFullBoard).to.be.true;

		// check the number of unique items is between 2 and 7
		let uniqueItems = [];

		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				let el = bejeweled.grid[i][j];
				if (!uniqueItems.includes(el)) {
					uniqueItems.push(el);
				}
			}
		}

		expect(uniqueItems.length).to.be.above(1);
		expect(uniqueItems.length).to.be.below(8);
	});

	// add function to perform selection and swap using the same key depending on
	// where the player is at and the status of the game
	context('selectOrSwap', function () {
		beforeEach(function () {
			bejeweled.cursor.row = 1;
			bejeweled.cursor.col = 2;
		});

		// background color should be special after selecting and before swapping
		it('selected cell background stays blue after selecting', function () {
			bejeweled.selectOrSwap(false);

			expect(bejeweled.cursor.selectedRow).to.equal(1);
			expect(bejeweled.cursor.selectedCol).to.equal(2);

			expect(Screen.backgroundColors[1][2]).to.equal('\x1b[44m');

			bejeweled.cursor.up();
			expect(Screen.backgroundColors[1][2]).to.equal('\x1b[44m');

			bejeweled.cursor.down();
			expect(Screen.backgroundColors[1][2]).to.equal('\x1b[44m');

			bejeweled.cursor.left();
			expect(Screen.backgroundColors[1][2]).to.equal('\x1b[44m');

			bejeweled.cursor.right();
			expect(Screen.backgroundColors[1][2]).to.equal('\x1b[44m');
		});

		it('subsequent cursor background stays magenta before swapping', function () {
			bejeweled.cursor.up();
			expect(Screen.backgroundColors[0][2]).to.equal('\x1b[45m');

			bejeweled.cursor.right();
			expect(Screen.backgroundColors[0][3]).to.equal('\x1b[45m');

			bejeweled.cursor.down();
			expect(Screen.backgroundColors[1][3]).to.equal('\x1b[45m');

			bejeweled.cursor.right();
			expect(Screen.backgroundColors[1][4]).to.equal('\x1b[45m');
		});

		it('after a valid swap, blue and magenta highlights are removed', function () {
			bejeweled.grid = [
				['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', '🍋', '🍉', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', 'C2', '🍋', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', '🍋', 'E3', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];
			bejeweled.cursor.right();
			bejeweled.selectOrSwap(false);

			expect(Screen.backgroundColors[1][2]).to.equal('\x1b[40m');
			expect(Screen.backgroundColors[1][3]).to.equal('\x1b[43m');
		});

		it('should allow adjacent items to be swapped', function () {
			bejeweled.grid = [
				['A0', 'B0', '🍇', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', '🍉', 'D1', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', '🍉', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', '🍋', '🍉', 'E3', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			bejeweled.cursor.down();
			bejeweled.cursor.down();
			bejeweled.selectOrSwap(false);
			bejeweled.cursor.right();
			bejeweled.selectOrSwap(false);
			expect(bejeweled.grid[3][3]).to.equal('🍋');
			// set setTimeouts as inactive, ie. delay = false
			// so that remove & drop will take place before expect assertion
			expect(bejeweled.grid[3][2]).to.equal('🍇');
		});

		it('should not allow non-adjacent items to be swapped and will select new item instead', function () {
			bejeweled.grid = [
				['A0', '🍉', '🍉', '🍉', 'E0', 'F0', 'G0', 'H0'],
				['A1', '🍉', '🍋', '🍉', 'E1', 'F1', 'G1', 'H1'],
				['A2', '🍉', '🍉', '🍉', '🍉', '🍉', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			bejeweled.selectOrSwap(false);
			bejeweled.cursor.right();
			bejeweled.cursor.up();
			bejeweled.selectOrSwap(false);
			expect(bejeweled.grid[1][2]).to.equal('🍋');
			expect(bejeweled.grid[0][3]).to.equal('🍉');

			expect(bejeweled.cursor.selectedRow).to.equal(0);
			expect(bejeweled.cursor.selectedCol).to.equal(3);

			expect(Screen.backgroundColors[1][2]).to.equal('\x1b[40m');
			expect(Screen.backgroundColors[0][3]).to.equal('\x1b[44m');
		});

		// Add tests for swaps that set up combos
		//! for this test to work, must disable setTimeouts delays
		it('should remove combos if they are created after a valid swap', function () {
			bejeweled.comboTimes = 0;
			bejeweled.grid = [
				['A0', 'B0', '🥥', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['🥥', '🥥', '🍉', '🍋', '🍋', 'F1', 'G1', 'H1'],
				['A2', 'B2', '🍋', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];
			bejeweled.selectOrSwap(false);
			bejeweled.cursor.down();
			bejeweled.selectOrSwap(false);

			expect(bejeweled.comboTimes).to.be.above(0);
		});

		it('should remove combos if they are created after a valid swap', function () {
			bejeweled.comboTimes = 0;
			bejeweled.grid = [
				['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', '🍉', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', '🥥', 'D3', 'E3', 'F3', 'G3', 'H3'],
				['🥥', '🥥', '🍉', '🍋', '🍋', 'F4', 'G4', 'H4'],
				['A5', 'B5', '🍋', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', '🍉', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			bejeweled.cursor.row = 4;
			bejeweled.cursor.col = 2;
			bejeweled.selectOrSwap(false);
			bejeweled.cursor.down();
			bejeweled.selectOrSwap(false);

			expect(bejeweled.comboTimes).to.be.above(1);
		});
	});

	// add function to remove matches
	context('removeMatches', function () {
		it('should change all matched items to   ', function () {
			bejeweled.grid = [
				['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', '🍋', '🍋', '🍋', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', 'C2', '🍋', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', '🍋', '🍋', '🍋', 'G3', 'H3'],
				['A4', 'B4', 'C4', '🍋', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', '🍋', '🍋', '🍋', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];
			bejeweled.matches = Bejeweled.checkForMatches(bejeweled.grid);
			let amountRemoved = bejeweled.removeMatches();
			let gridExpected = [
				['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', '  ', '  ', '  ', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', 'C2', '  ', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', '  ', '  ', '  ', 'G3', 'H3'],
				['A4', 'B4', 'C4', '  ', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', '  ', '  ', '  ', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			expect(bejeweled.grid).to.deep.equal(gridExpected);
			expect(amountRemoved).to.equal(11);
		});
	});

	// Add tests for dropping items down after removal
	context('dropItems', function () {
		it('should drop the nearest item above down', function () {
			bejeweled.grid = [
				['A0', '🍉', '🍉', '🍉', 'E0', 'F0', 'G0', 'H0'],
				['A1', '🍋', '🍋', '🍉', 'E1', 'F1', 'G1', 'H1'],
				['A2', '  ', '  ', '🍋', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', '  ', 'E3', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', '  ', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			bejeweled.dropItems();
			expect(bejeweled.grid[2][1]).to.equal('🍋');
			expect(bejeweled.grid[2][2]).to.equal('🍋');
			expect(bejeweled.grid[4][3]).to.equal('🍋');
			expect(bejeweled.grid[1][1]).to.equal('🍉');
			expect(bejeweled.grid[1][2]).to.equal('🍉');
			expect(bejeweled.grid[3][3]).to.equal('🍉');
			expect(bejeweled.grid[2][3]).to.equal('🍉');
		});
	});

	// Add tests for a valid swap that matches >= 3
	context('checkForMatches(grid)', function () {
		let matches;
		let matchesExpected;

		it('it should find matches when at least 3 same items are adjacent in a row', function () {
			grid = [
				['🍋', '🍋', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', 'C2', '🍋', '🍋', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', 'F4', '🍋', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			matches = Bejeweled.checkForMatches(grid);
			expect(matches.length).to.equal(0);

			grid = [
				['A0', 'B0', '🍋', '🍋', '🍋', 'F0', 'G0', 'H0'],
				['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', '🍋', '🍋', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			matches = Bejeweled.checkForMatches(grid);
			matchesExpected = [
				[
					{ item: '🍋', row: 0, col: 2 },
					{ item: '🍋', row: 0, col: 3 },
					{ item: '🍋', row: 0, col: 4 },
				],
			];
			expect(matches).to.deep.equal(matchesExpected);

			grid = [
				['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['🍋', '🍋', '🍋', 'D1', 'E1', 'F1', '🍋', 'H1'],
				['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
				['A4', 'B4', '🍋', '🍋', '🍋', '🍋', '🍋', '🍋'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			matches = Bejeweled.checkForMatches(grid);
			matchesExpected = [
				[
					{ item: '🍋', row: 1, col: 0 },
					{ item: '🍋', row: 1, col: 1 },
					{ item: '🍋', row: 1, col: 2 },
				],
				[
					{ item: '🍋', row: 4, col: 2 },
					{ item: '🍋', row: 4, col: 3 },
					{ item: '🍋', row: 4, col: 4 },
					{ item: '🍋', row: 4, col: 5 },
					{ item: '🍋', row: 4, col: 6 },
					{ item: '🍋', row: 4, col: 7 },
				],
			];
			expect(matches).to.deep.equal(matchesExpected);
		});

		it('it should find matches when at least 3 same items are adjacent in a column', function () {
			grid = [
				['🍋', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['🍋', 'B1', 'C1', 'D1', '🍋', 'F1', 'G1', 'H1'],
				['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', 'E3', '🍋', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', '🍋', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			matches = Bejeweled.checkForMatches(grid);
			expect(matches.length).to.equal(0);

			grid = [
				['A0', 'B0', '🍋', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', '🍋', 'D1', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', '🍋', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', '🍋', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', '🍋', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			matches = Bejeweled.checkForMatches(grid);
			matchesExpected = [
				[
					{ item: '🍋', row: 0, col: 2 },
					{ item: '🍋', row: 1, col: 2 },
					{ item: '🍋', row: 2, col: 2 },
				],
			];
			expect(matches).to.deep.equal(matchesExpected);

			grid = [
				['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', 'C1', 'D1', 'E1', 'F1', '🍋', 'H1'],
				['🍋', 'B2', 'C2', 'D2', 'E2', '🍋', 'G2', 'H2'],
				['🍋', 'B3', 'C3', 'D3', 'E3', '🍋', 'G3', 'H3'],
				['🍋', 'B4', 'C4', 'D4', 'E4', '🍋', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', '🍋', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', '🍋', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', '🍋', 'G7', 'H7'],
			];

			matches = Bejeweled.checkForMatches(grid);
			matchesExpected = [
				[
					{ item: '🍋', row: 2, col: 0 },
					{ item: '🍋', row: 3, col: 0 },
					{ item: '🍋', row: 4, col: 0 },
				],
				[
					{ item: '🍋', row: 2, col: 5 },
					{ item: '🍋', row: 3, col: 5 },
					{ item: '🍋', row: 4, col: 5 },
					{ item: '🍋', row: 5, col: 5 },
					{ item: '🍋', row: 6, col: 5 },
					{ item: '🍋', row: 7, col: 5 },
				],
			];
			expect(matches).to.deep.equal(matchesExpected);
		});

		it('it should find matches when at least 3 same items are adjacent in a row or column', function () {
			grid = [
				['A0', '🍋', '🍋', '🍋', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', 'C1', '🍋', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', 'C2', '🍋', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', 'E3', '🍋', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', 'E4', '🍋', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', '🍋', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', '🍋', 'G6', 'H6'],
				['🍋', '🍋', '🍋', 'D7', 'E7', '🍋', 'G7', 'H7'],
			];
			matches = Bejeweled.checkForMatches(grid);
			matchesExpected = [
				[
					{ item: '🍋', row: 0, col: 1 },
					{ item: '🍋', row: 0, col: 2 },
					{ item: '🍋', row: 0, col: 3 },
				],
				[
					{ item: '🍋', row: 7, col: 0 },
					{ item: '🍋', row: 7, col: 1 },
					{ item: '🍋', row: 7, col: 2 },
				],
				[
					{ item: '🍋', row: 0, col: 3 },
					{ item: '🍋', row: 1, col: 3 },
					{ item: '🍋', row: 2, col: 3 },
				],
				[
					{ item: '🍋', row: 3, col: 5 },
					{ item: '🍋', row: 4, col: 5 },
					{ item: '🍋', row: 5, col: 5 },
					{ item: '🍋', row: 6, col: 5 },
					{ item: '🍋', row: 7, col: 5 },
				],
			];
			expect(matches).to.deep.equal(matchesExpected);
		});
	});

	// Add tests to check if there are no possible valid moves
	context('checkValidMoves(grid)', function () {
		it('should return the valid moves', function () {
			grid = [
				['A0', '🍋', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', '🍋', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
				['🍋', '🍉', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', '🍋', '🍉', '🍋', 'H3'],
				['A4', 'B4', 'C4', 'D4', '🍋', '🍋', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			let validMoves = Bejeweled.checkValidMoves(grid);
			let validMovesExpected = [
				[2, 0, 2, 1],
				[3, 5, 4, 5],
				[3, 6, 4, 6],
			];
			expect(validMoves).to.deep.equal(validMovesExpected);

			grid = [
				['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
				['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
				['A2', 'B2', '🍋', '🍋', '🍉', '🍋', 'G2', 'H2'],
				['A3', 'B3', 'C3', 'D3', '🍋', 'F3', 'G3', 'H3'],
				['A4', 'B4', 'C4', 'D4', '🍋', 'F4', 'G4', 'H4'],
				['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
				['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
				['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
			];

			validMoves = Bejeweled.checkValidMoves(grid);
			validMovesExpected = [
				[2, 3, 2, 4],
				[2, 4, 2, 5],
				[2, 4, 3, 4],
			];
			expect(validMoves).to.deep.equal(validMovesExpected);
		});

		grid = [
			['🍉', '🍋', '🍋', 'D0', 'E0', 'F0', 'G0', 'H0'],
			['🍋', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
			['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
			['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
			['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
			['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
			['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
			['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
		];

		validMoves = Bejeweled.checkValidMoves(grid);
		validMovesExpected = [[0, 0, 1, 0]];
		expect(validMoves).to.deep.equal(validMovesExpected);

		grid = [
			['🍉', '🍋', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0'],
			['🍋', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
			['🍋', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
			['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
			['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
			['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
			['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
			['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'],
		];

		validMoves = Bejeweled.checkValidMoves(grid);
		validMovesExpected = [[0, 0, 0, 1]];
		expect(validMoves).to.deep.equal(validMovesExpected);
	});
});
