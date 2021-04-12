const canvas = document.getElementById('canvas');
const leftEdge = canvas.offsetLeft + canvas.clientLeft;
const topEdge = canvas.offsetTop + canvas.clientTop;
const context = canvas.getContext('2d');
let lines = drawn = horizontalBoxLines = verticalBoxLines = [];
let boxes = {
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

let currentPlayer = player1 ? player1 : player2;

canvas.addEventListener('click', takeTurn, false);

// click event that draws edges for a player, triggered when a player clicks on an edge
function takeTurn(event) {
    const x = event.pageX - leftEdge;
    const y = event.pageY - topEdge;

    // Collision detection between clicked offset and element.
    lines.forEach((line, index) => {
        if (y > line.top && y < line.top + line.height 
            && x > line.left && x < line.left + line.width) {

            // if line was already drawn, don't draw it again
            if(drawn.includes(line)) return;
            // add line to drawn array so that the line won't be drawn over again
            drawn.push(line);

            context.fillStyle = currentPlayer.color;
            context.strokeStyle = 'black';

            if(line.type === 'horizontal') {
                // draw horizontal line
                context.fillRect(line.left, line.top + buffer, line.width, line.height - (2 * buffer));
                context.strokeRect(line.left, line.top + buffer + 1, line.width, line.height - (2 * buffer) - 2);
                // filter out lines that could possibly make a box with drawn line
                horizontalBoxLines = drawn.filter(hLine => hLine.type === 'horizontal' && hLine.x === line.x && Math.abs(hLine.y - line.y) <= 1);
            } else if (line.type === 'vertical') {
                // draw vertical line
                context.fillRect(line.left + buffer, line.top, line.width - (2 * buffer), line.height);
                context.strokeRect(line.left + buffer + 1, line.top, line.width - (2 * buffer) - 2, line.height);
                // filter out lines that could possibly make a box with drawn line
                verticalBoxLines = drawn.filter(vLine => vLine.type === 'vertical' && Math.abs(vLine.x - line.x) <= 1 && vLine.y === line.y);
            }

            // todo: if completed box, color in box of player - missing multiple box completion, there are bugs with the box creation
            let completedBox = false;
            // we've found at least 4 edges that make a box - fill in the box with the color of the player that completed it
            if(horizontalBoxLines.length + verticalBoxLines.length >= 4) {
                console.log(horizontalBoxLines, verticalBoxLines)
                let boxHeight = boxWidth = boxLeft = boxTop = 0;
                if(horizontalBoxLines.length >= 2) {
                    // more than one box completed
                }
                if(verticalBoxLines.length >= 2) {
                    // more than one box completed
                }

                // one box completed
                if(line.type === 'horizontal') {
                    boxHeight = verticalBoxLines[0].height;
                    boxWidth = line.width;
                    // get minimum values of left/top from vertical lines so we know where to fill the box from
                    boxLeft = verticalBoxLines.reduce((prev, curr) => prev.left < curr.left ? prev.left : curr.left);
                    boxTop = verticalBoxLines.reduce((prev, curr) => prev.top < curr.top ? prev.top : curr.top );
                    // todo: check if box was already filled
                    context.fillRect(boxLeft + buffer + 5, boxTop, boxWidth, boxHeight);
                    // push values to a boxes array under the player name, to check for win condition
                    boxes[currentPlayer.name].push({
                        left: boxLeft + buffer + 5,
                        top: boxTop,
                        width: boxWidth,
                        height: boxHeight
                    })
                } else if (line.type === 'vertical') {
                    boxHeight = line.height;
                    boxWidth = horizontalBoxLines[0].width;
                    // get minimum values of left/top from horizontal lines so we know where to fill the box from
                    boxLeft = horizontalBoxLines.reduce((prev, curr) => prev.left < curr.left ? prev.left : curr.left);
                    boxTop = horizontalBoxLines.reduce((prev, curr) => prev.top < curr.top ? prev.top : curr.top );
                    // todo: check if box was already filled
                    context.fillRect(boxLeft, boxTop + buffer + 5, boxWidth, boxHeight);
                    // push values to a boxes array under the player name, to check for win condition
                    boxes[currentPlayer.name].push({
                        left: boxLeft,
                        top: boxTop + buffer + 5,
                        width: boxWidth,
                        height: boxHeight
                    })
                }
                completedBox = true;
            }


            // when completing a box, check if the win condition has been met
            if(completedBox) {
                console.log('completed box!')
                if(boxes[currentPlayer.name].length >= winCond) {
                    context.fillStyle = 'red';
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

    // horizontal lines
    for (x = 1; x < size - 1; x++) {
        for (y = 1; y < size; y++) {
            lines.push({
                left: canvas.width / size * x + 5,
                top: canvas.height / size * y - buffer,
                width: canvas.width / size - 5,
                height: 5 + (2 * buffer),
                type: 'horizontal',
                x: x,
                y: y
            })
        }
    }

    
    // vertical lines
    for (x = 1; x < size; x++) {
        for (y = 1; y < size - 1; y++) {
            lines.push({
                left: canvas.width / size * x - buffer,
                top: canvas.height / size * y + 5,
                width: 5 + (2 * buffer),
                height: canvas.height / size - 5,
                type: 'vertical',
                x: x,
                y: y
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
    boxes = {
        "Player 1": [],
        "Player 2": []
    };
}

drawGrid()