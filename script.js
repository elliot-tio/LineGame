const canvas = document.getElementById('canvas');
const leftEdge = canvas.offsetLeft + canvas.clientLeft;
const topEdge = canvas.offsetTop + canvas.clientTop;
const context = canvas.getContext('2d');
const lines = [];
const buffer = 5;

const player1 = {
    name: 'Player 1',
    color: 'blue'
}

const player2 = {
    name: 'Player 2',
    color: 'orange'
}

let currentPlayer = player1 ? player1 : player2;

canvas.addEventListener('click', function(event) {
    const x = event.pageX - leftEdge;
    const y = event.pageY - topEdge;

    // Collision detection between clicked offset and element.
    lines.forEach(function(line) {
        if (y > line.top && y < line.top + line.height 
            && x > line.left && x < line.left + line.width) {
            console.log('clicked an element');
            console.log(currentPlayer)
            context.fillStyle = currentPlayer.color;
            if(line.type === 'horizontal') {
                context.fillRect(line.left, line.top + buffer, line.width, line.height - (2 * buffer));
            } else if (line.type === 'vertical') {
                context.fillRect(line.left + buffer, line.top, line.width - (2 * buffer), line.height);
            }
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            // todo: if clicked, camt click again
            // todo: if completed box, color in box of player
            // todo: if completed box, player goes again
        }
    });
}, false);

// draw grid, start game
function drawGrid() {
    clearCanvas();
    context.fillStyle = 'black'
    let size = parseInt(document.getElementById('gridSize').value) + 1;
    context.strokeStyle = '#f0f0f0';

    // horizontal lines
    for (x = 1; x < size - 1; x++) {
        for (y = 1; y < size; y++) {
            context.strokeRect(canvas.width / size * x + 5, canvas.height / size * y - buffer, canvas.width / size - 5, 5 + (2 * buffer));
            lines.push({
                left: canvas.width / size * x + 5,
                top: canvas.height / size * y - buffer,
                width: canvas.width / size - 5,
                height: 5 + (2 * buffer),
                type: 'horizontal'
            })
        }
    }
    
    // vertical lines
    for (x = 1; x < size; x++) {
        for (y = 1; y < size - 1; y++) {
            context.strokeRect(canvas.width / size * x - buffer, canvas.height / size * y + 5, 5 + (2 * buffer), canvas.height / size - 5);
            lines.push({
                left: canvas.width / size * x - buffer,
                top: canvas.height / size * y + 5,
                width: 5 + (2 * buffer),
                height: canvas.height / size - 5,
                type: 'vertical'
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
}

drawGrid()