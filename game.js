let game
let gameConfig
let background
let pizzaText
let backButton
let gameState = 0;
let startUI, scoreUI, endUI, healthUI, instructionsUI, tryAgainUI, menuUI
let score;
let playerHealth;
let worldEdges
let leftEdge
let rightEdge
let bottomEdge
let player
let FishVan
let newVehicle
let pizzaGroup
let enemyCollisionCoolDownCounter = 0;
let pizzaThrowCoolDownTimer = 0;
let explosion
let explosionGroup
let gameOverFX
let explodeFX
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
let spawnVehicleEvent;
let spawnEnemyEvent;
let spawnVehicleConfig = {
    delay: 1000,
    callback: spawnObstacleVehicles,
    repeat: -1
}

let spawnEnemyConfig = {
    delay: 2000,
    callback: spawnEnemy,
    repeat: -1
}

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

let instructionsTextConfig = {
    fontFamily: "Century Gothic",
    fontSize: "30px",
    strokeThickness: 2,
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
                debug: false,

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
    currentScene.load.image("car", "images/Car_Monochrome.png")
    currentScene.load.spritesheet("player", "images/Pizza_vanEDITED.png", {
        frameWidth: 109,
        frameHeight: 210
    });
    currentScene.load.image("MotorbikeG", "images/motorcycle_green.png");
    currentScene.load.image("FishVan", "images/FishChips.png")
    currentScene.load.image("RoadUI", "images/Toon Road Texture.png")
    currentScene.load.image("pizza", "images/pizza1.png")
    currentScene.load.image("explosion", "images/fire.png")
    currentScene.load.audio("gameOver", "sounds/gameOver.mp3")
    currentScene.load.audio("explode", "sounds/explosion1.mp3")
    currentScene.load.audio("backMusic", "sounds/backMusic.mp3")

}

function create() {
    InitialiseStartUI()
    gameOverFX = currentScene.sound.add("gameOver")
    explodeFX = currentScene.sound.add("explode")
    backFX = currentScene.sound.add("backMusic")
}

function StartGame() {
    backFX.play()
    backFX.setLoop(true)
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
    leftEdge = currentScene.add.rectangle(95, 600, 20, 1200)
    rightEdge = currentScene.add.rectangle(750, 600, 20, 1200)
    bottomEdge = currentScene.add.rectangle(600, 640, 1200, 20)
    topEdge = currentScene.add.rectangle(600, 10, 1200, 20)

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
    currentScene.physics.add.overlap(leftEdge, player, gameOver);
    currentScene.physics.add.overlap(rightEdge, player, gameOver);
    currentScene.physics.add.overlap(player, vehicleGroup, gotContact)
    currentScene.physics.add.overlap(pizzaGroup, vehicleGroup, pizzaContact)
    currentScene.physics.add.overlap(pizzaGroup, enemyGroup, pizzaContact)
    currentScene.physics.add.overlap(pizzaGroup, topEdge, destroyPizza)
    // currentScene.physics.add.overlap(worldEdges, enemyGroup, DestroyVehicle)
    //add events for spawning cars and enemies
    spawnVehicleEvent = currentScene.time.addEvent(spawnVehicleConfig)
    spawnEnemyEvent = currentScene.time.addEvent(spawnEnemyConfig)
    playerHealth = 100;
    score = 0;

    gameState = 1;
    InitialiseScoreUI();


    // destroy buttons
    if(tryAgainUI != null){
        tryAgainUI.destroy();
    }
    if(menuUI != null){
        menuUI.destroy();
    }
    
    startUI.destroy();
    instructionsUI.destroy();
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
            // if enemy hasnt hit player - velocity as normal
        } else if (enemyCollisionCoolDownCounter == 0) {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.play("straight");
        }

        if (cursors.space.isDown) {
            throwPizza();
        }

        if (enemySpawned) {
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

            if (player.x >= FishVan.x - 10 && player.x <= FishVan.x + 10) {
                FishVan.setVelocityX(0)
            }

            if (player.y < FishVan.y) {
                FishVan.setVelocityY(FishVan.body.velocity.y - enemySpeed)
            } else if (player.y > FishVan.y) {
                FishVan.setVelocityY(FishVan.body.velocity.y + enemySpeed)
            }

            if (player.y >= FishVan.y - 10 && player.y <= FishVan.y + 10) {
                FishVan.setVelocityY(0)
            }
        }
    }

    if (enemyCollisionCoolDownCounter > 0) {
        enemyCollisionCoolDownCounter--;
    }

    if (pizzaThrowCoolDownTimer > 0) {
        pizzaThrowCoolDownTimer--;
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

function spawnExplosion(x, y) {
    explosion = currentScene.physics.add.staticImage(x, y, "explosion")
    explosion.alpha = 0.5
    explosion.setScale(0.5)

    const explosionGroupConfig = {
        targets: explosion,
        alpha: 0,
        onComplete: function destroyExplosion() {
            explosion.destroy();
        }
    }

    currentScene.tweens.add(explosionGroupConfig)
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
    if(backButton != null){
        backButton.destroy();
    }
    //add background for start UI
    background = currentScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "road")
    //add text to start screen that will show instructions and "click to start"
    currentScene.add.text(200, 200, "PIZZA SPY!!", h1textConfig)
    startUI = currentScene.add.text(250, 350, "Click to start", textConfig)
    startUI.setInteractive({
        useHandCursor: true
    })
    startUI.on("pointerdown", StartGame)
    instructionsUI = currentScene.add.text(270, 420, "Instructions", textConfig)
    instructionsUI.setInteractive({
        useHandCursor: true
    })
    instructionsUI.on("pointerdown", Instructions)
}

function Instructions() {
    background = currentScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "road")
    backButton = currentScene.add.text(16, 50, "Back", textConfig)
    backButton.setInteractive({
        useHandCursor: true
    })
    backButton.on("pointerdown", InitialiseStartUI)
    instructionsUI.destroy()
    startUI.destroy()

    currentScene.add.text(200, 50, "PIZZA SPY!!", h1textConfig)
    currentScene.add.rectangle(200, 330, 1600, 300, 0x6EC07B)
    currentScene.add.text(50, 200, "Use the arrow keys to guide your pizza truck through", instructionsTextConfig)
    currentScene.add.text(50, 250, "traffic for as long as possible.", instructionsTextConfig)
    currentScene.add.text(50, 300, "Avoid moving cars and motorbikes.", instructionsTextConfig)
    currentScene.add.text(50, 350, "Use space button to shoot pizza.", instructionsTextConfig)
    currentScene.add.text(50, 400, "Watch out! another food truck may try to stop you!", instructionsTextConfig)
}

function InitialiseScoreUI() {
    //while playing the game, show the score and the health of the player
    scoreUI = currentScene.add.text(16, 16, "Score: " + score, textConfig)
    healthUI = currentScene.add.text(16, 100, "Player Health: " + playerHealth + "%", textConfig)
}

function InitialiseEndUI() {
    //once game is over, show text that says "game over"
    background = currentScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "road")
    endUI = currentScene.add.text(200, 300, "Game Over!", h1textConfig)
    tryAgainUI = currentScene.add.text(300, 400, "Try Again?", textConfig)
    tryAgainUI.setInteractive({
        useHandCursor: true
    })
    tryAgainUI.on("pointerdown", StartGame)
    menuUI = currentScene.add.text(350, 500, "Menu", textConfig)
    menuUI.setInteractive({
        useHandCursor: true
    })
    menuUI.on("pointerdown", InitialiseStartUI)
}

function throwPizza() {
    if (pizzaThrowCoolDownTimer == 0) {
        pizzaThrowCoolDownTimer = 60;
        newPizza = currentScene.physics.add.image(player.x, player.y, "pizza")
        pizzaGroup.add(newPizza)
        newPizza.setVelocityY(-100)
        newPizza.setScale(0.1)
    }
}

function pizzaContact(pizza, vehicle) {
    //destroy pizza image when off screen
    pizza.destroy()
    //set to 0 
    let scoreChange = 0
    if (vehicle.type == "FishVan") {
        //if the vehicle type is a fish van, use scorechange to add 100
        scoreChange = 100;
    } else {
        //else, -50 as we dont want to hit motorbikes/cars with pizzas
        scoreChange = 50;
    }
    //call the function contact vehicle to link the type of vehicle with
    //what we want the score to do
    contactVehicle(vehicle, scoreChange);
}

//this deletes the pizza image from screen
function destroyPizza(edge, pizza) {
    pizza.destroy()
}

function contactVehicle(vehicle, scoreChange) {
    if(gameState === 1){
        //if the vehicle is a fish van, add score, if motorbike, minus score
        //if its a car then end game
        if (vehicle.type == "FishVan") {
            score += scoreChange
        } else if(score > 0) {
            score -= scoreChange;
        }

        scoreUI.setText("score: " + score);
        spawnExplosion(vehicle.x, vehicle.y);
        DestroyVehicle(null, vehicle);
        explodeFX.play()

        if (vehicle.type == "car") {
            gameOver()
            return;
        }
    }
}

//deletes vehicle on contact and stops game
function gotContact(player, vehicle) {
    lowerPlayerHealth(10)
    contactVehicle(vehicle, 10)
}

//function that takes in health parameter and takes away health or ends game
//if health goes past 0
//also sets UI health text to say what the player health currently is
function lowerPlayerHealth(health) {
    playerHealth -= health
    if (playerHealth <= 0) {
        gameOver();
        return;
    }

    healthUI.setText("Player Health: " + playerHealth + "%");
}

function enemyCollision() {
    //this counter will stop collider for one second so that there are not lots of
    //hits, and decreases points every 1 second
    if (enemyCollisionCoolDownCounter == 0) {
        let playerXV = player.body.velocity.x
        enemyCollisionCoolDownCounter = 60;
        if(score > 0){
            score -= 10
        }
        lowerPlayerHealth(20)

        // makes sure game didn't end in lowerPlayerHealth before trying to do anything else
        if(gameState === 1) {
            scoreUI.setText("score: " + score);
            //if the enemys x is more than player - rammed to right
            if (FishVan.x > player.x) {
                player.setVelocityX(playerXV - 50)
            }
            //if the enemys x is less than player - rammed to left
            else if (FishVan.x < player.x) {
                player.setVelocityX(playerXV + 50)
            }
        }
    }
}

function gameOver() {
    gameOverFX.play()
    backFX.stop()
    player.destroy();
    roadOne.destroy();
    roadTwo.destroy();
    scoreUI.destroy();
    healthUI.destroy();
    spawnVehicleEvent.remove(false);
    spawnEnemyEvent.remove(false);
    InitialiseEndUI();
    gameState = 2;

    if(enemySpawned){
        FishVan.destroy();
        enemySpawned = false;
    }

    laneOccupation = [false, false, false, false]
}