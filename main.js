var grid = document.querySelector('.grid')
var root = document.querySelector(':root')
const GRID_SIZE = 4;
var DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]]
var DIRECTIONS_KEYS = {u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0]}
var EXTENDED_DIRECTIONS = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]

var hasFinishedBlocks = false
var blocks = []

root.style.setProperty('--grid-size', GRID_SIZE)

var numberCounts = [0, 0, 0, 0, 0]

for (var y = 0; y < GRID_SIZE; y++) {
    for (var x = 0; x < GRID_SIZE; x++) {
        let tile = document.createElement('div')
        tile.id = `${x}-${y}`
        tile.classList.add('tile')


        // // get valid numbers for tile
        // var validNumbers = [1, 2, 3, 4, 5]
        // for (let direction of EXTENDED_DIRECTIONS) {
        //     var otherTileCoords = [x + direction[0], y + direction[1]]
        //     var otherTile = GetTileFromCoords(otherTileCoords)

        //     if (otherTile) {
        //         let otherTileNumber = parseInt(otherTile.querySelector('p').innerHTML)
        //         if (validNumbers.includes(otherTileNumber)) {
        //             validNumbers.splice(validNumbers.indexOf(otherTileNumber), 1)
        //         }
        //     }
        // }

        let number = document.createElement('p')

        // if (numberCounts.reduce((a, b) => a + b) % 6 != 0) {
        //     let tempCounts = [...numberCounts].map((v, i) => [i, v])
        //     let minimumCount = tempCounts.sort((a, b) => a[1] > b[1])[0][1]
        //     tempCounts = tempCounts.filter((v) => v[1] == minimumCount) .map((v) => v[0])
        //     validNumbers.sort((a, b) => tempCounts.indexOf(a - 1) > tempCounts.indexOf(b - 1))
        // }
        // chosenNumber = validNumbers[Math.round(Math.random() * (validNumbers.length - 1))]

        // number.innerHTML = chosenNumber

        // numberCounts[chosenNumber - 1] += 1

        // console.log(numberCounts)

        tile.appendChild(number)
        grid.appendChild(tile)
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
    // let availableTiles = GRID_SIZE * GRID_SIZE
    // for (let block of blocks) {
    //     availableTiles -= block.tiles.length
    // }
    // return availableTiles
    let availableTiles = GRID_SIZE * GRID_SIZE
    for (let tile of grid.children) {
        if (IsTileTaken(tile.id)) {
            availableTiles -= 1
        }
    }
    return availableTiles
}
function IsTileTaken(tileString) {
    // for (let block of blocks) {
    //     if (block.tiles.includes(tileString)) {
    //         return true
    //     }
    // }
    // return false
    let tile = GetTileFromCoords(tileString)
    let number = tile.querySelector('p').innerHTML

    return number != ''
}
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
function GetBlockFromTile(tile) {
    for (let block of blocks) {
        if (block.tiles.includes(tile.id)) {
            return block
        }
    }
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
    for (let tile of grid.children) {
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
            
            if (!IsTileTaken(CoordsToString(newTile)) && !blockTiles.includes(CoordsToString(newTile))) {
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

function PlaceBlockRecursive(blocks, recursiveIndex) {
    iterationCount += 1

    var availableSpace = GetAvailableTilesCount()

    if (availableSpace == 0) {
        return true
    }

    //get starting tile for block
    var initialTile = [0, 0]
    while (IsTileTaken(CoordsToString(initialTile))) {
        var tileIndex = CoordsToIndex(initialTile)
        initialTile[0] = (tileIndex + 1) % GRID_SIZE
        initialTile[1] = Math.floor((tileIndex + 1) / GRID_SIZE)
    }

    var maxBlockSize = Math.min(availableSpace, 5)

    var possibleBlockSizes = [1, 2, 3, 4, 5].filter((v) => v <= maxBlockSize)

    shuffleArray(possibleBlockSizes)

    for (let blockSize of possibleBlockSizes) {
        //for (let i = 0; i < 5; i++) {
            let blockTiles = GenerateRandomBlock(initialTile, blockSize)
            
            var blockPossibilites = GeneratePossibilities(blockTiles.length)
            shuffleArray(blockPossibilites)

            for (let possibility of blockPossibilites) {
                blockTiles.forEach((v, i) => {
                    let tile = GetTileFromCoords(v)
                    tile.querySelector('p').innerHTML = possibility[i]
                })
                if (IsGridValid()) {
                    //console.log(recursiveIndex, '------ FOUND VALID GRID -----')
                    //console.log(blockTiles)
                    //console.log('possibility:', possibility)
                    if (PlaceBlockRecursive(blocks, recursiveIndex + 1)) {
                        console.warn(recursiveIndex, '-------- SUCCESS -------')
                        blocks.push({
                            tiles: blockTiles
                        })
                        return true
                    }
                }
            }

            blockTiles.forEach((v, i) => {
                let tile = GetTileFromCoords(v)
                tile.querySelector('p').innerHTML = ''
            })
        //}
    }

    return false
}

// var result = false;
// while (!result) {
//     result = PlaceBlockRecursive()
// }
PlaceBlockRecursive(blocks, 1)

// while (true) {
//     var availableSpace = GetAvailableTilesCount()

//     // once the whole grid has been filled you can exit the loop
//     if (availableSpace == 0) {
//         break
//     }
    
//     // get starting tile for block
//     var initialTile = [0, 0]
//     while (IsTileTaken(CoordsToString(initialTile))) {
//         var tileIndex = CoordsToIndex(initialTile)
//         initialTile[0] = (tileIndex + 1) % GRID_SIZE
//         initialTile[1] = Math.floor((tileIndex + 1) / GRID_SIZE)
//     }

//     // get valid block size
//     var maxBlockSize = Math.min(availableSpace, 5)

//     // // find invalid block sizes
//     // invalidBlockSizes = []
//     // for (let direction of EXTENDED_DIRECTIONS) {
//     //     let newTileCoords = [initialTile[0] + direction[0], initialTile[1] + direction[1]]
//     //     if (!IsValidCoordinate(newTileCoords)) {
//     //         continue
//     //     }

//     //     let newTileBlock = GetBlockFromTile(GetTileFromCoords(newTileCoords))

//     //     if (newTileBlock && newTileBlock.tiles.length < 4) {
//     //         invalidBlockSizes.push(newTileBlock.tiles.length)
//     //     }
//     // }

//     // while (true) {
//     //     blockSize = Math.round(Math.random() * maxBlockSize) + 1

//     //     // check that block does not have the same size as any of the blocks around it
//     //     if (!invalidBlockSizes.includes(blockSize) || availableSpace < 4) {
//     //         break
//     //     }
//     // }
//     // console.log(initialTile, invalidBlockSizes, blockSize)

//     var possibleBlockSizes = [1, 2, 3, 4, 5].filter((v) => v <= maxBlockSize)
//     var initalPossibleSizes = possibleBlockSizes.length
//     var foundValidBlock = false

//     for (let i = 0; i < initalPossibleSizes; i++) {
//         var blockSize = possibleBlockSizes[Math.round(Math.random() * possibleBlockSizes.length)]
//         var blockTiles = GenerateRandomBlock(initialTile, blockSize)
        
//         // fill in numbers blocks
//         var blockPossibilites = GeneratePossibilities(blockTiles.length)
//         shuffleArray(blockPossibilites)

//         var wasGameValid = false
//         for (let possibility of blockPossibilites) {
//             blockTiles.forEach((v, i) => {
//                 let tile = GetTileFromCoords(v)
//                 tile.querySelector('p').innerHTML = possibility[i]
//             })
//             if (IsGridValid()) {
//                 wasGameValid = true
//                 break
//             }
//         }

//         if (wasGameValid) {
//             foundValidBlock = true
//             break
//         }

//         possibleBlockSizes.splice(possibleBlockSizes.indexOf(blockSize), 1)
//     }

//     if (!foundValidBlock) {
//         console.warn('uh oh!')
//     }

//     blocks.push({
//         tiles: blockTiles
//     })
// }



for (let tile of grid.children) {
    // find the block the tile belongs to
    var tileBlock = GetBlockFromTile(tile)

    // this can be removed later as every tile should have a block
    if (tileBlock == null) {
        continue
    }

    for (let directionClass of ['u', 'd', 'l', 'r']) {
        var direction = DIRECTIONS_KEYS[directionClass]
        var tileCoords = StringToCoords(tile.id)
        var newTileCoords = [tileCoords[0] + direction[0], tileCoords[1] + direction[1]]
        if (tileBlock.tiles.includes(CoordsToString(newTileCoords))) {
            tile.classList.add(directionClass)
        }
    }
}

console.log(blocks)