'use client';

import {createContext, useEffect, useReducer, useRef, useState} from "react";
import {fetchARandomWord as fetchARandomWordFromSever, checkIfAWordValid as checkIfAWordValidFromServer} from "@/utils/handleWordList";

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
    const [wordleWordLettersCountMap, setWordleWordLettersCountMap] = useState(new Map());
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

    useEffect(() => {
        const newWordleWordLettersCountMap = new Map();
        for (let letter of wordleWord) {
            if (newWordleWordLettersCountMap.has(letter)) {
                newWordleWordLettersCountMap.set(letter, newWordleWordLettersCountMap.get(letter) + 1);
            } else {
                newWordleWordLettersCountMap.set(letter, 1);
            }
        }
        setWordleWordLettersCountMap(newWordleWordLettersCountMap);
    }, [wordleWord]);

    async function searchAWordInDictionary(word) {
        const [ok, body] = await checkIfAWordValidFromServer(word); // server-side function
        if (ok) {
            // body = (if the word is included)
            return body;
        } else {
            console.error("fail to fetch word from dictionary: ", body);
            return null;
        }
    }

    async function fetchWordleWord() {
        const [ok, body] = await fetchARandomWordFromSever(); // server-side function
        if (ok) {
            // newWordleWord = body
            return body;
        } else {
            console.error("fail to fetch a word from wordList: ", body);
            return "";
        }
    }

    async function generateAWord() {
        while (true) {
            try {
                setWordleWord(await fetchWordleWord());
                break;
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
        const lettersCountMap = new Map(wordleWordLettersCountMap);
        const result = word.split('').map((char, index) => {
            if (lettersCountMap.has(char) && lettersCountMap.get(char)) {
                lettersCountMap.set(char, lettersCountMap.get(char) - 1);
                if (char === wordleWord[index]) {
                    return LetterStates.Correct;
                }
                if (wordleWord.includes(char)) {
                    return LetterStates.Present;
                }
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
                if (newLettersAvailabilityMap.has(action.letter) && newLettersAvailabilityMap.get(action.letter) === LetterStates.Initial) {
                    newLettersAvailabilityMap.set(action.letter, action.state);
                    dispatchLettersAvailabilityBuffer({
                        type: "add",
                        letter: action.letter,
                        state: action.state,
                    });
                }
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