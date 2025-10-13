
// Initialize game canvas
const gameCanvas = document.createElement("canvas");
gameCanvas.style = "position: fixed;";
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;
document.body.appendChild(gameCanvas);
const ctx = gameCanvas.getContext("2d");
const NUM_BIRDS = 1000;
class Game {
   static pipes = [];
   static playerBird;
   static deadBirds = [];
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
        this.birds = [];
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.handleFlap();
            }
        });
        
    }
    handleFlap() {
        Game.playerBird.flap();
    }
    updateSpeed(newSpeed) {
        if(newSpeed < 0 ) {
            return;
        }
        this.gameSpeed = newSpeed;
    }
    

    newGeneration() {
        this.birdGenerations++;
        Game.pipes = [];

        if(this.birdGenerations === 1) {
            for(let i = 0; i < NUM_BIRDS ; i++) {
                this.birds.push(new Bird());
            };
            Game.playerBird = new Bird(true);
            return;
        }

        Game.deadBirds.sort((a, b) => b.score - a.score); // sort in terms of best score
        
        const parents = Game.deadBirds.slice(0, 10).map(bird => {
            bird.yPosition = 0.5;
            bird.yVelocity = 0;
            bird.score = 0;
            return bird;
        });

        for(let i = 0; i < NUM_BIRDS - 1; i++) {
            let newBird = new Bird();
            newBird.brain = mutate(parents[Math.floor(Math.random() * parents.length)].brain)
            this.birds.push(newBird)
        }
        this.birds.push(parents[0]) // Copy highest scorer from old gen
    };

    continue() {
        if (this.birds.length === 0 && (!Game.playerBird || !Game.playerBird.alive)) { // Check to see if all birds have collided
            this.newGeneration();
            return;
        };
       
        // To start off every generation
        if (Game.pipes.length === 0) {
            Game.pipes.push(new Pipe())
        };


        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
       
        // Reassign width/height incase window resizes
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;

        for(let i = 0; i < Game.pipes.length; i++) {
            if(Game.pipes[i].xPosition < -0.1) { // If offscreen
                Game.pipes.shift();
                i--;
                continue;
            } else if (Game.pipes[i].positionCheck()) { // if it should create another pipe
                Game.pipes.push(new Pipe);
            };
            Game.pipes[i].update(); 
        };

        for (let i = 0; i < this.birds.length; i++) {
            if (this.birds[i].checkCollision()) {
                Game.deadBirds.push(this.birds[i])
                this.birds.splice(i, 1);
                i--;
                console.log(`Birds alive: ${this.birds.length}`)
                continue;
            };
            this.birds[i].update();
        };
        if(Game.playerBird.checkCollision() || Game.playerBird.alive === false){
            Game.playerBird.alive = false;
        } else {
            Game.playerBird.update()
        }
    };
};


class Pipe {
    /*
    Instance Variables: 
    height -> Determines how far down the upper pipe will go.
    xPosition -> Starts at the right hand side of the screen, then travels off at x = 0
    madeAnotherPipe -> When a pipe hits an xPos < 0.5, we will make another pipe assuming it hasnt already made another one.
    */
    constructor() {
        /*
        Min possible height is 17.5% of screen height
        Max possible height is 85% of screen height
        */
        // this.height = Math.random() * (gameCanvas.height * 0.675) + (gameCanvas.height * 0.175);
        this.height = Math.random()
        // Represents 100% of the screenWidth, each frame we will move the pipe 1% to the left until xPosition < 0
        this.xPosition = 1;
        this.pixelHeight = this.height * (gameCanvas.height * 0.675) + (gameCanvas.height * 0.175);
        this.madeAnotherPipe = false; 
    };

    update() {
        this.xPosition -= 0.005; // Moves 0.5% across the x axis each frame.
        this.drawOnCanvas();
    };


    drawOnCanvas() {
        this.pixelHeight = this.height * (gameCanvas.height * 0.675) + (gameCanvas.height * 0.175)
        const pipeWidth = gameCanvas.width * 0.075; 
        // Pipe that starts from top -> 
        ctx.fillStyle = " rgb(1, 43, 6)"
        ctx.fillRect(
            (this.xPosition * gameCanvas.width), // X Position
            0, // Y position (top of screen)
            pipeWidth, 
            (this.pixelHeight - (gameCanvas.height * 0.125)) // height - 12.5% 
        );
        // Pipe that starts from height + 10% (lower pipe) ->
        ctx.fillRect(
            (this.xPosition * gameCanvas.width), // X Position
            (this.pixelHeight + (gameCanvas.height * 0.125)), // Y position (height + 12.5%)
            pipeWidth,
            gameCanvas.height - (this.pixelHeight + (gameCanvas.height * 0.125))  // Height - Upper pipe + 12.5%
        );
    };

    positionCheck() {
        if(this.xPosition < 0.35 && !this.madeAnotherPipe) {
            this.madeAnotherPipe = true;
            return true;
        }
        return false;
    };
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
    constructor(player = false) {
        this.color = Bird.colors[parseInt(Math.random() * Bird.colors.length)]
        this.xPosition = 0.25;
        this.yPosition = 0.5;
        this.gravity = 0.000145;
        this.yVelocity = 0;
        this.brain = new Network();
        if(player) {
            this.brain = null;
            this.player = true;
            this.alive = true;
        };
        this.score = 0;
    };

    flap() {
        if(this.yVelocity < -0.002) { 
            this.yVelocity = -0.0055 // buffer for extra height
        } else {
            this.yVelocity = -0.005;
        }
    };
     
    update() {
        this.score++;
        this.yVelocity += this.gravity;
        this.yPosition += this.yVelocity;
        let nextPipe;
        for(let pipe of Game.pipes) {
            if(pipe.xPosition < 0.25) {
                continue;
            }
            nextPipe = pipe;
            break;
        }
        if (!this.player) {
            if(this.brain.decide([this.xPosition, this.yPosition, this.yVelocity, nextPipe.xPosition, nextPipe.height])) {
                this.flap();
            };
        };
        this.draw();
    };

    checkCollision() {
        if(this.yPosition < 0 || this.yPosition > 1) { // Check if offscreen
            return true;
        };
        for(let pipe of Game.pipes) {
            if (pipe.xPosition < 0.3) { // Reference only the pipes close infront / in the back
                const yPosition = this.yPosition * gameCanvas.height;
                const percentDif = gameCanvas.height * 0.125;
                if (
                (yPosition < (pipe.pixelHeight - percentDif) || yPosition > (pipe.pixelHeight + percentDif)) // If same Y Position
                && 
                this.xPosition * gameCanvas.width >= pipe.xPosition * gameCanvas.width  // Start x range of the pipe (xPosPipeStart < xPosBird < xPosPipeEnd)
                && 
                this.xPosition * gameCanvas.width <= (pipe.xPosition * gameCanvas.width + (gameCanvas.width * 0.075)) // End x range of the pipe
                ) { 
                    return true;
                };
            };
        };
        return false;
    };

    draw() {
       
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.xPosition * gameCanvas.width,
            gameCanvas.height * this.yPosition,
            gameCanvas.width * 0.02 , // Radius
            0, // Start angle
            Math.PI * 2 // End Angle
        )
        ctx.strokeStyle = 'black';
        if (this.player) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = gameCanvas.width * 0.001;
            ctx.lineWidth = gameCanvas.width * 0.005;
        }
        ctx.stroke();
        
        ctx.fill();

        ctx.closePath();
    };
};

const game = new Game();
const gameLoop = setInterval(() => game.continue(), 1000 / 60); // 60 FPS (Ignores refresh rate of monitor)


