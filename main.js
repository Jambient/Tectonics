var gridElement = document.querySelector('.grid')
var root = document.querySelector(':root')
const GRID_SIZE = 5;
var DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]]
var DIRECTIONS_KEYS = {u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0]}
var EXTENDED_DIRECTIONS = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]

var hasFinishedBlocks = false
var blocks = []
var grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0))

root.style.setProperty('--grid-size', GRID_SIZE)


for (var y = 0; y < GRID_SIZE; y++) {
    for (var x = 0; x < GRID_SIZE; x++) {
        let tile = document.createElement('div')
        tile.id = `${x}-${y}`
        tile.classList.add('tile')

        let number = document.createElement('p')

        tile.appendChild(number)
        gridElement.appendChild(tile)
    }
}

function GeneratePossibilities(n) {
    var combinations = []

    for (let i = 1; i < n + 1; i++) {
        runPossibilityStep([i], n, combinations)
    }

    return combinations
}

function runPossibilityStep(current, n, combinations) {
    if (current.length == n) {
        combinations.push(current)
        return
    }
    for (let i = 1; i < n + 1; i++) {
        if (!current.includes(i)) {
            runPossibilityStep(current.concat([i]), n, combinations)
        }
    } 
}

function GetAvailableTilesCount() {
    let availableTiles = (GRID_SIZE * GRID_SIZE) - blocks.reduce((partialSum, a) => partialSum + a.length, 0);
    
    return availableTiles
}
// function IsTileAvailable(tileString) {
//     for (let block of blocks) {
//         if (block.includes(tileString)) {
//             return false
//         }
//     }

//     return true
// }
function CoordsToString(coords) {
    return `${coords[0]}-${coords[1]}`
}
function CoordsToIndex(coords) {
    return coords[0] + coords[1]*GRID_SIZE
}
function StringToCoords(string) {
    return string.split('-').map((s) => {return parseInt(s)})
}

function GetTileFromCoords(coords) {
    var coordsString = coords
    if (typeof(coords) == 'object') {
        coordsString = CoordsToString(coords)
    }
    return document.getElementById(coordsString)
}

function GetBlockFromCoords(coords) {
    stringCoords = CoordsToString(coords)

    for (let block of blocks) {
        if (block.includes(stringCoords)) {
            return block
        }
    }

    return false
}

function IsValidCoordinate(coords) {
    if (coords[0] < 0 || coords[0] >= GRID_SIZE || coords[1] < 0 || coords[1] >= GRID_SIZE) {
        return false
    }
    return true
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function IsGridValid() {
    for (let tile of grid) {
        let number = tile.querySelector('p').innerHTML
        let currentTileCoords = StringToCoords(tile.id)

        if (number != '') {
            for (let direction of EXTENDED_DIRECTIONS) {
                let otherTileCoords = [currentTileCoords[0] + direction[0], currentTileCoords[1] + direction[1]]
                if (IsValidCoordinate(otherTileCoords)) {
                    let otherTile = GetTileFromCoords(otherTileCoords)
                    let otherTileNumber = otherTile.querySelector('p').innerHTML

                    if (otherTileNumber == number) {
                        return false
                    }
                }
            }
        } else {
            break
        }
    }

    return true
}

function GenerateRandomBlock(initialTile, blockSize) {
    var blockTiles = [CoordsToString(initialTile)]
    var currentTile = initialTile
    var currentPath = [currentTile]
    
    while (blockTiles.length < blockSize) {
        shuffleArray(DIRECTIONS)

        var success = false
        for (let direction of DIRECTIONS) {
            var newTile = [currentTile[0] + direction[0], currentTile[1] + direction[1]]
            
            if (!IsValidCoordinate(newTile)) {
                continue
            }
            
            if (!GetBlockFromCoords(newTile) && !blockTiles.includes(CoordsToString(newTile))) {
                success = true
                currentPath.push(newTile)
                blockTiles.push(CoordsToString(newTile))
                currentTile = newTile
                break
            }
        }
        if (!success) {
            currentPath.pop()
            if (currentPath.length > 0) {
                currentTile = currentPath[currentPath.length - 1]
            } else {
                blockSize = blockTiles.length
            }
        }
    }

    return [...blockTiles]
}

function GetTimer(name) {
    const startTime = Date.now();

    return {
        startTime: startTime,
        name: name,
        End: function() {
            console.log('Timer ' + name + ': ' + (Date.now() - startTime) + ' milliseconds');
        }
    };
}

var startTime = Date.now()
var iterationCount = 0
blocks = []

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function GenerateBlocks() {
    blocks = []

    while (GetAvailableTilesCount() > 0) {
         //get starting tile for block
        var initialTile = [0, 0]
        while (GetBlockFromCoords(initialTile)) {
            var tileIndex = CoordsToIndex(initialTile)
            initialTile[0] = (tileIndex + 1) % GRID_SIZE
            initialTile[1] = Math.floor((tileIndex + 1) / GRID_SIZE)
        }

        var minBlockSize = 1

        // for (let direction of EXTENDED_DIRECTIONS) {
        //     let otherCoords = [initialTile[0] + direction[0], initialTile[1] + direction[1]]
        //     let block = GetBlockFromCoords(otherCoords)

        //     if (block && block.length == 1) {
        //         minBlockSize = 2
        //         break
        //     }
        // }

        var maxBlockSize = Math.min(GetAvailableTilesCount(), 5)
        // if (minBlockSize > maxBlockSize) {
        //     return false
        // }

        // var possibleBlockSizes = [1, 2, 3, 4, 5].filter((v) => v <= maxBlockSize)
        // shuffleArray(possibleBlockSizes)

        var blockSize = getRandomInt(minBlockSize, maxBlockSize)
        let blockTiles = GenerateRandomBlock(initialTile, blockSize)

        blocks.push(blockTiles)
    }

    return true
}

function ClearTileContent() {
    blocks.forEach((block) => {
        block.forEach((v) => {
            let tile = GetTileFromCoords(v)
            tile.querySelector('p').innerHTML = ''
        })
    }) 
}

function GetGridPossibleValues() {
    let possibleValues = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill([]))

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            var values = []
            if (grid[y][x] <= 0) {
                var block = GetBlockFromCoords([x, y])
                values = Array(block.length).fill(1).map((_, i) => (i + 1))
                
                blocked = []
                for (let direction of EXTENDED_DIRECTIONS) {
                    let otherCoords = [x + direction[0], y + direction[1]]
                    let value = IsValidCoordinate(otherCoords) ? grid[otherCoords[1]][otherCoords[0]] : 0
                    if (value > 0) {
                        blocked.push(value)
                    }
                }

                block.forEach((s) => {
                    let coord = StringToCoords(s)
                    let value = grid[coord[1]][coord[0]]
                    if (value > 0) {
                        blocked.push(value)
                    }
                })

                values = values.filter((n) => !blocked.includes(n))
            }
            possibleValues[y][x] = values
        }
    }

    return possibleValues
}

function calculatePoints(value, x, y, possibleValues) {
    let points = 0

    for (let direction of EXTENDED_DIRECTIONS) {
        let otherCoords = [x + direction[0], y + direction[1]]
        if (IsValidCoordinate(otherCoords) && possibleValues[otherCoords[1]][otherCoords[0]].includes(value)) {
            points += 1
        }
    }

    return points
}

function recursiveSolve() {
    // check if grid is filled
    let availableTiles = GRID_SIZE * GRID_SIZE

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] > 0) {
                availableTiles -= 1
            }
        }
    }

    if (availableTiles == 0) {
        return true
    }

    // generate possible values for every cell
    let possibleValues = GetGridPossibleValues()
    let options = []

    // get options
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (possibleValues[y][x].length == 0) {
                if (grid[y][x] <= 0) {
                    // no possible values for a tile
                    return false
                }
            } else {
                options.push({
                    values: possibleValues[y][x],
                    x: x,
                    y: y
                })
            }
        }
    }

    options.sort(function(a, b) {
        return a.values.length - b.values.length
    })

    let selectedOption = options[0]
    let values = selectedOption.values

    // sort values by points system with best value first
    values.sort(function(a, b) {
        return calculatePoints(a, selectedOption.x, selectedOption.y, possibleValues) - calculatePoints(b, selectedOption.x, selectedOption.y, possibleValues)
    })

    for (let value of values) {
        grid[selectedOption.y][selectedOption.x] = value
        if (recursiveSolve()) {
            return true
        } else {
            grid[selectedOption.y][selectedOption.x] = 0
        }
    }

    return false
}

function SolveGrid() {
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0))

    return recursiveSolve()
}

// generate valid puzzle
do {
    let valid = false
    while (!valid) {
        valid = GenerateBlocks()
    }

    blocks.sort(function(a, b) {
        return a.length - b.length
    })
}
while (!SolveGrid())

for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
        // find the block the tile belongs to
        var tileBlock = GetBlockFromCoords([x, y])
        var tile = GetTileFromCoords([x, y])
        tile.innerHTML = grid[y][x]

        for (let directionClass of ['u', 'd', 'l', 'r']) {
            var direction = DIRECTIONS_KEYS[directionClass]
            var tileCoords = [x, y]
            var newTileCoords = [tileCoords[0] + direction[0], tileCoords[1] + direction[1]]
            if (tileBlock.includes(CoordsToString(newTileCoords))) {
                tile.classList.add(directionClass)
            }
        }
    }
}