const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const socket = io.connect("https://pure-reaches-96587.herokuapp.com/");

socket.on("init", handleInit);
socket.on("gameState", handleGameState)
socket.on("gameOver", handleGameOver)
socket.on("gameCode", handleGameCode)
socket.on("unknownCode", handleUnknownGame)
socket.on("tooManyPlayers", handleTooManyPlayers)

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBut = document.getElementById('newGameButton')
const joinGameBut = document.getElementById('joinGameButton')
const gameCodeInput = document.getElementById('gameCodeInput')
const gameCodeDisplay = document.getElementById('gameCodeDisplay')

newGameBut.addEventListener('click', newGame)
joinGameBut.addEventListener('click', joinGame)

function newGame() {
    socket.emit('newGame')
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code)
    init()
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

const gameState = {
    player: {
        pos: {
            x: 3,
            y: 10
        },
        vel: {
            x: 1,
            y: 0
        },
        snake: [
            { x: 1, y: 10 },
            { x: 2, y: 10 },
            { x: 3, y: 10 }
        ]
    },
    food: {
        x: 7,
        y: 7
    },
    gridSize: 20
}

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keyDown);
    gameActive = true
}

function keyDown(e) {
    socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridSize = state.gridSize;
    const size = canvas.width / gridSize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLOUR);
    paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;

    for (let cell of snake) {
        ctx.fillStyle = colour;
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number
}

function handleGameState(gameState) {
    if(!gameActive) return
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState))
}

function handleGameOver(data) {
    data = JSON.parse(data);
    if(!gameActive) return
    if(data.winner === playerNumber){
        alert("You win!")
    } else{
        alert("you lose!")
    }       
    gameActive = false;
}

function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame(){
    reset();
    alert("unknown game code!")
}

function handleTooManyPlayers(){
    reset();
    alert("this game is already in progress")
}

function reset(){
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block"
    gameScreen.style.display = "none"
}