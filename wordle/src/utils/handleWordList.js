'use server';

import fs from 'fs/promises';

const data = await fs.readFile(process.cwd() + '/src/data/wordList.json', 'utf-8');
const wordList = JSON.parse(data);

export async function fetchARandomWord() {
    try {
        return [true, wordList[Math.floor(Math.random() * wordList.length)]];
    } catch (error) {
        return [false, error];
    }
}

export async function checkIfAWordValid(word){
    try {
        return [true, wordList.includes(word)];
    } catch (error) {
        return [false, error];
    }
}
