// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];
var dictionary;

// Query Selectors
var inputs = document.querySelectorAll('input'); // these are each letter box in all rows
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var totalGamesDisplay = document.querySelector('#stats-total-games');
var statsPercentWon = document.querySelector('#stats-percent-correct');
var statsAvgGuesses = document.querySelector('#stats-average-guesses');
var gameOverBoxWin = document.querySelector('#game-over-section-win');
var gameOverBoxLose = document.querySelector('#game-over-section-lose');
var gameOverHeader = document.querySelector('#game-over-message');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');
var wordGiveaway = document.querySelector('.word-giveaway');

// Event Listeners
window.addEventListener('load', getRandomWord);

inputs.forEach(input => {
  input.addEventListener('keyup', function() { moveToNextInput(event) });
})

keyLetters.forEach(keyLetter => {
  keyLetter.addEventListener('click', function() { clickLetter(event) });
})

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions

const fetchData = fetch('http://localhost:3001/api/v1/words')
    .then(response => response.json())
    .then(wordArray => {
      dictionary = wordArray;
      return wordArray
    })
    .catch(error => alert("There was an error!"));
//promise.all makes everything wait till all the promises are resolved
//fetching from multiple data sets you'll be displaying on load

function setGame() {
  currentRow = 1;
  wordGiveaway.innerText = winningWord;
  updateInputPermissions();
  console.log(winningWord);
}

function getRandomWord() {
  fetchData.then((n) => {
    var randomIndex = Math.floor(Math.random() * n.length);
    winningWord = n[randomIndex];
    setGame()
  })
}

function updateInputPermissions() { //when game is set, loop thru input boxes and disable all except current row
  inputs.forEach(input => {
    if(!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true;
    } else {
      input.disabled = false;
    }
  })
  focusOnFirstBox();
}

function focusOnFirstBox() {
  const currentRowInputs = Array.from(inputs)
    .filter(inputBox => inputBox.id.includes(`-${currentRow}-`))
    .sort((a, b) => {
      a.id - b.id
    });
  currentRowInputs[0].focus();
}

function moveToNextInput(e) { //called on keyup for each letter box, seems to work BUT needs to go back if e.keycode =
  var key = e.keyCode || e.charCode; //charCode is deprecated, why's it still here?
  if( key !== 8 && key !== 46 ) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1
    inputs[indexOfNext].focus(); //doesn't know what to do at end of game
  }
}

function clickLetter(e) {
  var activeInput = inputs.find(input => {
    return input.id.includes(`-${currentRow}-`) && !input.value && !activeInput
  })
  var activeIndex = inputs.indexOf(activeInput);

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(function() {
        declareWinnerOrLoser('win')
      }, 1000);
    } else if (currentRow === 6) {
      setTimeout(function() {
        declareWinnerOrLoser('lose')
      }, 1000);
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  inputs.forEach(input => {
    if (input.id.includes(`-${currentRow}-`)) {
      guess += input.value
    }
  })
    return dictionary.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  guessLetters.forEach(guessLetter => {
    const index = guessLetters.indexOf(guessLetter);
    if (winningWord.includes(guessLetter) && winningWord.split('')[index] !== guessLetters[index]) {
      updateBoxColor(index, 'wrong-location');
      updateKeyColor(guessLetter, 'wrong-location-key');
    } else if (winningWord.split('')[index] === guessLetter) {
      updateBoxColor(index, 'correct-location');
      updateKeyColor(guessLetter, 'correct-location-key');
    } else {
      updateBoxColor(index, 'wrong');
      updateKeyColor(guessLetter, 'wrong-key');
    }
  })

}

function updateBoxColor(letterLocation, className) { //u, corr loc
  var row = Array
    .from(inputs)
    .filter(input => input.id.includes(`-${currentRow}-`));

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = Array
    .from(keyLetters)
    .find(keyLetter => keyLetter.innerText === letter);

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() { //updates currentrow, enables all except current row. Why does this stop working at row 4?
  currentRow++;
  updateInputPermissions();
}

function declareWinnerOrLoser(result) {
  recordGameStats(result);
  changeGameOverText();
  viewGameOverMessage(result);
  setTimeout(startNewGame, 4000);
}

function recordGameStats(result) {
  if (result === "win") {
    gamesPlayed.push({ solved: true, guesses: currentRow });
  } else {
    gamesPlayed.push({solved: false, guesses: currentRow });
  }
  updateStats();
}

function getAvgWinStats() {
  const totalWonGames = gamesPlayed.reduce((sum, gameObj) => {
    if(gameObj.solved) {
      sum ++
    }
    return sum;
  }, 0)
  statsPercentWon.innerText = (totalWonGames / gamesPlayed.length) * 100;
}

function getAvgNumGuesses() {
  const totalGuesses = gamesPlayed.reduce((sum, gameObj) => {
    if(gameObj.solved) {
      sum += gameObj.guesses;
    }
    return sum;
  }, 0)
  statsAvgGuesses.innerText = (totalGuesses / gamesPlayed.length)
}

function updateStats() {
  totalGamesDisplay.innerText = gamesPlayed.length;
  getAvgWinStats();
  getAvgNumGuesses();
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  getRandomWord();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct-location', 'wrong-location', 'wrong');
  })
}

function clearKey() {
  Array.from(keyLetters).forEach(keyLetter => {
    keyLetter.classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  })
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBoxLose.classList.add('collapsed')
  gameOverBoxWin.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage(result) {
  if (result === 'win') {
    gameOverBoxWin.classList.remove('collapsed')
    letterKey.classList.add('hidden');
    gameBoard.classList.add('collapsed');
  } else {
    gameOverBoxLose.classList.remove('collapsed')
    letterKey.classList.add('hidden');
    gameBoard.classList.add('collapsed');
  }
}
