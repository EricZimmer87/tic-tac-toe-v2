class GameBoard {
    constructor() {
        this.boardContainer = document.createElement("div");
        this.squareArray = this.createGameBoard();
        this.singlePlayer = false;
    }

    createGameBoard() {
        this.boardContainer.className = "board-container";
        document.body.appendChild(this.boardContainer);
        const squareArray = [];

        for (let i = 0; i < 3; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                const square = Square.createSquare();
                this.boardContainer.appendChild(square);
                square.id = `square${i * 3 + j}`;

                // Add Event Listener to each square
                square.addEventListener("click", () => Square.squareClickHandler(square, square.id));

                // Put square into row
                row.push(square);
            }
            // Put row into squareArray
            squareArray.push(row);
        }
        return squareArray;
    }
}


class Square {
    static count = 0;

    static createSquare() {
        const square = document.createElement("div");
        square.className = "square";
        return square;
    }

    // Controls what happens when a square is clicked
    static squareClickHandler(square, squareId) {
        if (!gameBoard.singlePlayer) {
            Square.twoPlayer(square);
        } else {
            Square.singlePlayer(square);
        }
    }

    static twoPlayer(square) {
        try {
            if (Victory.victory == true) {
                return;
            }
            Player.placeSymbol(square);
            if (Victory.checkVictory(square)) {
                return;
            }
            Player.swapTurns();
            Message.updateMessage()
            Square.count++
            Victory.checkCatGame();
        } catch (error) {
            console.log(error.message);
        }
    }

    static singlePlayer(square) {
        try {
            if (Victory.victory == true) {
                return;
            }
            if (player1.turn) {
                Player.placeSymbol(square);
                if (Victory.checkVictory(square)) {
                    return;
                }
                Player.swapTurns();
                Message.updateMessage();
                Square.count++;
                Victory.checkCatGame();
                if (Victory.victory == true) {
                    return;
                }
                setTimeout(() => {
                    CPU.cpuTurn();
                }, 500);
            }
        } catch (error) {
            console.log(error.message);
        }
    }
}

class Player {
    constructor(score) {
        this.score = score;
        this.name = "";
        this.symbol = "";
        this.turn = false;
    }

    static submitPlayer1(e, boardContainer) {
        e.preventDefault();
        let player1Name = document.getElementById("player1-name").value;
        if (player1Name == null || player1Name == "") {
            player1.name = "Player 1";
        } else {
            player1.name = player1Name;
        }
        const player1XCheckbox = document.getElementById("player1-x").checked;

        player1.symbol = player1XCheckbox ? "X" : "O";
        player1.turn = true;

        // Hide Player 1 form, show Player 2 form
        const player1Form = document.getElementById("player1-form");
        player1Form.style.display = "none";

        // Check for two player
        if (!gameBoard.singlePlayer) {
            const player2Form = document.getElementById("player2-form");
            player2Form.style.display = "block";
        } else {
            player2.name = "CPU";
            player2.turn = false;

            if (player1.symbol === "X") {
                player2.symbol = "O";
            } else {
                player2.symbol = "X";
            }

            // Display the game board after entering player info
            boardContainer.style.display = "grid";

            Message.updateMessage();
            Message.updateScoreMessage();
        }
    }

    static submitPlayer2(e, boardContainer) {
        e.preventDefault();
        let player2Name = document.getElementById("player2-name").value;
        if (player2Name == null || player2Name == "") {
            player2.name = "Player 2";
        } else {
            player2.name = player2Name;
        }
        player2.turn = false;

        // Hide Player 2 form
        const player2Form = document.getElementById("player2-form");
        player2Form.style.display = "none";

        if (player1.symbol === "X") {
            player2.symbol = "O";
        } else {
            player2.symbol = "X";
        }

        // Display the game board after entering player info
        boardContainer.style.display = "grid";

        Message.updateMessage();
        Message.updateScoreMessage();
    }

    static swapTurns() {
        if (player1.turn == true) {
            player1.turn = false;
            player2.turn = true;
        } else if (player2.turn == true) {
            player2.turn = false;
            player1.turn = true;
        }
    }

    static placeSymbol(square) {
        if (!gameBoard.singlePlayer) {
            if (square.textContent == player1.symbol || square.textContent == player2.symbol) {
                throw new Error("Symbol already placed in this square.");
            } else if (player1.turn == true) {
                square.textContent = player1.symbol;
            } else if (player2.turn == true) {
                square.textContent = player2.symbol;
            }
            return;
        }
        if (gameBoard.singlePlayer) {
            if (square.textContent == player1.symbol || square.textContent == player2.symbol) {
                throw new Error("Symbol already placed in this square.");
            } else {
                square.textContent = player1.symbol;
                CPU.makeSquareNull(square);
            }
            return;
        }
    }

    getScore() {
        return this.score;
    }
    incrementScore() {
        this.score++;
    }
    resetScore() {
        this.score = 0;
    }

}

class Victory {
    static victory = false;

    static createVictoryMessage() {
        gameBoard.boardContainer.classList.add("victory-board");
        const victoryMessage = document.createElement("div");
        victoryMessage.id = "victory-message";
        gameBoard.boardContainer.appendChild(victoryMessage);
        return victoryMessage;
    }

    static createPlayer1VictoryMessage() {
        const victoryMessage = Victory.createVictoryMessage();
        victoryMessage.textContent = `${player1.name} wins!`;
        Victory.victory = true;
    }

    static createPlayer2VictoryMessage() {
        const victoryMessage = Victory.createVictoryMessage();
        victoryMessage.textContent = `${player2.name} wins!`;
        Victory.victory = true;
    }

    static checkCatGame() {
        if (Square.count >= 9) {
            const victoryMessage = Victory.createVictoryMessage();
            victoryMessage.textContent = `${cat.name} wins!`;
            cat.score++;
            Message.updateScoreMessage();
            Victory.victory = true;
        }
    }

    static findIndicesOfSquare(square) {
        const squares = gameBoard.squareArray;
        for (let i = 0; i < squares.length; i++) {
            const row = squares[i];
            const columnIndex = row.indexOf(square);

            if (columnIndex !== -1) {
                return { row: i, column: columnIndex };
            }
        }
    }

    static checkVictory(square) {
        const squares = gameBoard.squareArray;
        // Find indices of clicked square
        const squareIndices = Victory.findIndicesOfSquare(square);
        const row = squareIndices.row;
        const col = squareIndices.column;
        const symbol = squares[row][col].textContent;

        function checkVictoryInDirection(rowD1, colD1, rowD2, colD2) {
            // Check for squares being in bounds
            if (row + rowD1 >= 0 && row + rowD1 <= 2 &&
                col + colD1 >= 0 && col + colD1 <= 2 &&
                row + rowD2 >= 0 && row + rowD2 <= 2 &&
                col + colD2 >= 0 && col + colD2 <= 2) {
                // Check the two inputted directions
                if (symbol == squares[row + rowD1][col + colD1].textContent &&
                    symbol == squares[row + rowD2][col + colD2].textContent) {
                    // Determine which player won
                    if (symbol == player1.symbol) {
                        Victory.createPlayer1VictoryMessage();
                        // Add winning style
                        squares[row][col].classList.add("winning-square");
                        squares[row + rowD1][col + colD1].classList.add("winning-square");
                        squares[row + rowD2][col + colD2].classList.add("winning-square");
                        player1.incrementScore();
                        Message.updateScoreMessage();
                        return true;
                    } else {
                        Victory.createPlayer2VictoryMessage();
                        // Add winning style
                        squares[row][col].classList.add("winning-square");
                        squares[row + rowD1][col + colD1].classList.add("winning-square");
                        squares[row + rowD2][col + colD2].classList.add("winning-square");
                        player2.incrementScore();
                        Message.updateScoreMessage();
                        return true;
                    }
                }
                return false;
            }
            return false;
        }

        if (
            // Check vertical victory
            checkVictoryInDirection(1, 0, -1, 0) || // One up, one down
            checkVictoryInDirection(1, 0, 2, 0) || // Down
            checkVictoryInDirection(-1, 0, -2, 0) || // Up
            // Check horizontal victory
            checkVictoryInDirection(0, 1, 0, -1) || // Left one, right one
            checkVictoryInDirection(0, 1, 0, 2) || // Two right
            checkVictoryInDirection(0, -1, 0, -2) || // Two left
            // Check diagonal, bottom left to top right
            checkVictoryInDirection(-1, 1, 1, -1) || // One up and right, one down and left 
            checkVictoryInDirection(-1, 1, -2, 2) || // Going up
            checkVictoryInDirection(1, -1, 2, -2) || // Going down
            // Check diagonal, top left to bottom right
            checkVictoryInDirection(-1, -1, 1, 1) || // One up and left, one down and right
            checkVictoryInDirection(-1, -1, -2, -2) || // Going up
            checkVictoryInDirection(1, 1, 2, 2) // Going down
        ) {
            return true;
        } else {
            return false;
        }
    }
}

class Message {
    static updateMessage() {
        // Show the message and display who's turn it is
        const messageContainer = document.getElementById("message-container");
        messageContainer.style.display = "block";
        const message = document.getElementById("message");
        if (player1.turn == true) {
            message.textContent = `${player1.name}'s turn. (${player1.symbol})`;
        }
        if (player2.turn == true) {
            message.textContent = `${player2.name}'s turn. (${player2.symbol})`;
        }
    }

    static updateScoreMessage() {
        let scoreMessage = document.getElementById("score-message");
        if (scoreMessage) {
            scoreMessage.remove();
        }
        const newScoreMessage = document.createElement("div");
        newScoreMessage.id = "score-message";
        let player1Score = player1.getScore();
        let player2Score = player2.getScore();
        let catScore = cat.getScore();
        newScoreMessage.innerHTML = `${player1.name} wins: ${player1Score}<br>
        ${player2.name} wins: ${player2Score}<br>
        Cat wins: ${catScore}`;
        reset.buttonContainer.appendChild(newScoreMessage);
    }
}

class CheckBoxSymbolHandler {
    constructor() {
        // Initialize instance properties
        this.checkBoxX = document.getElementById("player1-x");
        this.checkBoxO = document.getElementById("player1-o");

        // Add event listeners to handle checkbox changes
        this.checkBoxX.addEventListener("change", this.handleCheckBoxX.bind(this));
        this.checkBoxO.addEventListener("change", this.handleCheckBoxO.bind(this));
    }

    handleCheckBoxX() {
        if (this.checkBoxO.checked) {
            this.checkBoxX.checked = true;
            this.checkBoxO.checked = false;
        }
        if (!this.checkBoxO.checked) {
            this.checkBoxX.checked = true;
        }
    }

    handleCheckBoxO() {
        if (this.checkBoxX.checked) {
            this.checkBoxO.checked = true;
            this.checkBoxX.checked = false;
        }
        if (!this.checkBoxX.checked) {
            this.checkBoxO.checked = true;
        }
    }
}

class Reset {
    constructor() {
        this.buttonContainer = this.createNewGameButton();

    }
    createNewGameButton() {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "new-game-button-container";
        const newGameButton = document.createElement("button");
        newGameButton.id = "new-game-button";
        newGameButton.classList.add("button");
        newGameButton.textContent = "New Game";
        buttonContainer.appendChild(newGameButton);
        newGameButton.addEventListener("click", this.newGame);
        return buttonContainer;
    }

    newGame() {
        Victory.victory = false;
        Reset.clearBoard();
        Reset.clearVictoryMessage();
        Square.count = 0;
        // Reset the turn and update message
        let player1Score = player1.getScore();
        let player2Score = player2.getScore();
        let catScore = cat.getScore();
        if ((player1Score + player2Score + catScore) % 2 == 0) {
            player1.turn = true;
            player2.turn = false;
            Message.updateMessage();
        } else {
            player1.turn = false;
            player2.turn = true;
            Message.updateMessage();
        }
        gameBoard.boardContainer.classList.remove("victory-board");
        Reset.clearWinningSquareClass();
        // Reset squarePool array
        CPU.squarePool = CPU.createSquarePoolArray();
        // CPU goes first in single player mode
        if (gameBoard.singlePlayer == true && player2.turn == true) {
            CPU.cpuTurn();
        }
    }

    static clearBoard() {
        for (let i = 0; i < gameBoard.squareArray.length; i++) {
            for (let j = 0; j < gameBoard.squareArray[0].length; j++) {
                gameBoard.squareArray[i][j].textContent = "";
            }
        }
    }

    static clearWinningSquareClass() {
        const squares = gameBoard.squareArray;

        for (let i = 0; i < squares.length; i++) {
            for (let j = 0; j < squares[0].length; j++) {
                squares[i][j].classList.remove("winning-square");
            }
        }
    }

    static clearVictoryMessage() {
        const victoryMessage = document.getElementById("victory-message");

        // Check if the element exists before attempting to remove it
        if (victoryMessage) {
            // Remove all child nodes one by one
            while (victoryMessage.firstChild) {
                victoryMessage.removeChild(victoryMessage.firstChild);
            }
            // Remove the element itself
            victoryMessage.remove();
        }
    }

}

class PlayerMode {
    static singlePlayerButtonClick() {
        gameBoard.singlePlayer = true;
        const playerModeContainer = document.getElementById("player-mode-container");
        playerModeContainer.style.display = "none";
        const player1Form = document.getElementById("player1-form");
        player1Form.style.display = "block";
    }

    static twoPlayerButtonClick() {
        const playerModeContainer = document.getElementById("player-mode-container");
        playerModeContainer.style.display = "none";
        const player1Form = document.getElementById("player1-form");
        player1Form.style.display = "block";
    }
}

class CPU {
    static squarePool = CPU.createSquarePoolArray();

    static createSquarePoolArray() {
        const squarePool = [];

        // Outer loop for rows
        for (let i = 0; i < 3; i++) {
            // Initialize an empty row
            const row = [];

            // Inner loop for columns
            for (let j = 0; j < 3; j++) {
                // Add 1 to the row for each column
                row.push(1);
            }

            // Add the row to the 2D array
            squarePool.push(row);
        }
        return squarePool;
    }

    // What happens when CPU takes its turn
    static cpuTurn() {
        // Check if CPU can win from two in a row
        const winThirdDivElement = CPU.twoInARow(player2.symbol);
        if (winThirdDivElement == null) {
            // CPU cannot win from two in a row
            // Check if CPU has two in a row to block
            const blockThirdDivElement = CPU.twoInARow(player1.symbol)
            if (blockThirdDivElement == null) {
                // CPU cannot win or block from two in a row
                // Pick a random square
                const randomSquare = CPU.selectRandomSquare();
                randomSquare.textContent = player2.symbol;
                if (Victory.checkVictory(randomSquare)) {
                    return;
                }
            } else {
                // CPU can block two in a row
                blockThirdDivElement.textContent = player2.symbol;
                if (Victory.checkVictory(blockThirdDivElement)) {
                    return;
                }
            }
        } else {
            // CPU can win from two in a row
            winThirdDivElement.textContent = player2.symbol;
            if (Victory.checkVictory(winThirdDivElement)) {
                return;
            }
        }
        Player.swapTurns();
        Message.updateMessage();
        Square.count++;
        Victory.checkCatGame();
    }

    static makeSquareNull(square) {
        const squareIndices = Victory.findIndicesOfSquare(square);
        CPU.squarePool[squareIndices.row][squareIndices.column] = null;
    }

    static selectRandomSquare() {

        // Assuming squarePool is your 2D array
        const flattenedArray = CPU.squarePool.flat();

        // Filter out null values
        const indicesWithOne = flattenedArray.reduce((acc, value, index) => {
            if (value === 1) {
                acc.push(index);
            }
            return acc;
        }, []);

        // Check if there are indices with 1
        if (indicesWithOne.length > 0) {
            // Randomly select an index with 1
            const randomIndex = indicesWithOne[Math.floor(Math.random() * indicesWithOne.length)];

            const numRows = 3;   // Number of rows in the 2D array
            const numCols = 3;   // Number of columns in the 2D array

            // Convert flat index to 2D array index
            const row = Math.floor(randomIndex / numCols);
            const col = randomIndex % numCols;

            const randomDivElement = gameBoard.squareArray[row][col];
            // Make the square null in the squarePool array
            CPU.squarePool[row][col] = null;
            return randomDivElement;
        } else {
            console.log("No indices with 1 available.");
        }
    }

    // TODO have CPU check for two in a row and block it
    static twoInARow(checkSymbol) {
        const squares = gameBoard.squareArray;
        // Check vertical
        for (let col = 0; col < squares[0].length; col++) {
            // Check top two
            if (squares[0][col].textContent == checkSymbol && squares[1][col].textContent == checkSymbol && squares[2][col].textContent == "") {
                const thirdDivElement = gameBoard.squareArray[2][col];
                CPU.squarePool[2][col] = null;
                return thirdDivElement;
            }
            // Check bottom two
            if (squares[2][col].textContent == checkSymbol && squares[1][col].textContent == checkSymbol && squares[0][col].textContent == "") {
                const thirdDivElement = gameBoard.squareArray[0][col];
                CPU.squarePool[0][col] = null;
                return thirdDivElement;
            }
            // Check top one & bottom one
            if (squares[0][col].textContent == checkSymbol && squares[2][col].textContent == checkSymbol && squares[1][col].textContent == "") {
                const thirdDivElement = gameBoard.squareArray[1][col];
                CPU.squarePool[1][col] = null;
                return thirdDivElement;
            }
        }

        // Check horizontal
        for (let row = 0; row < squares.length; row++) {
            // Check left two
            if (squares[row][0].textContent == checkSymbol && squares[row][1].textContent == checkSymbol && squares[row][2].textContent == "") {
                const thirdDivElement = gameBoard.squareArray[row][2];
                CPU.squarePool[row][2] = null;
                return thirdDivElement;
            }
            // Check right two
            if (squares[row][2].textContent == checkSymbol && squares[row][1].textContent == checkSymbol && squares[row][0].textContent == "") {
                const thirdDivElement = gameBoard.squareArray[row][0];
                CPU.squarePool[row][0] = null;
                return thirdDivElement;
            }
            // Check left one & right one
            if (squares[row][0].textContent == checkSymbol && squares[row][2].textContent == checkSymbol && squares[row][1].textContent == "") {
                const thirdDivElement = gameBoard.squareArray[row][1];
                CPU.squarePool[row][1] = null;
                return thirdDivElement;
            }
        }

        // Check diagonal, bottom left to top right
        // Check bottom/left two
        if (squares[2][0].textContent == checkSymbol &&
            squares[1][1].textContent == checkSymbol &&
            squares[0][2].textContent == "") {
            const thirdDivElement = gameBoard.squareArray[0][2];
            CPU.squarePool[0][2] = null;
            return thirdDivElement;
        }
        // Check top/right two
        if (squares[0][2].textContent == checkSymbol &&
            squares[1][1].textContent == checkSymbol &&
            squares[2][0].textContent == "") {
            const thirdDivElement = gameBoard.squareArray[2][0];
            CPU.squarePool[2][0] = null;
            return thirdDivElement;
        }
        // Check one bottom/left & one top/right
        if (squares[0][2].textContent == checkSymbol &&
            squares[2][0].textContent == checkSymbol &&
            squares[1][1].textContent == "") {
            const thirdDivElement = gameBoard.squareArray[1][1];
            CPU.squarePool[1][1] = null;
            return thirdDivElement;
        }

        //Check diagonal, top left to bottom right
        // Check top/left two
        if (squares[0][0].textContent == checkSymbol &&
            squares[1][1].textContent == checkSymbol &&
            squares[2][2].textContent == "") {
            const thirdDivElement = gameBoard.squareArray[2][2];
            CPU.squarePool[2][2] = null;
            return thirdDivElement;
        }
        // Check bottom/right two
        if (squares[2][2].textContent == checkSymbol &&
            squares[1][1].textContent == checkSymbol &&
            squares[0][0].textContent == "") {
            const thirdDivElement = gameBoard.squareArray[0][0];
            CPU.squarePool[0][0] = null;
            return thirdDivElement;
        }
        // Check one top/left & one bottom/right
        if (squares[0][0].textContent == checkSymbol &&
            squares[2][2].textContent == checkSymbol &&
            squares[1][1].textContent == "") {
            const thirdDivElement = gameBoard.squareArray[1][1];
            CPU.squarePool[1][1] = null;
            return thirdDivElement;
        }

        // There aren't two in a row
        return null;
    }
}

/////////////////////////////
/////                   /////
/////   Global Scope    /////
/////                  //////
/////////////////////////////

// Add event listener to single player button
document.getElementById("single-player-button").addEventListener("click", PlayerMode.singlePlayerButtonClick);
// Add event listener to two player button
document.getElementById("two-player-button").addEventListener("click", PlayerMode.twoPlayerButtonClick);

// Create a new gameboard, start with it hidden
const gameBoard = new GameBoard;
gameBoard.boardContainer.style.display = "none";

// Create new game button, append to gameboard
const reset = new Reset;
gameBoard.boardContainer.appendChild(reset.buttonContainer);

// Create player objects
const player1 = new Player(0);
const player2 = new Player(0);
const cat = new Player(0);
cat.name = "Cat";

// Handle the player form submit buttons
document.getElementById("player1-submit-button").addEventListener("click", (e) => Player.submitPlayer1(e, gameBoard.boardContainer));
document.getElementById("player2-submit-button").addEventListener("click", (e) => Player.submitPlayer2(e, gameBoard.boardContainer));

// Instantiate the CheckBoxSymbolHandler class
const checkBoxHandler = new CheckBoxSymbolHandler();