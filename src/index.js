import fs from 'fs';
import readline from 'readline';
import {
    getStructure,
    fillBlanks
} from './utils';

const inputFile = fs.readFileSync('input.txt','utf8');

const words = {};
const wordReader = readline.createInterface({
    input: fs.createReadStream('words.italian.txt','utf8')
});

wordReader.on('line',( word ) => {
    if ( word.length ) {
        if ( !words[word.length] ) {
            words[word.length] = [];
        }
        // if ( words[word.length].length < MAXIMUM_WORDS_FOR_LENGTH ) {
        words[word.length].push(word);
        // }
    }
});

wordReader.on('close', () => {

    const matrix = inputFile.split('\n').filter( line => line.trim().length);

    const structure = getStructure(matrix);

    // Use the big words array to fill the crosswords
    fillBlanks({ structure , matrix, words });
});
