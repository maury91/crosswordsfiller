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
    const { col , row, length, horizontal } = structure[index];
    const spaceStatus = getSpaceStatus({ matrix, length, col, row, horizontal });
    // Make return only the first valid word to try
    const validWords = getPossibleWords({ words : words[length], spaceStatus });
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

function isAValidWord(spaceStatus) {
    const { length } = spaceStatus;
    return ( word ) => {
        for ( let i=0; i<length; i++ ) {
            if ( spaceStatus[i] !== emptyCharacter && spaceStatus[i] !== word[i]) {
                return false;
            }
        }
        return true;
    };
}

function getPossibleWords({ words, spaceStatus }) {
    return words.filter(isAValidWord(spaceStatus));
}

function getSpaceStatus( { matrix, length, col, row, horizontal }) {
    let x = col, y = row;
    if ( horizontal ) {
        return matrix[y].substr(x,length);
    } else {
        let word = '';
        const end = y+length;
        for ( ; y<end; y++ ) {
            word+=matrix[y][x];
        }
        return word;
    }
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
                        horizontal : true
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
                        horizontal : false
                    });
                }
            }
        }
    }
    // Return structure sorted by length descending
    return dictionary.sort( (a,b) => b.length - a.length);
}
