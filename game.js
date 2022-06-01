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
    currentScene.load.spritesheet("player", "images/PizzaSprite.png", {
        frameWidth: 109,
        frameHeight: 210
    });
    currentScene.load.image("MotorbikeG", "images/motorcycle_green.png");
    currentScene.load.image("FishVan", "images/FishChips.png")
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
    roadOne = UpdateRoad()
    roadTwo = UpdateRoad()
    roadTwo.y = -300
    InitialisePlayer()

    vehicleGroup = currentScene.physics.add.group()
    enemyGroup = currentScene.physics.add.group()
    pizzaGroup = currentScene.physics.add.group()
    worldEdges = currentScene.physics.add.staticGroup()

    leftEdge = currentScene.add.rectangle(95, 600, 20, 1200)
    rightEdge = currentScene.add.rectangle(750, 600, 20, 1200)
    bottomEdge = currentScene.add.rectangle(600, 640, 1200, 20)
    topEdge = currentScene.add.rectangle(600, 10, 1200, 20)

    worldEdges.add(leftEdge)
    worldEdges.add(rightEdge)
    worldEdges.add(bottomEdge);
    worldEdges.add(topEdge)

    currentScene.physics.add.collider(player, bottomEdge)
    currentScene.physics.add.collider(player, topEdge)
    currentScene.physics.add.collider(player, enemyGroup, enemyCollision)
    currentScene.physics.add.collider(worldEdges, enemyGroup)
    currentScene.physics.add.overlap(bottomEdge, vehicleGroup, DestroyVehicle)
    currentScene.physics.add.overlap(leftEdge, player, gameOver);
    currentScene.physics.add.overlap(rightEdge, player, gameOver);
    currentScene.physics.add.overlap(player, vehicleGroup, gotContact)
    currentScene.physics.add.overlap(pizzaGroup, vehicleGroup, pizzaContact)
    currentScene.physics.add.overlap(pizzaGroup, enemyGroup, pizzaContact)
    currentScene.physics.add.overlap(pizzaGroup, topEdge, destroyPizza)

    spawnVehicleEvent = currentScene.time.addEvent(spawnVehicleConfig)
    spawnEnemyEvent = currentScene.time.addEvent(spawnEnemyConfig)

    playerHealth = 100;
    score = 0;
    gameState = 1;

    InitialiseScoreUI();

    if (tryAgainUI != null) {
        tryAgainUI.destroy();
    }
    if (menuUI != null) {
        menuUI.destroy();
    }

    startUI.destroy();
    instructionsUI.destroy();
}

function update() {
    if (gameState == 1) {
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
    let road = currentScene.physics.add.image(gameConfig.width / 2, gameConfig.height / 2, "road");
    roadGroup = currentScene.physics.add.group()
    roadGroup.add(road)
    road.setVelocityY(gameSettings.roadSpeed)
    road.body.allowGravity = false
    return road;
}


function InitialisePlayer() {
    player = currentScene.physics.add.sprite(230, 500, "player");
    player.setVelocityY(-60)
    player.setScale(0.5);

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

    cursors = currentScene.input.keyboard.createCursorKeys();

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
    let carOrBikeRandomiser = Phaser.Math.Between(0, 1);
    let carOrBike = "";

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
    let laneNumber = Phaser.Math.Between(0, 3);

    if (laneOccupation[laneNumber] == true) {
        return null;
    }

    newVehicle = currentScene.physics.add.image(spawnPoint[laneNumber], 100, vehicleType);
    newVehicle.myLane = laneNumber
    newVehicle.type = vehicleType
    laneOccupation[laneNumber] = true
    newVehicle.setSize(100, 200, true)
    newVehicle.setScale(0.5);
    newVehicle.body.allowGravity = false;
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

function DestroyVehicle(edge, vehicle) {
    vehicle.destroy();
    laneOccupation[vehicle.myLane] = false;
    if (vehicle.type == "FishVan") {
        enemySpawned = false;
    }
}

function InitialiseStartUI() {
    if (backButton != null) {
        backButton.destroy();
    }

    background = currentScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "road")
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
    scoreUI = currentScene.add.text(16, 16, "Score: " + score, textConfig)
    healthUI = currentScene.add.text(16, 100, "Player Health: " + playerHealth + "%", textConfig)
}

function InitialiseEndUI() {
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
    pizza.destroy()
    let scoreChange = 0

    if (vehicle.type == "FishVan") {
        scoreChange = 100;
    } else {
        scoreChange = 50;
    }

    contactVehicle(vehicle, scoreChange);
}

function destroyPizza(edge, pizza) {
    pizza.destroy()
}

function contactVehicle(vehicle, scoreChange) {
    if (gameState === 1) {
        if (vehicle.type == "FishVan") {
            score += scoreChange
        } else if (score > 0) {
            score -= scoreChange;
        }

        explodeFX.play()
        scoreUI.setText("score: " + score);
        spawnExplosion(vehicle.x, vehicle.y);
        DestroyVehicle(null, vehicle);

        if (vehicle.type == "car") {
            gameOver()
            return;
        }
    }
}

function gotContact(player, vehicle) {
    lowerPlayerHealth(10)
    contactVehicle(vehicle, 10)
}

function lowerPlayerHealth(health) {
    playerHealth -= health
    if (playerHealth <= 0) {
        gameOver();
        return;
    }

    healthUI.setText("Player Health: " + playerHealth + "%");
}

function enemyCollision() {
    if (enemyCollisionCoolDownCounter == 0) {
        let playerXV = player.body.velocity.x
        enemyCollisionCoolDownCounter = 60;
        if (score > 0) {
            score -= 10
        }

        lowerPlayerHealth(20)

        if (gameState === 1) {
            scoreUI.setText("score: " + score);

            if (FishVan.x > player.x) {
                player.setVelocityX(playerXV - 50)
            } else if (FishVan.x < player.x) {
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

    if (enemySpawned) {
        FishVan.destroy();
        enemySpawned = false;
    }

    laneOccupation = [false, false, false, false]
}