//https://learn.adafruit.com/re-makecode-the-classics-spy-hunter?view=all#setup-and-mechanics



//added playerhealth
// need to add score variable, starting at 0, increase based on defeating fish van and surviving

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
let startUI, scoreUI, endUI, healthUI
let score;
let gameTimer = 0;
let playerHealth;
let worldEdges
let leftEdge
let rightEdge
let bottomEdge

let player
let newCar
let newBike
let FishVan
let newVehicle
let pizzaGroup

let roadOne
let roadTwo
let roadGroup
let currentScene;

const spawnPoint = [228, 348, 478, 608];
let laneOccupation = [false, false, false, false];

let lanesCurrently = [];
let myLane;
let type;
let lane;
let vehicleGroup;
let enemyGroup;
let enemySpawned = false;
let enemySpeed = 0.8;

let spawnVehicleConfig = {
    delay: 5000,
    callback: spawnObstacleVehicles,
    repeat: -1
}

let spawnEnemyConfig = {
    delay: 5000,
    callback: spawnEnemy,
    repeat: -1
}

let spawnVehicleEvent;
let spawnEnemyEvent;


let gameSettings = {
    roadSpeed: 200,
    playerSpeed: 400,
    carSpeed: 300,
}

let textConfig = {
    fontFamily: "pizzaText",
    fontSize: "50px",
    strokeThickness: 4,
    stroke: "#000"
}

let h1textConfig = {
    fontFamily: "pizzaText",
    fontSize: "100px",
    strokeThickness: 4,
    stroke: "#000"
}

window.onload = function () {
    gameConfig = {
        width: 840,
        height: 650,
        backgroundColor: 0x53CDAB,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                },
                debug: true

            }
        },
        scene: {
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
    currentScene.load.spritesheet("player", "images/Pizza_vanEDITED.png", {
        frameWidth: 109,
        frameHeight: 210
    });
    currentScene.load.image("MotorbikeG", "images/motorcycle_green.png");
    currentScene.load.image("FishVan", "images/FishChips.png")
    currentScene.load.image("RoadUI", "images/Toon Road Texture.png")
    currentScene.load.image("pizza", "images/pizza1.png")


}

function create() {
    InitialiseStartUI()
    currentScene.input.on("pointerdown", playerTap)
}

function StartGame() {



    //calls function to move the road
    roadOne = UpdateRoad()
    roadTwo = UpdateRoad()
    //sets starting y position to -300
    roadTwo.y = -300
    InitialisePlayer()
    //add vehicles to group
    vehicleGroup = currentScene.physics.add.group()
    //add enemy van to group
    enemyGroup = currentScene.physics.add.group()

    pizzaGroup = currentScene.physics.add.group()
    //add a group for the world edeges and have it stay put with physics
    worldEdges = currentScene.physics.add.staticGroup()

    //add rectangles to current scene
    leftEdge = currentScene.add.rectangle(95, 600, 20, 1200, 0x000000)
    rightEdge = currentScene.add.rectangle(750, 600, 20, 1200, 0x000000)
    bottomEdge = currentScene.add.rectangle(600, 640, 1200, 20, 0x000000)
    topEdge = currentScene.add.rectangle(600, 10, 1200, 20, 0x000000)

    //add the edges to a group called world edges when this is added it breaks
    worldEdges.add(leftEdge)
    worldEdges.add(rightEdge)
    worldEdges.add(bottomEdge);
    worldEdges.add(topEdge)
    //check for collision between the player and edges
    currentScene.physics.add.collider(player, bottomEdge)
    currentScene.physics.add.collider(player, topEdge)
    //collision between fishvan, player and function
    currentScene.physics.add.collider(player, enemyGroup, enemyCollision)
    currentScene.physics.add.collider(worldEdges, enemyGroup)
    //check for collision between the player and the vehicles
    //currentScene.physics.add.collider(player, vehicleGroup)
    //overlap between the bottom edge, the vehicles group and function destroy vehicle 
    //this will delete images after leaving lane so another image can spawn
    currentScene.physics.add.overlap(bottomEdge, vehicleGroup, DestroyVehicle)
    //create overlap between player and edges 
    currentScene.physics.add.overlap(leftEdge, player, gameOver);
    currentScene.physics.add.overlap(rightEdge, player, gameOver);

    //add events for spawning cars and enemies
    spawnVehicleEvent = currentScene.time.addEvent(spawnVehicleConfig)
    spawnEnemyEvent = currentScene.time.addEvent(spawnEnemyConfig)
    //add overlap between the vehicle group, the player and call gotContact to destroy the vehicle
    currentScene.physics.add.overlap(player, vehicleGroup, gotContact)
    currentScene.physics.add.overlap(pizzaGroup, vehicleGroup, pizzaContact)
    currentScene.physics.add.overlap(pizzaGroup, enemyGroup, pizzaContact)
    currentScene.physics.add.overlap(pizzaGroup, topEdge, destroyPizza)
    // currentScene.physics.add.overlap(worldEdges, enemyGroup, DestroyVehicle)

    playerHealth = 100;
    score = 0;


    // create function to fire on collision between enemy and player
    // reduce player healthy by 1 ech collision
    // reduce player x velocity if enemy hits players right side, increase for hits on left (
    // if collision, check if enemy x > player x, if so enemy is on right. Inverse for on left
    //)

}

function update() {
    if (gameState == 1) {
        // if the first road leaves the page, spawn a new road 
        if (roadOne.y > 950) {
            roadOne.y = -300
            score += 10
            scoreUI.setText("Score: " + score);
        }

        if (roadTwo.y > 950) {
            roadTwo.y = -300
            score += 10
            scoreUI.setText("Score: " + score);
        }

        //cursor keys 
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play("left", true);

        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play("right", true);

        } else if (cursors.up.isDown) {
            player.setVelocityY(-160);
            player.anims.play("straight");
        } else if (cursors.down.isDown) {
            player.setVelocityY(160)
            player.anims.play("straight");
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.play("straight");
        }

        if (enemySpawned && pizzaGroup.countActive(true) == 0) {
            if (player.x >= FishVan.x - 20 && player.x <= FishVan.x + 20 && player.y > FishVan.y) {
                throwPizza();
            }
        }
        if (enemySpawned) {

            if (player.x < FishVan.x) {
                FishVan.setVelocityX(FishVan.body.velocity.x - enemySpeed)
            } else if (player.x > FishVan.x) {
                FishVan.setVelocityX(FishVan.body.velocity.x + enemySpeed)
            }
            
            if (player.x >= FishVan.x - 10 && player.x <= FishVan.x + 10){
                FishVan.setVelocityX(0)
            }

            if (player.y < FishVan.y) {
                FishVan.setVelocityY(FishVan.body.velocity.y - enemySpeed)
            } else if (player.y > FishVan.y) {
                FishVan.setVelocityY(FishVan.body.velocity.y + enemySpeed)
            }

            if (player.y >= FishVan.y - 10 && player.y <= FishVan.y + 10){
                FishVan.setVelocityY(0)
            }
        }
    }


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
    //set the players Y velocity to -60
    player.setVelocityY(-60)
    //scale player body down to a smaller size
    player.setScale(0.5);


    // initialise the keys/animations from sprite sheet
    currentScene.anims.create({
        key: "right",
        frames: [{
            key: "player",
            frame: 2
        }],
        frameRate: 20,
        repeat: -1,
    });

    currentScene.anims.create({
        key: "straight",
        frames: [{
            key: "player",
            frame: 1
        }],
        frameRate: 20,
    });

    currentScene.anims.create({
        key: "left",
        frames: [{
            key: "player",
            frame: 0
        }],
        frameRate: 20,
    });
    //creating the cursor keys
    cursors = currentScene.input.keyboard.createCursorKeys();

    //dont allow player body gravity
    player.body.allowGravity = false
    player.setSize(90, 200, true)


}

function spawnEnemy() {
    if (!enemySpawned) {
        let enemy = vehicleSpawn("FishVan");


        if (enemy != null) {
            FishVan = enemy
            enemyGroup.add(enemy);
            enemy.setVelocityY(100);
            enemySpawned = true;
        }

    }
}

function spawnObstacleVehicles() {
    // Random number between 0 - 1
    let carOrBikeRandomiser = Phaser.Math.Between(0, 1);

    // declare empty string to assign car or bike name to
    let carOrBike = "";

    // set either car or bike depending on randomiser
    if (carOrBikeRandomiser === 0) {
        carOrBike = "MotorbikeG";
    } else if (carOrBikeRandomiser === 1) {
        carOrBike = "car";
    }

    let newVehicle = vehicleSpawn(carOrBike);


    if (newVehicle != null) {
        vehicleGroup.add(newVehicle);
        newVehicle.setVelocityY(100);
        let randomColor = Phaser.Math.Between(0x000000, 0xFFFFFF);
        newVehicle.setTint(randomColor);
    }
}

function vehicleSpawn(vehicleType) {
    // generate random lane number
    let laneNumber = Phaser.Math.Between(0, 3);
    //check is the lane free - if it is then add true to laneNumber if not return null
    if (laneOccupation[laneNumber] == true) {
        return null; // if lane is occupied stop function
    }

    newVehicle = currentScene.physics.add.image(spawnPoint[laneNumber], 100, vehicleType);
    newVehicle.myLane = laneNumber
    newVehicle.type = vehicleType
    laneOccupation[laneNumber] = true


    newVehicle.setSize(100, 200, true)
    newVehicle.setScale(0.5);
    newVehicle.body.allowGravity = false;
    //new
    //newVehicle.myType= vehicleType; //after checking collision use if statement my type = fishvan

    return newVehicle;
}

//this function will destroy the vehicles when it overlaps with the edge, clearing a 
//space in lane for next spawned car
function DestroyVehicle(edge, vehicle) {
    vehicle.destroy();
    laneOccupation[vehicle.myLane] = false;
    if (vehicle.type == "FishVan") {
        enemySpawned = false;
    }
}

function InitialiseStartUI() {
    //add background for start UI
    background = currentScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "road")
    //add text to start screen that will show instrustions and "click to start"
    currentScene.add.text(200, 200, "PIZZA SPY!!", h1textConfig)
    startUI = currentScene.add.text(250, 350, "Click to start", textConfig)
}

function InitialiseScoreUI() {
    //while playing the game, show the score and the health of the player
    //scoreUI = currentScene.add.text(350, 600, "Score: " + score, textConfig)
    scoreUI = currentScene.add.text(16, 16, "Score: " + score, textConfig)
    healthUI = currentScene.add.text(16, 100, "Player Health: " + playerHealth + "%", textConfig)
}

function InitialiseEndUI() {
    //once game is over, show text that says "game over"
    background = currentScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "road")
    endUI = currentScene.add.text(200, 300, "Game Over!", h1textConfig)
}

function playerTap() {
    if (gameState == 0) {
        StartGame();
        InitialiseScoreUI()
        gameState = 1
    } else if (gameState == 1) {
        throwPizza()
    } else if (gameState == 2) {
        worldEdges.destroy();
        //background.destroy();
        endUI.destroy();
        InitialiseStartUI();

        gameState = 0;
    }
}

function throwPizza() {
    newPizza = currentScene.physics.add.image(player.x, player.y, "pizza")
    pizzaGroup.add(newPizza)
    newPizza.setVelocityY(-100)
    newPizza.setScale(0.1)

}

function pizzaContact(pizza, vehicle) {
    pizza.destroy()
    if (vehicle.type == "FishVan") {
        score += 100
    } else {
        score -= 100

    }
    scoreUI.setText("score: " + score)
    DestroyVehicle(null, vehicle);
}

function destroyPizza(edge, pizza) {
    pizza.destroy()
}
//deletes vehicle on contact and stops game
function gotContact(player, vehicle) {
    score -= 10;
    playerHealth -= 10;
    healthUI.setText("Player Health: " + playerHealth + "%");
    scoreUI.setText("score: " + score);

    // if (vehicle.type == "car") {
    //     gameOver()
    //     return;
    // }

    DestroyVehicle(null, vehicle);

}

function enemyCollision(){
    console.log("collide")
}


// When player dies/health = 0 call this function
function gameOver() {
    player.destroy();
    roadOne.destroy();
    roadTwo.destroy();
    scoreUI.destroy();
    healthUI.destroy();
    spawnVehicleEvent.remove(false);
    spawnEnemyEvent.remove(false);
    InitialiseEndUI();
    gameState = 2;
}