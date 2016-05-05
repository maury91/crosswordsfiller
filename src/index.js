import fs from 'fs';
import cluster from 'cluster';
import os from 'os';
import readline from 'readline';
import {
    getStructure,
    fillBlanks
} from './utils';


const inputFile = fs.readFileSync('input.txt','utf8');
const matrix = inputFile.split('\n').filter( line => line.trim().length);
const totalPositions = os.cpus().length;

if (cluster.isMaster) {

    const structure = getStructure(matrix);

    console.log('Structure',structure);
    console.log('Number of words that needs to be inserted to complete 1 combination:',structure.length);

    if ( structure.length > 9 ) {
        console.log('With this structure will take a lot to finish 1 combination');
    }

    for ( let i=0; i<totalPositions; i++ ) {
        const worker = cluster.fork();
        worker.on('online', ( ) => {
            worker.send({
                structure,
                i
            });
        });
    }


} else {
    const words = {};
    const wordReader = readline.createInterface({
        input: fs.createReadStream('words.italian.txt','utf8')
    });
    let structure,position;
    let haveWords = false;
    let haveStructure = false;

    wordReader.on('line',( word ) => {
        if ( word.length ) {
            if ( !words[word.length] ) {
                words[word.length] = [];
            }
            words[word.length].push(word);
        }
    });

    process.on('message', ( message ) => {
        structure = message.structure;
        position = message.i;
        haveStructure = true;
        if ( haveWords ) {
            // Use the big words array to fill the crosswords
            fillBlanks({ structure , matrix, words, position, totalPositions });
        }
    });

    wordReader.on('close', () => {

        haveWords = true;
        if ( haveStructure ) {
            // Use the big words array to fill the crosswords
            fillBlanks({ structure , matrix, words, position, totalPositions });
        }

    });
}
