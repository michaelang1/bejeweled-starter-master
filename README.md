# Bejeweled

In this project, you will create a command-line Bejeweled game. Unlike
previous projects, you will be start by implementing test specs in
`bejeweled-spec.js` for the game logic. Once these specs are in place, you can
implement the game logic in `bejeweled.js`.

To render the game, you have been given a `Screen` API that handles
command-line rendering. You do not need to understand how the code in `Screen`
works but you will need to make use of the commands provided. The API is
documented below. Try out the commands to see how they work.

To process keypresses, you will need to load `Command` objects into the Screen
API using `Screen.addCommand`. This function takes a `key` which triggers the
command, a string `description`, and an `action` callback which is executed
when `key` is pressed.

In order to swap items, you will need to add extra cursor controls: one to
select an item and one to execute the swap. You can only swap adjacent items.

## Bejeweled rules

Bejeweled is a game that requires you to match three of the same item in a row
either horizontally or vertically by swapping items. When you do this, the
matched items disappear and new items above it fall to fill the gaps.

Example:

```
 🥝 🍓 🥥 🍇 🍊 🍇 🥝 🍇 🍊
```

Swapping the middle `🍊` with the `🍇` below it will match three `🍇` in a row.

```
 🥝 🍓 🥥
         
 🥝 🍊 🍊
```

The `🍇`s disappear new items fall in from the top to fill in the blank spots.

```
 🥝 🍋 🍊 🥝 🍓 🥥 🥝 🍊 🍊
```

In this case, a new `🥝` fell down, triggering a combo.

```
    🍋 🍊 🍓 🥥 🍊 🍊
```

Again, new items fall in to replace the completed `🥝`s.

```
 🍓 🍋 🍊 🍇 🍓 🥥 🍋 🍊 🍊
```

There are no more matches, so the player can take their next turn.

## Running the game

1. Type `npm install` to install all packages
2. Run `node game.js` to run the game
3. Run `mocha` to run tests

## Tasks

1. Implement tests in `test/bejeweled-spec.js` matching the bejeweled game logic
2. Update tests in `test/cursor-spec.js` to handle selecting and swapping gems
3. Fill out game logic in `class/bejeweled.js` until `mocha
   test/bejeweled-spec.js` passes all tests
4. Update cursor logic in `class/cursor.js` until `mocha
   test/cursor-spec.js` passes all tests
5. Use `setBackgroundColor` and `resetBackgroundColor` in `cursor.js` to
   highlight the cursor's current position on the grid, with a visual
   signifier when the cursor is in a "swap" state
6. Create commands in `bejeweled.js` to select gems and execute swaps
7. Fill out the game state in `bejeweled.js` that checks for match-3s.
8. Chain the game state to check and alert the player for match combos.
9. Implement a score for the player based on matches and combos.

## Screen API

`Screen` is a static class with the following methods. You do not need to
modify this class at all. The functionality you will need is documented below.

### Initialize

* `Screen.initialize(numRows, numCols)` will initialize a grid with the given
  dimensions.

### Initialize

* `Screen.setGridlines(gridLines)` will insert lines between each grid element
  is `gridLines` is true, or hide them if `gridLines` is false.

### Commands

* `Screen.addCommand(key, description, action)` will add a command that calls
  the `action` callback anytime `key` is typed on the keyboard. `description`
  will be displayed in the help message.
* `Screen.printCommands()` will show a list of all loaded commands and their
  descriptions.

### Updating the grid

* `Screen.setGrid(row, col, char)` sets the character at `row` and `col` to
  the given `char`.
* `Screen.setTextColor(row, col, color)` sets the text color at `row` and
  `col` to the given `color`.
* `Screen.setBackgroundColor(row, col, color)` sets the background color at
  `row` and `col` to the given `color`.

Valid colors are:
  * black
  * red
  * green
  * yellow
  * blue
  * cyan
  * white
  * magenta

### Quitting

* `Screen.setQuitMessage(quitMessage)` sets a message to be printed when the
  user quits.
* `Screen.quit(showMessage=true)` quits the game and prints the message if
  `showMessage` is true.

### Rendering

* `Screen.render()` will update the display. This must be called anytime the
  grid or messages change.

### Displaying a message

* `Screen.setMessage(msg)` takes in a string to be printed below the grid each
  time it is rendered.

