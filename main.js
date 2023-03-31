const canvas = document.getElementById("gameview");
const ctx = canvas.getContext("2d");

// UTILITY
// Timing

var lastTick = Date.now();
// Returns (fractional) seconds since last tick
function timeDelta() {
    const t = Date.now();
    if (t < lastTick) {
        return 0;
    }
    return Math.min((t - lastTick)/1000, 100);
}

// DATA

/*
altitude in floors
speed in floors per second 
doorPosition = 0-1 door open-ness
*/
var elevators = [
{
    altitude: 2,
    speed: - 0.5,
    targetFloor: 5,
    state: 'moving',
    doorPosition: 0, 
},
{
    altitude: 7,
    speed: 1,
    targetFloor: 1,
    state: 'moving',
    doorPosition: 0, 
},
{
    altitude: 7.2,
    speed: -0.1,
    targetFloor: 7,
    state: 'moving',
    doorPosition: 0, 
}
]


// DRAWING

const numFloors = 10;
const floorHeight = 64;
let bottomFloorY = 1;
let leftX = 1;
let rightX = 1;

function drawLine(x, y, x2, y2)
{
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawElevators()
{
    const carHeight = 56;
    const carWidth = 36;

    let carNumber = 0;
    for (let elevator of elevators)
    {
        const floorY = bottomFloorY - (elevator.altitude * floorHeight + 2);
        const carLeftX = leftX + (carNumber * (carWidth + 16)) + 10;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(23, 23, 25)";
        ctx.beginPath();
        ctx.rect(carLeftX, floorY - carHeight, carWidth, carHeight);
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = "rgb(33, 33, 35)";
        var door1X = carLeftX + 2 + (1/2 - elevator.doorPosition/2) * (carWidth - 5);
        drawLine(door1X, floorY, door1X, floorY - carHeight);
        var door2X = carLeftX + 3 + (1/2 + elevator.doorPosition/2) * (carWidth - 5);
        drawLine(door2X, floorY, door2X, floorY - carHeight);

        carNumber++;
    }
}

function drawBackground()
{
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(50, 50, 60)";
    for (let f = 0; f < numFloors; f++)
    {
        const y = bottomFloorY - floorHeight * f;
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();
    }
}

// PHYSICS
function simulateElevators()
{
    for (let elevator of elevators)
    {
        let stoppingPosition = elevator.altitude + (Math.abs(elevator.speed)/0.2) * (elevator.speed/2);
        if (elevator.targetFloor > stoppingPosition)
            elevator.speed += 0.2 * timeDelta();
        else if (elevator.targetFloor < stoppingPosition)
            elevator.speed -= 0.2 * timeDelta();
        
        
        if (Math.abs(elevator.speed) > 1.5)
            elevator.speed = Math.sign(elevator.speed) * 1.5;

        elevator.altitude += elevator.speed * timeDelta();
    }
}

// LOGIC
function elevatorLogic()
{
    for (let elevator of elevators)
    {
        if (elevator.state == 'opening')
        {
            elevator.doorPosition = Math.min(1, elevator.doorPosition + 1.5 * timeDelta());
            if (elevator.doorPosition == 1)
            {
                elevator.state = 'arrived';
            }
        }

        if (elevator.state == 'closing')
        {
            elevator.doorPosition = Math.max(0, elevator.doorPosition - 1.5 * timeDelta());
            if (elevator.doorPosition == 0)
            {
                elevator.state = 'moving';
                elevator.targetFloor = Math.round(Math.random() * numFloors);
            }
        }

        if (elevator.state == 'arrived' && Math.random() < 0.1)
        {
            elevator.state = 'closing';
        }

        // Have we arrived somewhere?
        if (elevator.state == 'moving' && Math.abs(elevator.altitude - elevator.targetFloor) < 0.01 && Math.abs(elevator.speed) < 0.1)
        {
            elevator.altitude = elevator.targetFloor
            elevator.state = 'opening';
        }

    }
}

// FRAMEWORK

var paused = false;

function tick()
{
    if (paused)
        return; 

    bottomFloorY = canvas.height/4 * 3;
    leftX = canvas.width/3;
    rightX = leftX + canvas.width/3;

    simulateElevators();
    elevatorLogic();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawElevators();

    lastTick = Date.now();
}

setInterval(tick, 10);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize, false);
canvas.addEventListener('click', () => { paused = !paused; lastTick = Date.now(); }, false);
resize();