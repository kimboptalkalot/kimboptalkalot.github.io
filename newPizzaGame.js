let gameSettings =
{
    speed: 500,
    roadSpeed: 200,
    playerSpeed: 400,
}
let roadOne
let roadTwo
let roadGroup
let game
let gameConfig
let player
let currentScene;
let randomX;
let car;
let bike;

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


    currentScene.load.spritesheet("player", "images/Pizza_vanEDITED.png",
        { frameWidth: 109, frameHeight: 210 });

    currentScene.load.image("car", "images/Car_Monochrome.png")
    currentScene.load.image("bike", "images/motorcycle_yellow.png")
}

function create() {
    roadOne = UpdateRoad()
    roadTwo = UpdateRoad()
    roadTwo.y = -300

    player = currentScene.physics.add.sprite(230, 500, "player");
    player.setVelocityY(-60)
    player.setScale(0.5)
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
    cursors = currentScene.input.keyboard.createCursorKeys();
    player.body.allowGravity = false;
    player.setSize(90, 200, true);

    leftEdge = currentScene.add.rectangle(130, 600, 20, 1200, 0x000000)
    rightEdge = currentScene.add.rectangle(715, 600, 20, 1200, 0x000000)
    bottomEdge = currentScene.add.rectangle(600, 640, 1200, 20, 0x000000)
    topEdge = currentScene.add.rectangle(600, 10, 1200, 20, 0x000000)

    worldEdges = currentScene.physics.add.staticGroup();
    worldEdges.add(leftEdge);
    worldEdges.add(rightEdge);
    worldEdges.add(bottomEdge);
    worldEdges.add(topEdge)

    currentScene.physics.add.collider(player, worldEdges)



    spawnLane1()
    spawnLane2()
    spawnLane3()

}

function update() {
    if (roadOne.y > 950) {
        roadOne.y = -300
    }

    if (roadTwo.y > 950) {
        roadTwo.y = -300
    }

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

    if (car1.y > 600) {
        car1.y = 0
        car1.x = 228
    }

    if (bike.y > 600) {
        bike.y = 0
        bike.x = 348
    }
    if (car2.y > 600) {
        car2.y = 0
        car2.x = 478
    }


    // why are car and bike spawning at same places instead of randomX

}

function UpdateRoad() {
    let road = currentScene.physics.add.image(gameConfig.width / 2, gameConfig.height / 2, "road");
    roadGroup = currentScene.physics.add.group();
    roadGroup.add(road);
    road.setVelocityY(gameSettings.roadSpeed);
    road.body.allowGravity = false;
    return road;
}

function spawnLane1() {

    car1 = currentScene.physics.add.image(228, 0, "car");
    car1.setVelocityY(70);
    car1.setSize(100, 200, true);
    car1.setScale(0.5);
    let randomColor = Phaser.Math.Between(0x000000, 0xFFFFFF);
    car1.setTint(randomColor);
    randomX = Phaser.Math.Between(228, 608);
    currentScene.physics.add.collider(player, car1);
    //currentScene.physics.add.collider(car, worldEdges);
    //stopping car at bottom and not spawning again
}

function spawnLane2() {
    bike = currentScene.physics.add.image(348, 0, "bike");
    bike.setVelocityY(120);
    bike.setScale(0.5);
    let randomColor = Phaser.Math.Between(0x000000, 0xFFFFFF);
    bike.setTint(randomColor);
    currentScene.physics.add.collider(player, bike);
    currentScene.physics.add.collider(bike, worldEdges);
}

function spawnLane3(){
    car2 = currentScene.physics.add.image(478, 0, "car");
    car2.setVelocityY(30);
    car2.setSize(100, 200, true);
    car2.setScale(0.5);
    let randomColor = Phaser.Math.Between(0x000000, 0xFFFFFF);
    car2.setTint(randomColor);
    randomX = Phaser.Math.Between(228, 608);
    currentScene.physics.add.collider(player, car2);
}

