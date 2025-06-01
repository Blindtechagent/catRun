window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const catImage = document.getElementById('catImage');
    const objec = document.getElementById('obj');
    
    let canvasWidth = 0;
    let canvasHeight = 0;
    let roadHeight;
    let roadSpeed = 2;

    let roadOffsetX1 = 0;
    let roadOffsetX2;

    let roadPath1 = [];
    let roadPath2 = [];

    const roadColor = '#4A3B30';
    const grassColor = '#38761D';
    const grassThickness = 15;

    function resizeCanvas() {
        canvasWidth = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
        roadHeight = canvasHeight / 2;

        roadOffsetX1 = 0;
        roadOffsetX2 = canvasWidth;

        roadPath1 = createSlightlyHillyRoad();
        roadPath2 = createSlightlyHillyRoad();

        positionCatImage();

        // Force re-render of image
        requestAnimationFrame(() => {
            catImage.style.display = 'none';
            void catImage.offsetWidth; // trigger reflow
            catImage.style.display = 'block';
        });
    }

    // Create a slightly hilly road with subtle height variations
    function createSlightlyHillyRoad() {
        const path = [];
        let baseHeight = roadHeight;
        
        for (let i = 0; i <= canvasWidth; i++) {
            // Adding very subtle hills using sine waves
            let hillEffect = Math.sin(i * 0.03) * 7;  // Small and subtle hills
            path.push(baseHeight + hillEffect);
        }

        return path;
    }

    function drawRoadLayer(path, offsetX) {
        // Grass Layer
        ctx.fillStyle = grassColor;
        ctx.beginPath();
        ctx.moveTo(offsetX, path[0] - grassThickness);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(offsetX + i, path[i] - grassThickness);
        }
        ctx.lineTo(offsetX + path.length - 1, roadHeight);
        ctx.lineTo(offsetX, roadHeight);
        ctx.closePath();
        ctx.fill();

        // Road Layer
        ctx.fillStyle = roadColor;
        ctx.beginPath();
        ctx.moveTo(offsetX, path[0]);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(offsetX + i, path[i]);
        }
        ctx.lineTo(offsetX + path.length - 1, canvasHeight);
        ctx.lineTo(offsetX, canvasHeight);
        ctx.closePath();
        ctx.fill();
    }

    function drawBackground() {
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, canvasWidth, roadHeight);
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawBackground();

        drawRoadLayer(roadPath1, roadOffsetX1);
        drawRoadLayer(roadPath2, roadOffsetX2);
    }

    function update() {
        roadOffsetX1 -= roadSpeed;
        roadOffsetX2 -= roadSpeed;

        if (roadOffsetX1 <= -canvasWidth) {
            roadOffsetX1 = roadOffsetX2 + canvasWidth;
            roadPath1 = createSlightlyHillyRoad();
        }

        if (roadOffsetX2 <= -canvasWidth) {
            roadOffsetX2 = roadOffsetX1 + canvasWidth;
            roadPath2 = createSlightlyHillyRoad();
        }

        drawScene();
        requestAnimationFrame(update);
    }

    function positionCatImage() {
        const top = roadHeight - catImage.height + 10;
        catImage.style.top = `${top}px`;
        catImage.style.left = `${canvasWidth / 7}px`;

        
        objec.style.top = `${top - 10}px`;
        objec.style.left = `${canvasWidth / 10 + 1000}px`;
    }

    // Wait for image to fully load
    if (catImage.complete) {
        resizeCanvas();
        requestAnimationFrame(update);
    } else {
        catImage.onload = () => {
            resizeCanvas();
            requestAnimationFrame(update);
        };
    }

    window.addEventListener('resize', resizeCanvas);
});
