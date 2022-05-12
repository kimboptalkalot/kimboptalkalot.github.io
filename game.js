// add score variable, starting at 0, increase based on whatever

// Check for collision between player and obstacles
// destroy obstacle on collision with player
// lower score

// check for collision between player and enemy
// reduce health
// lower score

// have a look at getting enemy to follow player

let game
let gameConfig
let background
let pizzaText
let gameState = 0;
let startUI, scoreUI, endUI
let score = 0;
let worldEdges
let leftEdge
let rightEdge
let bottomEdge

let player
let newCar
let newBike
let EnemyCar


let roadOne
let roadTwo
let roadGroup
let currentScene;

const spawnPoint = [228, 348, 478, 608];
let laneOccupation = [false, false, false, false];

let lanesCurrently = [];
let myLane;
let lane;
let vehicleGroup;
let enemyGroup;
let enemySpawned = false;

let spawnEvenConfig =
{
    delay: 5000,
    callback: spawnObstacleVehicles,
    repeat: -1
}

let spawnEnemyConfig = {
    delay: 5000,
    callback: spawnEnemy,
    repeat: -1
}


let gameSettings =
{
    roadSpeed: 200,
    playerSpeed: 400,
    carSpeed: 300,
}

let textConfig =
{
    fontFamily: "pizzaText",
    fontSize: "32px",
    strokeThickness: 4,
    stroke: "#000"
}

window.onload = function () {
    gameConfig =
    {
        width: 840,
        height: 650,
        backgroundColor: 0x53CDAB,
        physics:
        {
            default: "arcade",
            arcade:
            {
                gravity: { y: 0 },
                debug: true

            }
        },
        scene:
        {
            preload: preload,
            create: create,
            update: update
        }
    }
    game = new Phaser.Game(gameConfig)
}

function preload() {
    currentScene = this;
    currentScene.load.image("road", "images/road.png");

    currentScene.load.image("car", "images/Car_Monochrome.png");
    currentScene.load.image("car2", "images/Black_viper.png");
    currentScene.load.image("car3", "images/Car.png");


    currentScene.load.spritesheet("player", "images/Pizza_vanEDITED.png",
        { frameWidth: 109, frameHeight: 210 });
    currentScene.load.image("EnemyCar", "images/Black_Viper.png");
    currentScene.load.image("MotorbikeY", "images/motorcycle_yellow.png");
    currentScene.load.image("MotorbikeG", "images/motorcycle_green.png");

    currentScene.load.image("FishVan", "images/FishChips.png")
    // currentScene.load.spritesheet("Fishvan", "images/FishChips_sprite.png", 
    // {frameWidth:101, frameHeight:202});



}

function create() {
   // background = currScene.add.image(gameConfig.width/2, gameConfig.height/2, "background")
    InitialiseStartUI ()
    currentScene.input.on("pointerdown", playerTap) 
}

function StartGame() {
    // EnemyCar = currentScene.add.image(500, 500, "EnemyCar");
    // MotorbikeY = currentScene.add.image(500, 200, "MotorbikeY");
    // MotorbikeG = currentScene.add.image(400, 300, "MotorbikeG")
    // FishVan = currentScene.add.image(300, 200, "FishVan")


    //calls function to move the road
    roadOne = UpdateRoad()
    roadTwo = UpdateRoad()
    //sets starting y position to -300
    roadTwo.y = -300

    InitialisePlayer()



    vehicleGroup = currentScene.physics.add.group()
    enemyGroup = currentScene.physics.add.group()
    // bikeGroup = currentScene.physics.add.group()
    //add a group for the world edeges and have it stay put with physics
    worldEdges = currentScene.physics.add.staticGroup()

    //add rectangles to current scene
    leftEdge = currentScene.add.rectangle(130, 600, 20, 1200, 0x000000)
    rightEdge = currentScene.add.rectangle(715, 600, 20, 1200, 0x000000)
    bottomEdge = currentScene.add.rectangle(600, 640, 1200, 20, 0x000000)

    //add the edges to a group called world edges when this is added it breaks
    worldEdges.add(leftEdge)
    worldEdges.add(rightEdge)
    worldEdges.add(bottomEdge);
    currentScene.physics.add.collider(player, worldEdges)

    //this should make the pizza van collide with the world edges but doesnt work

    //car one works but bike one doesnt
    currentScene.physics.add.overlap(bottomEdge, vehicleGroup, DestroyVehicle)
    currentScene.physics.add.overlap(bottomEdge, enemyGroup, DestroyVehicle)
    currentScene.time.addEvent(spawnEvenConfig)
    currentScene.time.addEvent(spawnEnemyConfig)

}

function update() {
    if(gameState == 1){
            // if the first road leaves the page, spawn a new road 
    if (roadOne.y > 950) {
        roadOne.y = -300
    }

    if (roadTwo.y > 950) {
        roadTwo.y = -300
    }

    //cursor keys 
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play("left", true);

    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play("right", true);

    }
    else if (cursors.up.isDown) {
        player.setVelocityY(-160);
        player.anims.play("straight");
    }
    else if (cursors.down.isDown) {
        player.setVelocityY(160)
        player.anims.play("straight");
    }
    else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play("straight");
    }
    }
}

function resetCarPos(car) {
    car.y = 0;
    let randomX = Phaser.Math.Between(0, gameConfig.width);
    car.x = randomX;

}

function UpdateRoad() {
    //add physics road image to the current scene
    let road = currentScene.physics.add.image(gameConfig.width / 2, gameConfig.height / 2, "road");
    //create a road group with physics
    roadGroup = currentScene.physics.add.group()
    //add road to the road group
    roadGroup.add(road)
    // set the roads Y velocity using the game settings / road speed
    road.setVelocityY(gameSettings.roadSpeed)
    //dont allow road body any gravity
    road.body.allowGravity = false
    //give us the results of this function
    return road;
}


function InitialisePlayer() {
    //add physics sprite to the screen
    player = currentScene.physics.add.sprite(230, 500, "player");
    //dont allow player to move outside of the screen
    player.setCollideWorldBounds(true);
    //set the players Y velocity to -60
    player.setVelocityY(-60)


    // initialise the keys/animations from sprite sheet
    currentScene.anims.create({
        key: "right",
        frames: [{ key: "player", frame: 2 }],
        frameRate: 20,
        repeat: -1,
    });

    currentScene.anims.create({
        key: "straight",
        frames: [{ key: "player", frame: 1 }],
        frameRate: 20,
    });

    currentScene.anims.create({
        key: "left",
        frames: [{ key: "player", frame: 0 }],
        frameRate: 20,
    });
    //creating the cursor keys
    cursors = currentScene.input.keyboard.createCursorKeys();

    //dont allow player body gravity
    player.body.allowGravity = false
    player.setSize(90, 200, true)


}

function spawnEnemy() {
    if(!enemySpawned){
        let enemy = vehicleSpawn("FishVan");
        //enemySpawned = true;

        if(enemy != null) {
            vehicleGroup.add(enemy);
            enemy.setVelocityY(100);
        }
    }
}

function spawnObstacleVehicles(){
       // Random number between 0 - 1
       let carOrBikeRandomiser = Phaser.Math.Between(0,1);

       // declare empty string to assign car or bike name to
       let carOrBike = "";
   
       // set either car or bike depending on randomiser
       if(carOrBikeRandomiser === 0){
           carOrBike = "MotorbikeG";
       }
       else if (carOrBikeRandomiser === 1 ){
           carOrBike = "car";
       }

    let newVehicle = vehicleSpawn(carOrBike);


    if(newVehicle != null){
        vehicleGroup.add(newVehicle);
        newVehicle.setVelocityY(100);
        let randomColor = Phaser.Math.Between(0x000000, 0xFFFFFF);
        newVehicle.setTint(randomColor);
    }
}

function vehicleSpawn(vehicleType) {
    // generate random lane number
    let laneNumber = Phaser.Math.Between(0, 3);

    if (laneOccupation[laneNumber] == true) {
        return null;
    }

    newVehicle = currentScene.physics.add.image(spawnPoint[laneNumber], 100, vehicleType);
    newVehicle.myLane = laneNumber
    laneOccupation[laneNumber] = true


    newVehicle.setSize(100, 200, true)
    newVehicle.setScale(0.5);
    newVehicle.body.allowGravity = false;

    return newVehicle;
}


function DestroyVehicle(edge, vehicle) {
    vehicle.destroy();
    laneOccupation[vehicle.myLane] = false
}

function InitialiseStartUI()
{
    //add text to start screen that will show instrustions and "click to start"
    startUI = currentScene.add.text(140, 130, "Click to start", textConfig)
}
function InitialiseScoreUI()
{
    //while playing the game, show the score and the health of the player
    scoreUI = currentScene.add.text(16, gameConfig.height - 48, "Score: " + score, textConfig)   

}

function InitialiseEndUI()
{
    //once game is over, show text that says "game over"
   endUI = currentScene.add.text(150, 150, "Game Over", textConfig)
}

function playerTap()
{
    if(gameState == 0)
    {
        // UpdateRoad()
        // vehicleSpawn()
        // InitialiseScoreUI()
        // startUI.destroy()
        // score = 0
        // scoreUI.setText("Score: " + score)
        StartGame();
        gameState = 1
    }
    else if (gameState == 2)
    {
        UpdateRoad.destroy()
        vehicleSpawn.destroy()
        endUI.destroy()
        scoreUI.destroy()
        InitialiseStartUI()
        gameState = 0
    }
}

// When player dies/health = 0 call this function
function gameOver()
{
    game.destroy()
    gameState = 2;
}

//