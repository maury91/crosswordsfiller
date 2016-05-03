import fs from 'fs';
import {
    getStructure
} from './utils';

const inputFile = fs.readFileSync('input.txt','utf8');

const matrix = inputFile.split('\n').filter( line => line.trim().length);


console.log(getStructure(matrix));
