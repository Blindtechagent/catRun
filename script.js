 
// DOM Elements
const startBtn = document.getElementById('startBtn');
const actionButtons = document.querySelectorAll(".action-btn");
const catImg = document.getElementById('catImage');
const objec = document.getElementById('obj');
const gmModeElement = document.getElementById('gmMode');
const modeInfo = document.getElementById('modeInfo');

// Game State Variables
let obsGoal = null; // Number of obstacles to survive
let isLimitRun = false; // Whether Limited Run mode is active
let selectedMode;
let gameInterval;
let currentObj = '';
let score = 0;
let reactTime;
let isRunning = false;

// Image sources for different objects
const images = {
    rock: 'images/rock.png',
    woods: 'images/woods.png',
    tunnel: 'images/tunnel.png'
};

// Sound effects
const sounds = {
    bgm: new Audio('sounds/bgm.mp3'),
    footsteps: new Audio('sounds/footsteps.mp3'),
    jump: new Audio('https://www.myinstants.com/media/sounds/woosh_s21KzKN.mp3'),
    crawl: new Audio('sounds/crawl.mp3'),
    crash: new Audio('sounds/crash.mp3'),
    win: new Audio('https://www.myinstants.com/media/sounds/positive-win-game-sound-5-online-audio-converter.mp3')
};

sounds.bgm.loop = true;
sounds.bgm.volume = 0.5;

// Handle game mode selection
gmModeElement.onchange = () => {
    selectedMode = gmModeElement.value;
    modeSelection();
};

// Update UI and info text based on selected game mode
function modeSelection() {
    if (selectedMode === 'limiRun') {
        document.getElementById('obsCountBox').style.display = 'block';
        modeInfo.innerText = 'You selected Limited Run mode. Reach your goal by surviving the number of obstacles you set.';
    } else if (selectedMode === 'endlRun') {
        document.getElementById('obsCountBox').style.display = 'none';
        modeInfo.innerText = 'You selected Endless Run mode. Dodge as many obstacles as you can to keep going!';
    }
}

// Start the game
function startGame() {
    const obsInput = document.getElementById('obsCountInput');

    if (selectedMode === 'limiRun') {
        obsGoal = parseInt(obsInput.value);
        if (!isNaN(obsGoal) && obsGoal > 0) {
            isLimitRun = true;
            announce(`Game started. Survive ${obsGoal} obstacles to win, \n Good Luck!`);
        } else {
            obsGoal = null;
            isLimitRun = false;
            announce('Please enter a valid number of obstacles!');
            return;
        }
    } else if (selectedMode === 'endlRun') {
        obsGoal = null;
        isLimitRun = false;
        announce('Game started. Try to survive as many obstacles as you can, \n Good Luck!');
    } else {
        announce('Please select a game mode to start.');
        return;
    }

    sounds.bgm.play();
    sounds.footsteps.play();
    sounds.footsteps.loop = true;
    sounds.footsteps.playbackRate = 1.0;

    document.getElementById('initScreen').style.display = 'none';
    document.getElementById('finScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';

    isRunning = true;
    score = 0;
    gameInterval = setInterval(Objects, 5000);
    reactTime = 2000;
    objec.style.animationDuration = '3.5s';
    document.getElementById('score').innerText = score;
}

// Handle winning the game
function winGame() {
    sounds.footsteps.pause();
    sounds.bgm.pause();
    sounds.win.play();
    clearInterval(gameInterval);
    isRunning = false;

    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('finScreen').style.display = 'block';
    document.getElementById('hitWith').innerText = '';
    document.getElementById('scoreId').innerText = 'You Win!';
    document.getElementById('score').innerHTML = `Congratulations! You survived ${obsGoal} obstacles.`;
    announce('You win!');
}

// End the game
function endGame() {
    sounds.crash.play();
    sounds.bgm.pause();
    sounds.footsteps.pause();
    sounds.footsteps.currentTime = 0;

    document.getElementById('finScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';

    document.getElementById('jumpBtn').disabled = true;
    document.getElementById('crawlBtn').disabled = true;

    document.getElementById('hitWith').innerText = `You crashed with ${currentObj}`;
    isRunning = false;
    announce('Game over!');
    clearInterval(gameInterval);

    if (selectedMode === 'limiRun') {
        document.getElementById('scoreId').innerText = 'You Lose!';
        document.getElementById('score').innerHTML = 'You crashed before reaching your goal!';
    }
}

// Restart the game
function restart() {
    const ask = confirm('Do you want to restart the game in the same mode?');
    if (ask) {
        startGame();
    } else {
        window.location.reload();
    }
}

// Generate and handle obstacles
function Objects() {
    const ObjectsList = [
        'Rock',
        'Low Fence',
        'Woods',
        'Hanging Branches',
        'Tunnel Passage'
    ];

    currentObj = ObjectsList[Math.floor(Math.random() * ObjectsList.length)];
   setTimeout( () => {
     announce(currentObj);
   },800);
     setTimeout( function() {
        document.getElementById('jumpBtn').disabled = false;
        document.getElementById('crawlBtn').disabled = false;
     }, 1100);

    if (currentObj === 'Rock') {
        showImage(images.rock);
    } else if (currentObj === 'Woods') {
        showImage(images.woods);
    } else if(currentObj == 'Tunnel Passage'){
        showImage(images.tunnel);
        objec.style.width = '600px';
    } else {
        showImage(images.rock);
    }

    checkProgress();

    const timeOut = setTimeout(() => {
        announce('You lose!');
        endGame();
    }, reactTime);

    actionButtons.forEach(button => {
        button.onclick = () => react(button.dataset.action, timeOut);
    });
}

// Display obstacle image
function showImage(imgPath) {
    objec.src = imgPath;
    objec.classList.add('obj-animate');
    setTimeout(() => objec.classList.remove('obj-animate'), 2500);
}

// React to obstacle
function react(userAction, timeOut) {
    clearTimeout(timeOut);
    document.getElementById('jumpBtn').disabled = true;
    document.getElementById('crawlBtn').disabled = true;

    const jumpObjects = ['Rock', 'Low Fence', 'Woods'];
    const isJump = jumpObjects.includes(currentObj);

    if ((isJump && userAction === 'jump') || (!isJump && userAction === 'crawl')) {
        if (isJump) Jump(); else Crawl();
        announce('Good job!');
        score++;

        if (isLimitRun && score >= obsGoal) {
            winGame();
            return;
        }
    } else {
        if (userAction === 'jump') sounds.jump.play();
        else sounds.crawl.play();

        sounds.footsteps.pause();
        announce('You lose!');
        endGame();
        return;
    }

    if (selectedMode === 'endlRun') {
        document.getElementById('score').innerText = score;
    }

    currentObj = '';
}

// Handle jump animation and sound
function Jump() {
    sounds.footsteps.pause();
    sounds.jump.play();
    if (isRunning) {
        catImg.src = 'images/jumping.png';
        catImg.classList.add('jumping');
        setTimeout(() => {
            catImg.src = 'images/running_cat.gif';
            catImg.classList.remove('jumping');
        }, 1500);
        setTimeout(() => {
            if (isRunning) sounds.footsteps.play();
        }, 1500);
    }
}

// Handle crawl animation and sound
function Crawl() {
    sounds.footsteps.pause();
    sounds.crawl.play();
    if (isRunning) {
        catImg.src = 'images/crawling.png';
        setTimeout(() => catImg.src = 'images/running_cat.gif', 1500);
        setTimeout(() => {
            if (isRunning) sounds.footsteps.play();
        }, 1500);
    }
}

// Adjust game difficulty as score increases
function checkProgress() {
    if (!isRunning) {
        endGame();
    } else {
        if (score === 10) {
            sounds.footsteps.playbackRate = 1.25;
            clearInterval(gameInterval);
            gameInterval = setInterval(Objects, 4000);
            reactTime = 1800;
            objec.style.animationDuration = '3s';
        } else if (score === 15) {
            sounds.footsteps.playbackRate = 1.5;
            clearInterval(gameInterval);
            gameInterval = setInterval(Objects, 3000);
            reactTime = 1500;
            objec.style.animationDuration = '2.5s';
        } else if (score === 20) {
            sounds.footsteps.playbackRate = 1.75;
            clearInterval(gameInterval);
            gameInterval = setInterval(Objects, 3000);
            reactTime = 1300;
            objec.style.animationDuration = '2.3s';
            }
}}

// Announce messages to screen readers
function announce(message) {
    const ancBox = document.getElementById('statusBox');
    ancBox.innerText = message;
    setTimeout(() => ancBox.innerText = '', 2000);
}

// Add event listener to start button

startBtn.addEventListener('click', startGame);
