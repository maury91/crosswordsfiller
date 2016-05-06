const blackCharacter = '#';
const emptyCharacter = '*';

const foundedWords = { };

function groupWords({ words , intersections }) {
    const groups = {};
    for ( const word of words ) {
        let intId = '';
        for ( const { point } of intersections ) {
            intId += word[point];
        }
        if ( !groups[intId] ) {
            groups[intId] = [];
        }
        groups[intId].push(word);
    }
    return groups;
}

export function fillBlanks( { index=0, structure, matrix, words, position=false, totalPositions }) {
    const { col , row, length, horizontal, intersections } = structure[index];
    const pointStatus = getPointStatus({ matrix, intersections, length });
    // Make return only the first valid word to try
    let validWords = pointStatus.points.length ?
                        getPossibleWords({ words : words[length], pointStatus, length })
                        : words[length];
    if ( validWords.length ) {
        let validGroups = groupWords({ words : validWords, intersections });
        if ( position !== false ) {
            const vG = {};
            const groups = Object.keys(validWords).filter( ( word, index ) => index%totalPositions === position );
            for ( const group of groups ) {
                vG[group] = validWords[group];
            }
            validWords = vG;
        }
        if ( Object.keys(validGroups).length ) {
            return tryAllWordsGroups({ validGroups, words, structure, index : index+1, matrix, col , row, length, horizontal });
        }
    }
}

function tryAllWordsGroups({ validGroups, words, structure, index, matrix, col , row, length, horizontal }) {
    let combinations = 0;
    for ( const groupID in validGroups ) {
        const group = validGroups[groupID];
        const word = group[0];
        const totalWords = group.length;
        if ( index < structure.length ) {
            // Insert the word in the matrix
            const newMatrix = insertOnMatrix({ matrix, word, col, row, horizontal });
            combinations += totalWords*fillBlanks({
                matrix: newMatrix,
                words,
                index,
                structure
            });
        } else {
            combinations += totalWords;
        }
    }
    return combinations;
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
    if ( foundedWords[pointStatus.id] ) {
        return foundedWords[pointStatus.id];
    }
    return foundedWords[pointStatus.id] = words.filter(isAValidWord(pointStatus.points));
}

function getPointStatus( { matrix, intersections, length }) {
    const pointStatus = { points : [], id : length+'.'};
    for ( const intersection of intersections ) {
        const char = matrix[intersection.row][intersection.col];
        pointStatus.id += intersection.point+char;
        if ( matrix[intersection.row][intersection.col] !== emptyCharacter ) {
            pointStatus.points.push({
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
