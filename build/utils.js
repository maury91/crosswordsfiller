'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getStructure = getStructure;
const blackCharacter = '#';

function getStructure(matrix) {
    const lineLength = matrix.length && matrix[0].length;
    const dictionary = [];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < lineLength; j++) {
            // Horizontal
            if (j == 0 || matrix[i][j - 1] === blackCharacter && matrix[i][j] !== blackCharacter) {
                let a = j;
                // Find last blackCharacter of the row
                for (; a < lineLength && matrix[i][a] !== blackCharacter;) {
                    a++;
                }
                const wordLength = a - j;
                if (wordLength > 1) {
                    dictionary.push({
                        col: j,
                        row: i,
                        length: wordLength,
                        horizontal: true
                    });
                }
            }
            // Vertical
            if (i == 0 || matrix[i - 1][j] === blackCharacter && matrix[i][j] !== blackCharacter) {
                let a = i;
                // Find last blackCharacter of the col
                for (; a < lineLength && matrix[a][j] !== blackCharacter;) {
                    a++;
                }
                const wordLength = a - i;
                if (wordLength > 1) {
                    dictionary.push({
                        col: j,
                        row: i,
                        length: wordLength,
                        horizontal: false
                    });
                }
            }
        }
    }
    return dictionary;
}
//# sourceMappingURL=utils.js.map
