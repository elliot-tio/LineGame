const canvas = document.getElementById('canvas');
const leftEdge = canvas.offsetLeft + canvas.clientLeft;
const topEdge = canvas.offsetTop + canvas.clientTop;
const context = canvas.getContext('2d');
let lines = drawn = horizontalBoxLines = verticalBoxLines = completedBoxesArray = [];
let drawnBoxes = {};
let completedBoxes = {
    "Player 1": [],
    "Player 2": []
};
const buffer = 5;
let winCond = 0;

const player1 = {
    name: 'Player 1',
    color: 'aqua'
}

const player2 = {
    name: 'Player 2',
    color: 'orange'
}

let currentPlayer = player1;

canvas.addEventListener('click', takeTurn, false);

// click event that draws edges for a player, triggered when a player clicks on an edge
function takeTurn(event) {
    const x = event.pageX - leftEdge;
    const y = event.pageY - topEdge;

    // Collision detection between clicked offset and element.
    lines.forEach((line) => {
        if (y > line.top && y < line.top + line.height 
            && x > line.left && x < line.left + line.width) {

            // if line was already drawn, don't draw it again
            if(drawn.includes(line)) return;

            context.fillStyle = currentPlayer.color;
            context.strokeStyle = 'black';

            if(line.type === 'horizontal') {
                // draw horizontal line
                context.fillRect(line.left, line.top + buffer, line.width, line.height - (2 * buffer));
                context.strokeRect(line.left, line.top + buffer + 1, line.width, line.height - (2 * buffer) - 2);
            } else if (line.type === 'vertical') {
                // draw vertical line
                context.fillRect(line.left + buffer, line.top, line.width - (2 * buffer), line.height);
                context.strokeRect(line.left + buffer + 1, line.top, line.width - (2 * buffer) - 2, line.height);
            }
            // add line to drawn array so that the line won't be drawn over again
            drawn.push(line);

            // new idea - check each drawn line, create array of boxes that are created by lines, fill in boxes
            drawn.forEach(line => {
                line.box.forEach(boxNum => {
                    if(boxNum in drawnBoxes) {
                        if(!drawnBoxes[boxNum].includes(line)) {
                            drawnBoxes[boxNum].push(line)
                        }
                    } else {
                        drawnBoxes[boxNum] = [line]
                    }
                })
            })

            let boxHeight = boxWidth = boxLeft = boxTop = 0;
            let completedBox = false;

            for(const boxNum in drawnBoxes) {
                // found a drawn box that has 4 edges that hasn't already been claimed
                if(drawnBoxes[boxNum].length === 4 && !completedBoxesArray.includes(boxNum)) {
                    completedBoxesArray.push(boxNum);
                    // filter out lines that could possibly make a box with drawn line
                    horizontalBoxLines = drawnBoxes[boxNum].filter(hLine => hLine.type === 'horizontal' && Math.abs(hLine.x - line.x) <= 1 && Math.abs(hLine.y - line.y) <= 1);
                    verticalBoxLines = drawnBoxes[boxNum].filter(vLine => vLine.type === 'vertical' && Math.abs(vLine.x - line.x) <= 1 && Math.abs(vLine.y - line.y) <= 1);

                    if(horizontalBoxLines.length >= 2 && verticalBoxLines.length >= 2) {
                        // we've found at least 4 edges that make a box - fill in the box with the color of the player that completed it
                        // one box completed
                        if(line.type === 'horizontal') {
                            boxHeight = verticalBoxLines[0].height;
                            boxWidth = line.width;
                            // get minimum values of left/top from vertical lines so we know where to fill the box from
                            boxLeft = verticalBoxLines.reduce((prev, curr) => prev.left < curr.left ? prev : curr).left;
                            boxTop = verticalBoxLines.reduce((prev, curr) => prev.top < curr.top ? prev : curr ).top;
                            // todo: check if box was already filled
                            context.fillRect(boxLeft + buffer + 5, boxTop, boxWidth, boxHeight);
                            // push values to a boxes array under the player name, to check for win condition
                            completedBoxes[currentPlayer.name].push(boxNum)
                        } else if (line.type === 'vertical') {
                            boxHeight = line.height;
                            boxWidth = horizontalBoxLines[0].width;
                            // get minimum values of left/top from horizontal lines so we know where to fill the box from
                            boxLeft = horizontalBoxLines.reduce((prev, curr) => prev.left < curr.left ? prev : curr).left;
                            boxTop = horizontalBoxLines.reduce((prev, curr) => prev.top < curr.top ? prev : curr).top;
                            // todo: check if box was already filled
                            context.fillRect(boxLeft, boxTop + buffer + 5, boxWidth, boxHeight);
                            // push values to a boxes array under the player name, to check for win condition
                            completedBoxes[currentPlayer.name].push(boxNum)
                        }
                    }
                    completedBox = true;
                }
            }
                
            // when completing a box, check if the win condition has been met
            // debugger
            if(completedBox) {
                if(completedBoxes[currentPlayer.name].length >= winCond) {
                    context.fillStyle = currentPlayer.color;
                    context.font = '50px verdana';
                    context.fillText(`${currentPlayer.name} has Won!`, 95, 55)
                    canvas.removeEventListener('click', takeTurn);
                }
            } else {
                // swap player if box not completed
                currentPlayer = currentPlayer === player1 ? player2 : player1;
            }
        }
    });
}

// draw grid, start game
function drawGrid() {
    clearCanvas();
    context.fillStyle = 'black'
    let size = parseInt(document.getElementById('gridSize').value);
    // win condition - minimum number of boxes required is 1 more than half the grid size
    winCond = Math.floor(((size - 1) * (size - 1)) / 2 + 1);
    size += 1;
    let box = [];
    let prevBox = 0;

    // bug - box logic only works for 3x3
    // horizontal lines
    for (x = 1; x < size - 1; x++) {
        for (y = 1; y < size; y++) {
            if(y === 1) {
                box = [prevBox, prevBox];
            } else if(y === size - 1) {
                box = [prevBox, prevBox];
                prevBox++;
            } else {
                box = [prevBox, prevBox + 1];
                prevBox++;
            }
            lines.push({
                left: canvas.width / size * x + 5,
                top: canvas.height / size * y - buffer,
                width: canvas.width / size - 5,
                height: 5 + (2 * buffer),
                type: 'horizontal',
                x: x,
                y: y,
                box: box
            })
        }
    }

    
    // vertical lines
    prevBox = 0;
    for (x = 1; x < size; x++) {
        for (y = 1; y < size - 1; y++) {
            if(x === 1) {
                box = [prevBox, prevBox];
                prevBox++;
            } else if(x === size - 1) {
                box = [prevBox  - ((size - 1) / 2) - 1, prevBox - ((size - 1) / 2) - 1];
                prevBox++;
            } else {
                box = [prevBox - ((size - 1) / 2) - 1, prevBox];
                prevBox++;
            }
            lines.push({
                left: canvas.width / size * x - buffer,
                top: canvas.height / size * y + 5,
                width: 5 + (2 * buffer),
                height: canvas.height / size - 5,
                type: 'vertical',
                x: x,
                y: y,
                box: box
            })
        }
    }

    // dots
    for (x = 1; x <= size; x++) {
        for (y = 1; y <= size; y++) {
            context.fillRect(canvas.width / size * x, canvas.height / size * y, 5, 5);
        }
    }
}

// clear canvas
function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    lines = [];
    drawn = [];
    horizontalBoxLines = [];
    verticalBoxLines = [];
    completedBoxes = {
        "Player 1": [],
        "Player 2": []
    };
    currentPlayer = player1;
    drawnBoxes = {};
    completedBoxesArray = [];
    winCond = 0;
    canvas.addEventListener('click', takeTurn);
}

drawGrid()