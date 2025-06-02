'use client';

import {createContext, useReducer, useRef, useState} from "react";

const GameStates = Object.freeze({
    Initial: 0,
    Generated: 1,
    Guessing: 2,
    CheckingStart: 3,
    CheckingUnrecognized: 4,
    CheckingFlip: 5,
    End: 6,
})

const LetterStates = Object.freeze({
    Initial: "initial",
    Correct: "correct",
    Present: "present",
    Absent: "absent",
});

export const WordleWordContext = createContext(null);
export const WordleWordDispatchContext = createContext(null);
export const WordleWordCheckContext = createContext(null);
export const WordleLetterStatesContext = createContext(null);
export const WordleLettersAvailabilityBufferContext = createContext(null);
export const WordleLettersAvailabilityMapContext = createContext(null);
export const WordleGameStateContext = createContext(null);

export default function WordleInfoContextProvider({children}) {
    const [wordleWord, setWordleWord] = useState("");
    const currentGameStateIndex = useRef(0);
    const [currentGameState, dispatchCurrentGameState] = useReducer((currentGameState, action) => {
        switch (action.type) {
            case "forward": {
                if (currentGameStateIndex.current + 1 >= Object.keys(GameStates).length) return currentGameStateIndex.current;
                currentGameStateIndex.current ++;
                return currentGameStateIndex.current;
            }
            case "set": {
                if (action.state && action.state >= 0 && action.state < Object.keys(GameStates).length) currentGameStateIndex.current = action.state;
                return currentGameStateIndex.current;
            }
            case "reset": {
                currentGameStateIndex.current = GameStates.Initial;
                return currentGameStateIndex.current;
            }

        }
    }, GameStates.Initial, undefined);

    async function searchAWordInDictionary(word) {
        let fetched = false;
        while (!fetched) {
            try {
                const response = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word);
                fetched = true;
                return response.ok; // Returns true for 200 and other successful responses
            } catch (error) {
                console.error("fail to fetch word from dictionary: ", error);
            }
        }
    }

    async function fetchWordleWord(lang = "", length = 5) {
        while (true) {
            const responseFromRandom = await fetch("https://random-word-api.herokuapp.com/word?length=" + length + (lang && lang !== "en" ? "&lang=" + lang : ""));
            if (!responseFromRandom.ok) {
                throw new Error("Failed to fetch wordle word");
            }
            const wordFromRandom = (await responseFromRandom.json())[0];
            if (await searchAWordInDictionary(wordFromRandom)) {
                return wordFromRandom.toLowerCase();
            }
        }
    }

    async function generateAWord() {
        let fetched = false;
        while (!fetched) {
            try {
                setWordleWord(await fetchWordleWord());
                fetched = true;
            } catch (error) {
                console.error("Error generating a word:", error);
            }
        }
    }

    async function checkIfWordValidAndCompare(word) {
        // returned value indicates whether the word is valid and the content is the result of checking
        if (!word || word.length !== wordleWord.length) {
            return {status: false, content: "Please enter a " + wordleWord.length + "-letter word!"};
        }
        const ifValidWord = await searchAWordInDictionary(word);
        if (!ifValidWord) {
            return {status: false, content: "It is not in the word list."};
        }
        const result = word.split('').map((char, index) => {
            if (char === wordleWord[index]) {
                return LetterStates.Correct;
            }
            if (wordleWord.includes(char)) {
                return LetterStates.Present;
            }
            return LetterStates.Absent;
        });
        return {status: true, content: result};
    }

    const [lettersAvailabilityBuffer, dispatchLettersAvailabilityBuffer] = useReducer((lettersAvailabilityBuffer, action) => {
        switch (action.type) {
            case "clear": {
                return new Map();
            }
            case "add": {
                const updatedLettersAvailabilityBuffer = new Map(lettersAvailabilityBuffer);
                updatedLettersAvailabilityBuffer.set(action.letter, action.state);
                return updatedLettersAvailabilityBuffer;
            }
        }
    }, new Map(), undefined);
    const [lettersAvailabilityMap, dispatchLettersAvailabilityMap] = useReducer((lettersAvailabilityMap, action) => {
        switch (action.type) {
            case "reset": {
                dispatchLettersAvailabilityBuffer({
                    type: "clear",
                });
                return new Map(Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), LetterStates.Initial]));
            }
            case "set": {
                const newLettersAvailabilityMap = new Map(lettersAvailabilityMap);
                newLettersAvailabilityMap.set(action.letter, action.state);
                dispatchLettersAvailabilityBuffer({
                    type: "add",
                    letter: action.letter,
                    state: action.state,
                });
                return newLettersAvailabilityMap;
            }
        }
    }, new Map(Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), LetterStates.Initial])), undefined);

    return (
        <WordleWordContext.Provider value={wordleWord}>
            <WordleWordDispatchContext.Provider value={generateAWord}>
                <WordleWordCheckContext.Provider value={checkIfWordValidAndCompare}>
                    <WordleLetterStatesContext.Provider value={LetterStates}>
                        <WordleLettersAvailabilityBufferContext.Provider value={[lettersAvailabilityBuffer, dispatchLettersAvailabilityBuffer]}>
                            <WordleLettersAvailabilityMapContext.Provider value={[lettersAvailabilityMap, dispatchLettersAvailabilityMap]}>
                                <WordleGameStateContext.Provider value={[currentGameState, dispatchCurrentGameState, GameStates]}>
                                    {children}
                                </WordleGameStateContext.Provider>
                            </WordleLettersAvailabilityMapContext.Provider>
                        </WordleLettersAvailabilityBufferContext.Provider>
                    </WordleLetterStatesContext.Provider>
                </WordleWordCheckContext.Provider>
            </WordleWordDispatchContext.Provider>
        </WordleWordContext.Provider>
    );
}