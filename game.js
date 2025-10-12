
// initialize game canvas
const gameCanvas = document.createElement("canvas");
gameCanvas.style = "position: fixed;";
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;
document.body.appendChild(gameCanvas);
const ctx = gameCanvas.getContext("2d");

class Game {
   /*
   Instance Variables:
   birdGenerations -> Number of generations since the first
   gameSpeed -> Overall speed of the simulation
   bestBird -> Starts as null, becomes bird with the highest score.
   */
    constructor() {
        this.birdGenerations = 0;
        this.gameSpeed = 1;
        this.bestBird = null;
        this.pipes = []
        this.birds = []
    }

    updateSpeed(newSpeed) {
        if(newSpeed < 0 ) {
            return;
        }
        this.gameSpeed = newSpeed;
    }

    newGeneration() {
        this.birdGenerations++;
        this.pipes = [];
        this.birds = []
        for(let i = 0; i < 1; i++) {
            this.birds.push(new Bird());
        }
    }

    continue() {
        if (this.birds.length === 0) { // Check to see if all birds have collided
            this.newGeneration()
            return;
        }
       
        // To start off every generation
        if (this.pipes.length === 0) {
            this.pipes.push(new Pipe())
        }


        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
       
        // Reassign width/height incase window resizes
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;

        for(let i = 0; i < this.pipes.length; i++) {
            if(this.pipes[i].xPosition < -0.1) { // If offscreen
                this.pipes.shift();
                i--;
                continue;
            } else if (this.pipes[i].positionCheck()) { // if it should create another pipe
                this.pipes.push(new Pipe);
            }
            this.pipes[i].update(); 
        }

        for (let i = 0; i < this.birds.length; i++) {
            if (this.birds[i].checkCollision()) {
                this.birds.splice(i, 1);
                i--;
                continue;
            }
            this.birds[i].update();
        }
    }
}


class Pipe {
   
    /*
    Instance Variables: 
    height -> Determines how far down the upper pipe will go.
    xPosition -> Starts at the right hand side of the screen, then travels off at x = 0
    madeAnotherPipe -> When a pipe hits an xPos < 0.5, we will make another pipe assuming it hasnt already made another one.
    */
    constructor() {
        /*
        Min possible height is 15% of screen height
        Max possible height is 85% of screen height
        */
        this.height = Math.random() * (gameCanvas.height * 0.70) + (gameCanvas.height * 0.15);
        
        // Represents 100% of the screenWidth, each frame we will move the pipe 1% to the left until xPosition < 0
        this.xPosition = 1;

        this.madeAnotherPipe = false;
        
    }

    update() {
        this.xPosition -= 0.005; // Moves 0.5% across the x axis each frame.
        this.drawOnCanvas();
    }


    drawOnCanvas() {
        const pipeWidth = gameCanvas.width * 0.075; 
        // Pipe that starts from top -> 
        ctx.fillRect(
            (this.xPosition * gameCanvas.width), // X Position
            0, // Y position (top of screen)
            pipeWidth, 
            (this.height - (gameCanvas.height * 0.1)) // height - 10% 
        );
        // Pipe that starts from height + 10% (lower pipe) ->
        ctx.fillRect(
            (this.xPosition * gameCanvas.width), // X Position
            (this.height + (gameCanvas.height * 0.1)), // Y position (height + 10%)
            pipeWidth,
            gameCanvas.height - (this.height + (gameCanvas.height * 0.1))  // Height - Upper pipe + 10%
        );
    }

    positionCheck() {
        if(this.xPosition < 0.5 && !this.madeAnotherPipe) {
            this.madeAnotherPipe = true;
            return true;
        }
        return false;
    }
}

class Bird {
    static colors = [
        'rgba(255, 0, 0, 0.8)',    // Red
        'rgba(0, 255, 0, 0.8)',    // Green
        'rgba(0, 0, 255, 0.8)',    // Blue
        'rgba(255, 255, 0, 0.8)',  // Yellow
        'rgba(0, 255, 255, 0.8)',  // Cyan
        'rgba(255, 0, 255, 0.8)',  // Magenta
        'rgba(192, 192, 192, 0.8)',// Silver
        'rgba(128, 0, 128, 0.8)'   // Purple
    ];

    /* 
    Instance Variables:
    color -> One of the random colors above
    xPosition -> 25% of the way to the end of the screen (Recalculated every tick incase of window size change)
    yPosition -> Centered in the screen vertically, this has physic logic applied to it every tick.
    gravity -> Constant rate of change applied to yPos (reset when a bird flaps)
    yVelocity -> The combined amount of gravity after each tick
    */
    constructor() {
        this.color = Bird.colors[parseInt(Math.random() * 8)]
        this.xPosition = 0.25 * gameCanvas.width;
        this.yPosition = 0.5;
        this.gravity = 0.00009;
        this.yVelocity = 0;
    }

    update() {
        this.yVelocity += this.gravity;
        // console.log(`yPosition: ${this.yPosition} | Gravity: ${this.yVelocity}`)
        this.yPosition += this.yVelocity;
        
        
        this.draw();
    }

    checkCollision() {
        if(this.yPosition < 0 || this.yPosition > 1) { // Check if offscreen
            console.log("Bird Collided!")
            return true;
        }
        return false;
    }

    draw() {
        this.xPosition = 0.25 * gameCanvas.width; 
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.xPosition,
            gameCanvas.height * this.yPosition,
            gameCanvas.width * 0.02 , // Radius
            0, // Start angle
            Math.PI * 2 // End Angle
        )
        ctx.fill();
    }
}

const game = new Game();
const gameLoop = setInterval(() => game.continue(), 1000 / 60) // 60 FPS (Ignores refresh rate of monitor)

