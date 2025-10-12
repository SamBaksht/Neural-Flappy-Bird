
// initialize game canvas
const gameCanvas = document.createElement("canvas");
gameCanvas.style = "position: fixed;";
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;
document.body.appendChild(gameCanvas);
const ctx = gameCanvas.getContext("2d");

class Pipe {
   
    constructor() {
        /*
        Min possible height is 15% of screen height
        Max possible height is 85% of screen height
        */
        this.height = Math.random() * (gameCanvas.height * 0.70) + 0.15;
        
        // Represents 100% of the screenWidth, each frame we will move the pipe 1% to the left until xPosition < 0
        this.xPosition = 1;
        
    }

    update() {
        this.xPosition -= 0.01;
        this.drawOnCanvas();
        console.log(this.height)
    }

    drawOnCanvas() {
        const pipeWidth = gameCanvas.width * 0.1; 
        // Pipe the starts from top -> 
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



}

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
        
    }

    continue() {
        if (this.pipes.length === 0) {

        }

        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
       
        // Reassign width/height incase window resizes
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;

        this.pipes.map(pipe => {
            pipe.update();
        });
    }

}


const game = new Game();
const gameLoop = setInterval(() => game.continue(), 1000 / 60) // 60 FPS (Ignores refresh rate of monitor)

