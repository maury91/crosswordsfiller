import fs from 'fs';
import cluster from 'cluster';
import os from 'os';
import readline from 'readline';
import yargs from 'yargs';
import {
    getStructure,
    fillBlanks
} from './utils';

const { wordFile } = yargs
    .option('w', {
        alias: 'wordFile',
        type: 'string',
        default: 'words.italian.txt'
    })
    .argv;

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

    let combinations_found = 0, workers_alive = 0;

    for ( let i=0; i<totalPositions; i++ ) {
        const worker = cluster.fork();
        workers_alive++;
        worker.on('online', ( ) => {
            worker.send({
                structure,
                i
            });
        });
        worker.on('message', ( combinations ) => {
            combinations_found += combinations;
            workers_alive--;
            if ( !workers_alive ) {
                console.log(`Combinations found ${combinations_found}`);
            }
        });
    }


} else {
    const words = {};
    const wordReader = readline.createInterface({
        input: fs.createReadStream(wordFile,'utf8')
    });
    let structure,position;
    let haveWords = false;
    let haveStructure = false;

    let start = () => {
        // Use the big words array to fill the crosswords
        const combinations_found = fillBlanks({ structure , matrix, words, position, totalPositions, usedGroups : [] });
        process.send(combinations_found);
        process.exit(0);
    };

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
            start();
        }
    });

    wordReader.on('close', () => {

        haveWords = true;
        if ( haveStructure ) {
            start();
        }

    });
}
