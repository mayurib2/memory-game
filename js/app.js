/* Variable declarations */

let gameTime = 0;
let firstClick = true;
let gameStart;
let hr = 0;
let min = 0;
let secs = 0;
let shuffledCards = [];

/* Using javascript closures */
let updateMoves =(() => {
                let noOfMoves = 0;
                return () => {  noOfMoves++ ;
                                return noOfMoves;
                              }
                        }
                  )();
let updatePairs =(() => {
                let pair = 0;
                return () => {  pair+=1 ;
                                return pair;
                              }
                        }
                  )();
/*
* Create a list that holds all of your cards
*/
let cards = ["fa-diamond", "fa-diamond",
"fa-paper-plane-o","fa-paper-plane-o",
"fa-anchor","fa-anchor","fa-bolt",
"fa-bolt","fa-cube","fa-cube","fa-leaf",
"fa-leaf","fa-bicycle","fa-bicycle","fa-bomb",
"fa-bomb"];

/*
* Display the cards on the page
*   - shuffle the list of cards using the provided "shuffle" method below
*   - loop through each card and create its HTML
*   - add each card's HTML to the page
*/

initialize();

function initialize() {
  /* Cards are shuffled using a shuffle function */
  shuffledCards = shuffle(cards);
  createGameDeck();
  start();
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function createGameDeck() {
  // create a fragment for performance optimization
  const fragment = document.createDocumentFragment();
  shuffledCards.forEach((card) => {
    const newElement = document.createElement("li");
    newElement.classList.add("card");
    const childElement = document.createElement("i");
    childElement.classList.add("fa");
    childElement.classList.add(card);
    newElement.appendChild(childElement);
    fragment.appendChild(newElement);
  })
  const deckOfCards = document.querySelector('.deck');
  deckOfCards.appendChild(fragment);
}

function start() {
  /*
      Create an event listener for clicking of a card
      Event Delegation used by adding event listener
      to parent node of all the cards, i.e. deck

   */
  let openCardList = [];
  const gameDeck = document.querySelector('.deck');
  gameDeck.addEventListener('click', () => {
    cardClicked(event.target,openCardList);
    }
  );
}



// When card is clicked, display the card's symbol
function cardClicked (target, openCardList) {
  // Increment move counter after every click on card
  const userMoves = updateMoves();
  let stars = 0;
  // Update Star rating
  stars = starRating(userMoves);

  // Start game timer on first click only
  if(firstClick){
    startTimer();
    firstClick = false;
  }

  if(target && target.matches("li.card")){
      // toggle class lists to flip card open
      target.classList.toggle('open');
      target.classList.toggle('show');
      // Prevent user from selecting same card twice
      target.classList.add('disable');
      // Update move counter
      document.querySelector('.moves').innerHTML = userMoves;
      if(target.classList.contains("open") && target.classList.contains("show")) {
      // Keep checking for two cards in openCardList to compare
      setInterval(() => { if(openCardList.length < 2) clearInterval})
      // Add this card to the cards compare array openCardList
      addCard(target,openCardList);
    }
  }

  /* Event listener for possible game restart,
     functionality in case player wants to try
      again before winning current game */

  restartGame();
}

// add the card to a *list* of "open" cards
async function addCard(openCard,openCardList) {

  if(openCardList && openCardList.length > 0 && openCardList.length < 3){
    openCardList.push(openCard);
    let isMatchFound = isMatch(openCardList);
      if(openCardList.length === 2 && isMatchFound) {

        cardsMatch(openCardList);
        // Empty array if cards match
        openCardList = [];
      }
      else if(openCardList.length === 2 && !isMatchFound){
        /* async/await to let player look
            at the second opened card
        */
        await delayFunction();
        noMatch(openCardList);
      }
  }
  else if(openCardList && openCardList.length < 1) {
    openCardList.push(openCard);
  }
}

/* The cards do not match, remove the cards
   from the list and hide the card's symbol */
function noMatch(openCardList) {
  openCardList.forEach((unMatchedCard) => {
    unMatchedCard.classList.remove("open");
    unMatchedCard.classList.remove("show");
    unMatchedCard.classList.remove("disable");
})
  openCardList.splice(0,openCardList.length);
}

/* Cards match, lock the cards in the open position */
function cardsMatch(openCardList){
  let pairs = updatePairs();
  openCardList.forEach((matchingCard) => {
      matchingCard.classList.add("match");
    })
  openCardList.splice(0,openCardList.length);

  // Check for winning condition
  gameWon(pairs);
}

/* Check if the two cards match */
function isMatch(openCardList) {
  let isMatchFound = true;
   openCardList[0].firstChild.classList
                .forEach((openCardClassElem) => {
                      if(!openCardList[1].firstChild.classList.contains(openCardClassElem)){
                          isMatchFound = false;
                      }
                      })
  return isMatchFound;
}


/* Game Stats maintaining functions */
function starRating(noOfMoves) {
  const gameRate = 3;
  if(noOfMoves < 30) {
    return gameRate;
  }
  if (noOfMoves > 30 && noOfMoves < 40) {
    const star3 = document.querySelector('.stars li:nth-child(3)');
    changeStars(star3);
    return (gameRate - 1);
  }
  else if (noOfMoves > 40 && noOfMoves < 50) {
    const star2 = document.querySelector('.stars li:nth-child(2)');
    changeStars(star2);
    return (gameRate - 2);
  }
  else if (noOfMoves > 50) {
    const star1 = document.querySelector('.stars li:nth-child(1)');
    changeStars(star1);
    return (gameRate - 3);
  }
}

function changeStars(star) {
  star.firstChild.classList.remove("fa-star");
  star.firstChild.classList.remove("fas");
  star.firstChild.classList.add("far");
  star.firstChild.classList.add("fa-star");
}

/* Timer functions */
function startTimer(){
  let hourElement = document.querySelector('.hours');
  let minuteElement = document.querySelector('.minutes');
  let secondsElement = document.querySelector('.seconds');
  gameStart = setInterval(() => {
  //increment time elapsed since start of game by 1 second
  gameTime += 1;
  showRealTime(gameTime);
  // Set respective innerHTMLs of time elements
  secondsElement.innerHTML = secs;
  minuteElement.innerHTML = min;
  hourElement.innerHTML = hr;
 }, 1000);
}

function showRealTime(gameTime) {
  hr = Math.floor(gameTime/3600);
  min = Math.floor((gameTime/60) % 60);
  secs = gameTime % 60;
}

function stopTimer() {
  clearInterval(gameStart);
}

// Winning Condition
function gameWon(pairs) {
  if(pairs == 8){
    //Stop timer when all pairs are matched
    stopTimer();
    setTimeout(displayModal(),500);
  }
}

/* Modal Functions */
function displayModal() {
  toggleModal();
  const gameDeck = document.querySelector('.container');
  // Game will not listen to clicks once modal appears
  gameDeck.classList.add("disable");
  const modal = document.querySelector(".modal");
  modal.classList.add('display');
  const userMoves = document.querySelector(".moves").innerText;
  const gameMoves = document.querySelector(".moveStats");
  gameMoves.innerHTML = `Moves : ${userMoves}`;
  let myStars = starRating(userMoves);
  const stars = document.querySelector(".rating");
  stars.innerHTML = `Star Rating : ${myStars}/3`;
  const time = document.querySelector(".time");
  time.innerHTML = `Total Time : ${hr} : ${min} : ${secs}`;

  /* Clicking on Close button in the modal
      will dismiss modal and unblur the body element
  */
  const closeModal = document.querySelector(".close-modal");
  closeModal.addEventListener('click',() => {
    modal.classList.remove('display');
    toggleModal();
  })

  /* Clicking on Play Again button in the modal
      will dismiss the modal, reset the game and
      refresh the page
  */
  const replay = document.querySelector(".play-again");
  replay.addEventListener('click', () => {
    toggleModal();
    reset();
    location.reload(true);
  })
  const closeIcon = document.querySelector(".close-icon");
  closeIcon.addEventListener('click',() => {
    modal.classList.remove('display');
    toggleModal();
  })
}

function toggleModal() {
  const body = document.querySelector(".body-element");
  body.classList.toggle("dialogIsOpen");
}




const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/*
  async/await delays execution by 800ms
*/
async function delayFunction() {
    await delay(800);
}

function restartGame() {
  const restart = document.querySelector(".restart");
    restart.addEventListener('click', () => {
    reset();
    location.reload(true);
  })
}

function reset() {
  gameTime = 0;
  firstClick = true;
  gameStart;
  hr = 0;
  min = 0;
  secs = 0;
  updateMoves();
  updatePairs();
}
