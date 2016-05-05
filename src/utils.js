const blackCharacter = '#';
const emptyCharacter = '*';
const easyReadBlack = '■';

const reg = new RegExp(blackCharacter,'gi');
let maximum_level_reached = 0;
// let lastPrint = Date.now();

function cloneObjOfArray( superObj ) {
    const newObj = {};
    for ( const key in superObj ) {
        newObj[key] = [...superObj[key]];
    }
    return newObj;
}

function printMatrix( matrix ) {
    console.log('\n\n'+matrix.join('\n').replace(reg,easyReadBlack));
}


export function fillBlanks( { index=0, structure, matrix, words }) {
    const { col , row, length, horizontal, intersections } = structure[index];
    const pointStatus = getPointStatus({ matrix, intersections });
    // Make return only the first valid word to try
    const validWords = pointStatus.length ?
                        getPossibleWords({ words : words[length], pointStatus })
                        : words[length];
    if ( validWords.length ) {
        return tryAllWords({ validWords, words, structure, index, matrix, col , row, length, horizontal });
    }
}

function tryAllWords({ validWords, words, structure, index, matrix, col , row, length, horizontal }) {
    if ( index > maximum_level_reached ) {
        maximum_level_reached = index;
        console.log('Reached level ',maximum_level_reached,'/',structure.length);
    }
    // let valid = [];
    for ( const word of validWords ) {
        // console.log(word);
        const newWords = cloneObjOfArray(words);
        // Remove the used word
        newWords[word.length].splice(newWords[word.length].indexOf(word),1);
        // Insert the word in the matrix
        const newMatrix = insertOnMatrix({ matrix, word, col, row, horizontal });
        // if ( index === maximum_level_reached && Date.now() > lastPrint+3000 ) {
        //     lastPrint = Date.now();
        //     console.log('Incomplete matrix (for testing) : ');
        //     printMatrix(newMatrix);
        // }
        if ( index+1 < structure.length ) {
            fillBlanks({
                index : index+1,
                matrix: newMatrix,
                words : newWords,
                structure
            });
        } else {
            printMatrix(newMatrix);
            // valid.push(newMatrix);
        }
    }
    // return valid;
}

function isAValidWord(pointStatus) {
    return ( word ) => {
        for ( const status of pointStatus ) {
            if ( word[status.pos] !== status.char ) {
                return false;
            }
        }
        return true;
    };
}

function getPossibleWords({ words, pointStatus }) {
    return words.filter(isAValidWord(pointStatus));
}

function getPointStatus( { matrix, intersections }) {
    const pointStatus = [];
    for ( const intersection of intersections ) {
        const char = matrix[intersection.row][intersection.col];
        if ( matrix[intersection.row][intersection.col] !== emptyCharacter ) {
            pointStatus.push({
                pos : intersection.point,
                char
            });
        }
    }
    return pointStatus;
}

// Insert the word and return the new matrix
function insertOnMatrix( { matrix, word, col, row, horizontal }) {
    const newMatrix = matrix.slice(0);
    let x = col, y = row;
    if ( horizontal ) {
        newMatrix[y] = newMatrix[y].substr(0,x) + word + newMatrix[y].substr(x+word.length);
    } else {
        for ( let i=0; i<word.length; i++) {
            newMatrix[y+i] = newMatrix[y+i].substr(0,x) + word[i] + newMatrix[y+i].substr(x+1);
        }
    }
    return newMatrix;
}

function getIntersections( structure ) {
    for ( let i=0;i<structure.length-1;i++) {
        for ( let j=i+1;j<structure.length;j++) {
            const structA = structure[i];
            const structB = structure[j];
            if ( structA.horizontal !== structB.horizontal ) {
                if ( structA.horizontal ) {
                    if ( structB.col >= structA.col && structB.col <= structA.col+structA.length
                       && structA.row >= structB.row && structA.row <= structB.row+structB.length ){
                        // They intersect
                        structA.intersections.push({
                            col : structB.col,
                            row : structA.row,
                            point : structB.col-structA.col
                        });
                        structB.intersections.push({
                            col : structB.col,
                            row : structA.row,
                            point : structA.row-structB.row
                        });
                    }
                } else {
                    if ( structB.row >= structA.row && structB.row <= structA.row+structA.length
                      && structA.col >= structB.col && structA.col <= structB.col+structB.length ){
                        // They intersect
                        structA.intersections.push({
                            col : structA.col,
                            row : structB.row,
                            point : structB.row-structA.row
                        });
                        structB.intersections.push({
                            col : structA.col,
                            row : structB.row,
                            point : structA.col-structB.col
                        });
                    }
                }
            }
        }
    }
    return structure;
}

export function getStructure( matrix ) {
    const lineLength = matrix.length && matrix[0].length;
    const dictionary = [];
    for ( let i=0; i<matrix.length; i++) {
        for ( let j=0; j<lineLength; j++ ) {
            // Horizontal
            if ( j==0 || matrix[i][j-1] === blackCharacter && matrix[i][j] !== blackCharacter ) {
                let a=j;
                // Find last blackCharacter of the row
                for ( ; a<lineLength && matrix[i][a] !== blackCharacter; ) { a++; }
                const wordLength = a-j;
                if ( wordLength > 1 ) {
                    dictionary.push({
                        col : j,
                        row : i,
                        length : wordLength,
                        horizontal : true,
                        intersections : []
                    });
                }
            }
            // Vertical
            if ( i==0 || matrix[i-1][j] === blackCharacter && matrix[i][j] !== blackCharacter ) {
                let a=i;
                // Find last blackCharacter of the col
                for ( ; a<matrix.length && matrix[a][j] !== blackCharacter; ) { a++; }
                const wordLength = a-i;
                if ( wordLength > 1 ) {
                    dictionary.push({
                        col : j,
                        row : i,
                        length : wordLength,
                        horizontal : false,
                        intersections : []
                    });
                }
            }
        }
    }
    // Return structure sorted by length descending
    return getIntersections( dictionary.sort( (a,b) => b.length - a.length) );
}
