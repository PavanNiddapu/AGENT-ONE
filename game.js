// Initialize Kaboom
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1], // Black background
    canvas: document.querySelector("#game-canvas"),
});

// Constants
const SPEED = 200;
const JUMP_FORCE = 550;
const BULLET_SPEED = 400;
const ENEMY_SPEED = 100;

scene("main", () => {
    let lastDirection = "right";
    let score = 0;

    // Score UI
    const scoreLabel = add([
        text("Score: " + score),
        pos(24, 24),
    ]);

    // Player
    const player = add([
        rect(32, 32),
        pos(width() / 4, 0),
        color(255, 255, 255), // White
        origin("center"),
        body(),
        "player",
    ]);

    // Ground
    add([
        rect(width(), 20),
        pos(0, height() - 20),
        solid(),
        area(),
    ]);

    // Platforms
    const platforms = [
        { x: 200, y: height() - 100, width: 150 },
        { x: 500, y: height() - 200, width: 150 },
        { x: 350, y: height() - 300, width: 150 },
    ];

    for (const platform of platforms) {
        add([
            rect(platform.width, 20),
            pos(platform.x, platform.y),
            solid(),
            area(),
        ]);
    }

    // Patrol component
    function patrol(speed = 60, range = 100) {
        let dir = 1;
        return {
            id: "patrol",
            require: ["pos"],
            add() {
                this.initialX = this.pos.x;
            },
            update() {
                this.move(speed * dir, 0);
                if (Math.abs(this.pos.x - this.initialX) > range / 2) {
                    dir = -dir;
                }
            },
        };
    }

    // Add enemies
    for (const platform of platforms) {
        add([
            rect(32, 32),
            pos(platform.x + platform.width / 2, platform.y - 20),
            color(255, 0, 0), // Red
            origin("center"),
            body(),
            solid(),
            area(),
            patrol(ENEMY_SPEED, platform.width),
            "enemy",
        ]);
    }


    // Player movement
    onKeyDown("left", () => {
        player.move(-SPEED, 0);
        lastDirection = "left";
    });

    onKeyDown("right", () => {
        player.move(SPEED, 0);
        lastDirection = "right";
    });

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
        }
    });

    // Shooting
    function shoot() {
        let bullet_direction = (lastDirection === "right" ? RIGHT : LEFT);
        add([
            rect(8, 8),
            pos(player.pos.x, player.pos.y),
            color(255, 255, 255), // White
            origin("center"),
            move(bullet_direction, BULLET_SPEED),
            cleanup(),
            area(),
            "bullet",
        ]);
    }

    onKeyPress("x", () => {
        shoot();
    });

    // Collision detection
    onCollide("bullet", "enemy", (bullet, enemy) => {
        destroy(bullet);
        destroy(enemy);
        score += 10;
        scoreLabel.text = "Score: " + score;
    });

    player.onCollide("enemy", () => {
        go("main"); // Restart the game
    });
});

go("main");
