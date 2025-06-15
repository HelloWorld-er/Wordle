'use client';

import {createContext, useContext, useEffect, useReducer, useRef, useState} from "react";
import {fetchARandomWord as fetchARandomWordFromWordList, checkIfAWordValid as checkIfAWordValidFromWordList} from "@/utils/handleWordList";
import {HandleCacheContext} from "@/context/CacheContext";

const GameStates = Object.freeze({
    Initial: 0,
    Generated: 1,
    Guessing: 2,
    MicroCheck: 3,
    CheckingStart: 4,
    CheckingUnrecognized: 5,
    CheckingFlip: 6,
    End: 7,
})

const LetterStates = Object.freeze({
    Initial: 0,
    Absent: 1,
    Present: 2,
    Correct: 3,
});

export const WordleGameStateContext = createContext(null);
export const WordleWordContext = createContext(null);
export const WordleWordDispatchContext = createContext(null);
export const WordleWordCheckContext = createContext(null);
export const WordleWordLetterPositionContext = createContext(null);
export const WordleLetterStatesContext = createContext(null);
export const WordleExistedLettersBufferContext = createContext(null);
export const WordleLettersAvailabilityBufferContext = createContext(null);
export const WordleLettersAvailabilityMapContext = createContext(null);

export default function WordleContextProvider({children}) {
    const handleDataInCache = useContext(HandleCacheContext);
    const [isFirstRender, setIsFirstRender] = useState(true);

    const [wordleWord, setWordleWord] = useState("");
    const [wordleWordLettersCountMap, setWordleWordLettersCountMap] = useState(new Map()); // depends on wordleWord
    const [currentGameState, dispatchCurrentGameState] = useReducer((currentGameState, action) => {
        switch (action.type) {
            case "set": {
                if (action.state && action.state >= 0 && action.state < Object.keys(GameStates).length) return action.state;
                return currentGameState;
            }
            case "reset": {
                return GameStates.Initial;
            }

        }
    }, GameStates.Initial, undefined);
    const previousGameStateRef = useRef(currentGameState); // used to store the previous game state

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
    }, new Map(), undefined); // depends on lettersAvailabilityMap
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
                if (newLettersAvailabilityMap.has(action.letter) && newLettersAvailabilityMap.get(action.letter) < action.state) {
                    newLettersAvailabilityMap.set(action.letter, action.state);
                    dispatchLettersAvailabilityBuffer({
                        type: "add",
                        letter: action.letter,
                        state: action.state,
                    });
                }
                return newLettersAvailabilityMap;
            }
            case "initSet": {
                const newLettersAvailabilityMap = new Map(action.initLettersAvailabilityMap);
                dispatchLettersAvailabilityBuffer({
                    type: "clear",
                });
                for (let [letter, state] of newLettersAvailabilityMap) {
                    if (lettersAvailabilityMap.has(letter) && lettersAvailabilityMap.get(letter) < state) {
                        dispatchLettersAvailabilityBuffer({
                            type: "add",
                            letter: letter,
                            state: state,
                        });
                    }
                }
                return newLettersAvailabilityMap;
            }
        }
    }, new Map(Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), LetterStates.Initial])), undefined);
    const [updatedLettersBuffer, dispatchUpdatedLettersBuffer] = useReducer((updatedLettersBuffer, action) => {
        switch (action.type) {
            case "clear": {
                return new Map();
            }
            case "setLetter": {
                if (action.key === null || action.key === undefined || action.letter === null || action.letter === undefined) {
                    throw new Error("Invalid setLetter action");
                }
                const newUpdatedLettersBuffer = structuredClone(updatedLettersBuffer);
                if (newUpdatedLettersBuffer.has(action.key)) {
                    const value = newUpdatedLettersBuffer.get(action.key);
                    value.letter = action.letter;
                    value.actions.push("setLetter");
                } else {
                    const value = {
                        letter: action.letter,
                        actions: ["setLetter"],
                    }
                    newUpdatedLettersBuffer.set(action.key, value);
                }
                return newUpdatedLettersBuffer;
            }
            case "setState": {
                if (action.key === null || action.key === undefined || action.state === null || action.state === undefined) {
                    throw new Error("Invalid setState action");
                }
                const newUpdatedLettersBuffer = structuredClone(updatedLettersBuffer);
                if (action.state !== LetterStates.Initial) {
                    if (newUpdatedLettersBuffer.has(action.key)) {
                        const value = newUpdatedLettersBuffer.get(action.key);
                        value.state = action.state;
                        value.actions.push("setState");
                        // newUpdatedLettersBuffer.set(action.key, value);
                    } else {
                        const value = {
                            state: action.state,
                            actions: ["setState"],
                        }
                        newUpdatedLettersBuffer.set(action.key, value);
                    }
                }
                return newUpdatedLettersBuffer;
            }
            case "setStates": {
                if (!action.keys || !action.states || action.keys.length !== action.states.length) {
                    throw new Error("Invalid setStates action");
                }
                const newUpdatedLettersBuffer = structuredClone(updatedLettersBuffer);
                for (let index = 0; index < action.keys.length; index ++) {
                    if (action.states[index] !== LetterStates.Initial) {
                        if (newUpdatedLettersBuffer.has(action.keys[index])) {
                            const value = newUpdatedLettersBuffer.get(action.keys[index]);
                            value.state = action.states[index];
                            value.actions.push("setState");
                            // newUpdatedLettersBuffer.set(action.keys[index], value);
                        } else {
                            const value = {
                                state: action.states[index],
                                actions: ["setState"],
                            }
                            newUpdatedLettersBuffer.set(action.keys[index], value);
                        }
                    }
                }
                return newUpdatedLettersBuffer;
            }
            case "setLetterAndState": {
                if (action.key === null || action.key === undefined || action.letter === null || action.letter === undefined || action.state === null || action.state === undefined) {
                    throw new Error("Invalid setLetterAndState action");
                }
                const newUpdatedLettersBuffer = structuredClone(updatedLettersBuffer);
                if (newUpdatedLettersBuffer.has(action.key)) {
                    const value = newUpdatedLettersBuffer.get(action.key);
                    value.letter = action.letter;
                    value.state = action.state;
                    value.actions.push("setLetter");
                    if (action.state !== LetterStates.Initial) {
                        value.actions.push("setState");
                    }
                    // newUpdatedLettersBuffer.set(action.key, value);
                } else {
                    const value = {
                        letter: action.letter,
                        state: action.state,
                        actions: action.state === LetterStates.Initial ? ["setLetter"] : ["setLetter", "setState"],
                    }
                    newUpdatedLettersBuffer.set(action.key, value);
                }
                return newUpdatedLettersBuffer;
            }
            case "setLettersAndStates": {
                if (!action.keys || !action.letters || !action.states || action.keys.length !== action.states.length || action.keys.length !== action.letters.length) {
                    throw new Error("Invalid setLettersAndStates action");
                }
                const newUpdatedLettersBuffer = structuredClone(updatedLettersBuffer);
                for (let index = 0; index < action.keys.length; index ++) {
                    if (newUpdatedLettersBuffer.has(action.keys[index])) {
                        const value = newUpdatedLettersBuffer.get(action.keys[index]);
                        value.letter = action.letters[index];
                        value.state = action.states[index];
                        value.actions.push("setLetter");
                        if (action.states[index] !== LetterStates.Initial) {
                            value.actions.push("setState");
                        }
                        // newUpdatedLettersBuffer.set(action.keys[index], value);
                    } else {
                        const value = {
                            letter: action.letters[index],
                            state: action.states[index],
                            actions: action.states[index] === LetterStates.Initial ? ["setLetter"] : ["setLetter", "setState"],
                            // actions: action.states[index] === LetterStates.Initial ? [] : ["setState"],
                        }
                        newUpdatedLettersBuffer.set(action.keys[index], value);
                    }
                }
                return newUpdatedLettersBuffer;
            }
            case "setRemove": {
                if (action.key === null || action.key === undefined) {
                    throw new Error("Invalid setRemove action");
                }
                const newUpdatedLettersBuffer = structuredClone(updatedLettersBuffer);
                if (newUpdatedLettersBuffer.has(action.key)) {
                    const value = newUpdatedLettersBuffer.get(action.key);
                    value.actions.push("remove");
                    // newUpdatedLettersBuffer.set(action.key, value);
                } else {
                    const value = {
                        actions: ["remove"],
                    }
                    newUpdatedLettersBuffer.set(action.key, value);
                }
                return newUpdatedLettersBuffer;
            }

            case "clearActions": {
                if (action.actions === null || action.actions === undefined || !Array.isArray(action.actions)) {
                    throw new Error("Invalid clearActions action");
                }
                const newUpdatedLettersBuffer = structuredClone(updatedLettersBuffer);
                for (let key of newUpdatedLettersBuffer.keys()) {
                    if (newUpdatedLettersBuffer.has(key)) {
                        const value = newUpdatedLettersBuffer.get(key);
                        value.actions = value.actions.filter(item => !action.actions.includes(item));
                        if (value.actions.length === 0) {
                            newUpdatedLettersBuffer.delete(key);
                        }
                    }
                }
                return newUpdatedLettersBuffer;
            }
        }
    }, new Map(), undefined);
    const [isInitializingGuessedLetterStates, setIsInitializingGuessedLetterStates] = useState(false);
    const [guessedLetterStates, dispatchGuessedLetterStates] = useReducer((guessedLetterStates, action) => {
        switch (action.type) {
            case "clear": {
                setIsInitializingGuessedLetterStates(true);
                dispatchUpdatedLettersBuffer({
                    type: "clear"
                });
                return [];
            }
            case "init": {
                setIsInitializingGuessedLetterStates(true);
                dispatchUpdatedLettersBuffer({
                    type: "clear"
                });
                return Array.from({length: action.length}, () => {return {letter: "", state: LetterStates.Initial}});
            }
            case "initSet": {
                setIsInitializingGuessedLetterStates(true);
                const keys = [];
                const letters = [];
                const states = [];
                for (let index = 0; index < action.initGuessedLetterStates.length; index ++) {
                    if (action.initGuessedLetterStates[index].letter) {
                        keys.push(index);
                        letters.push(action.initGuessedLetterStates[index].letter);
                        if (action.initGuessedLetterStates[index].state) {
                            states.push(action.initGuessedLetterStates[index].state)
                        } else {
                            states.push(LetterStates.Initial);
                        }
                    }
                }
                dispatchUpdatedLettersBuffer({
                    type: "setLettersAndStates",
                    keys: keys,
                    letters: letters,
                    states: states,
                });
                return action.initGuessedLetterStates;
            }
            case "remove": {
                const newGuessedLetterStates = [...guessedLetterStates];
                if (action.index >= 0 && action.index < newGuessedLetterStates.length) {
                    newGuessedLetterStates[action.index] = {letter: "", state: LetterStates.Initial};
                    dispatchUpdatedLettersBuffer({
                        type: "setRemove",
                        key: action.index,
                    })
                }
                return newGuessedLetterStates;
            }
            case "setLetter": {
                const newGuessedLetterStates = [...guessedLetterStates];
                if (action.index >= 0 && action.index < newGuessedLetterStates.length) {
                    newGuessedLetterStates[action.index].letter = action.letter;
                    dispatchUpdatedLettersBuffer({
                        type: "setLetter",
                        key: action.index,
                        letter: action.letter,
                    })
                }
                return newGuessedLetterStates;
            }
            case "setState": {
                const newGuessedLetterStates = [...guessedLetterStates];
                if (action.index >= 0 && action.index < newGuessedLetterStates.length) {
                    newGuessedLetterStates[action.index].state = action.state;
                    dispatchUpdatedLettersBuffer({
                        type: "setState",
                        key: action.index,
                        state: action.state,
                    });
                }
                return guessedLetterStates;
            }
            case "setStates": {
                const newGuessedLetterStates = [...guessedLetterStates];
                for (let i = 0; i < action.states.length && i + action.startIndex < newGuessedLetterStates.length; i++) {
                    newGuessedLetterStates[i + action.startIndex].state = action.states[i];
                }
                dispatchUpdatedLettersBuffer({
                    type: "setStates",
                    keys: Array.from({length: action.states.length}, (_, index) => {
                        return index + action.startIndex;
                    }),
                    states: action.states,
                })
                return newGuessedLetterStates;
            }
        }
    }, [], undefined);
    const [guessIndex, setGuessIndex] = useState(0); // index of the current guess
    const [cursorIndex, setCursorIndex] = useState(0); // index of the current cursor position in the current guess - based on guessedLetterStates and guessIndex

    useEffect(() => {
        if (isFirstRender && handleDataInCache) {
            const wordleWordInCache = handleDataInCache({
                type: "get",
                key: "wordleWord"
            });
            if (wordleWordInCache !== null && wordleWordInCache !== undefined && wordleWordInCache !== "") {
                setWordleWord(wordleWordInCache);
            }
            const currentGameStateInCache = handleDataInCache({
                type: "get",
                key: "currentGameState"
            });
            if (currentGameStateInCache !== null && currentGameStateInCache !== undefined) {
                dispatchCurrentGameState({
                    type: "set",
                    state: currentGameStateInCache
                });
            }
            const guessedLetterStatesInCache = handleDataInCache({
                type: "get",
                key: "guessedLetterStates"
            });
            if (guessedLetterStatesInCache !== null && guessedLetterStatesInCache !== undefined) {
                dispatchGuessedLetterStates({
                    type: "initSet",
                    initGuessedLetterStates: guessedLetterStatesInCache
                });
            }
            const guessIndexInCache = handleDataInCache({
                type: "get",
                key: "guessIndex"
            });
            if (guessIndexInCache !== null && guessIndexInCache !== undefined) {
                setGuessIndex(guessIndexInCache);
            }
            setIsFirstRender(false);
        }
    }, [handleDataInCache, isFirstRender]); // run when store is loaded

    // sync wordleWord to cache when it changes
    useEffect(() => {
        if (!isFirstRender && handleDataInCache) {
            handleDataInCache({
                type: "set",
                key: "wordleWord",
                value: wordleWord
            });
        }
    }, [isFirstRender, handleDataInCache, wordleWord]);

    // sync currentGameState to cache when it changes
    useEffect(() => {
        if (!isFirstRender && handleDataInCache) {
            handleDataInCache({
                type: "set",
                key: "currentGameState",
                value: currentGameState
            });
        }
    }, [isFirstRender, handleDataInCache, currentGameState]);

    // sync guessedLetterStates to cache when it changes
    useEffect(() => {
        if (!isFirstRender && handleDataInCache) {
            handleDataInCache({
                type: "set",
                key: "guessedLetterStates",
                value: guessedLetterStates
            });
        }
    }, [isFirstRender, handleDataInCache, guessedLetterStates]);

    // sync guessIndex to cache when it changes
    useEffect(() => {
        if (!isFirstRender && handleDataInCache) {
            handleDataInCache({
                type: "set",
                key: "guessIndex",
                value: guessIndex
            });
        }
    }, [isFirstRender, handleDataInCache, guessIndex]);

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
    }, [wordleWord]); // update wordleWordLettersCountMap when wordleWord changes

    useEffect(() => {
        if (!isFirstRender && isInitializingGuessedLetterStates) {
            setIsInitializingGuessedLetterStates(false);
            const newLettersAvailabilityMap = new Map(Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), LetterStates.Initial]));
            for (let {letter, state} of guessedLetterStates) {
                if (newLettersAvailabilityMap.has(letter) && newLettersAvailabilityMap.get(letter) < state) {
                    newLettersAvailabilityMap.set(letter, state);
                }
                if (!letter) break;
            }
            dispatchLettersAvailabilityMap({
                type: "initSet",
                initLettersAvailabilityMap: newLettersAvailabilityMap,
            });
        }
    }, [isFirstRender, guessedLetterStates, isInitializingGuessedLetterStates]);

    useEffect(() => {
        if (!isFirstRender && isInitializingGuessedLetterStates) {
            setIsInitializingGuessedLetterStates(false);
            let newCursorIndex = 0;
            for (let index = guessIndex * 5; index < guessIndex * 5 + 5 && index < guessedLetterStates.length; index ++) {
                if (guessedLetterStates[index].letter) {
                    newCursorIndex ++;
                } else {
                    break;
                }
            }
            setCursorIndex(newCursorIndex);
        }
    }, [isFirstRender, isInitializingGuessedLetterStates, guessedLetterStates, guessIndex]); // update cursorIndex based on guessedLetterStates when it is initialized

    useEffect(() => {
        if (!isFirstRender && previousGameStateRef.current !== currentGameState && currentGameState === GameStates.Initial) {
            setWordleWord("");
            dispatchGuessedLetterStates({
                type: "clear",
            });
            setGuessIndex(0);
        }
        previousGameStateRef.current = currentGameState; // update previous game state
    }, [isFirstRender, currentGameState]); // reset guessedLetterStates, wordleWord, and guessIndex when game state is reset to Initial

    async function searchAWordInDictionary(word) {
        const [ok, body] = await checkIfAWordValidFromWordList(word); // server-side function
        if (ok) {
            // body = (if the word is included)
            return body;
        } else {
            throw new Error("Failed to fetch word from dictionary");
        }
    }

    async function fetchWordleWord() {
        const [ok, body] = await fetchARandomWordFromWordList(); // server-side function
        if (ok) {
            return body;
        } else {
            throw new Error("Failed to fetch a word from word list");
        }
    }

    async function generateAWord() {
        try {
            setWordleWord(await fetchWordleWord());
        } catch (error) {
            throw new Error("Failed to generate a word. Please try again later.");
        }
    }

    async function checkIfWordValidAndCompare(word) {
        // function's returned value indicates whether the word is valid and the content is the result of checking
        if (!word || word.length !== wordleWord.length) {
            return {status: false, content: "Please enter a " + wordleWord.length + "-letter word!"};
        }
        const ifValidWord = await searchAWordInDictionary(word);
        if (!ifValidWord) {
            return {status: false, content: "It is not in the word list."};
        }
        const lettersCountMap = new Map(wordleWordLettersCountMap);
        const result = word.split('').map((letter, index) => {
            if (letter === wordleWord[index]) {
                lettersCountMap.set(letter, lettersCountMap.get(letter) - 1);
                return LetterStates.Correct;
            }
            return LetterStates.Absent;
        }).map((state, index) => {
            const letter = word[index];
            if (state === LetterStates.Absent && lettersCountMap.has(letter) && lettersCountMap.get(letter)) {
                lettersCountMap.set(letter, lettersCountMap.get(letter) - 1);
                return LetterStates.Present;
            }
            return state;
        });
        return {status: true, content: result};
    }

    return (
        <WordleGameStateContext.Provider value={[currentGameState, dispatchCurrentGameState, GameStates, isFirstRender]}>
            <WordleWordContext.Provider value={wordleWord}>
                <WordleWordDispatchContext.Provider value={generateAWord}>
                    <WordleWordCheckContext.Provider value={checkIfWordValidAndCompare}>
                        <WordleWordLetterPositionContext.Provider value={[guessIndex, setGuessIndex, cursorIndex, setCursorIndex]}>
                            <WordleLetterStatesContext.Provider value={[guessedLetterStates, dispatchGuessedLetterStates, LetterStates]}>
                                <WordleExistedLettersBufferContext.Provider value={[updatedLettersBuffer, dispatchUpdatedLettersBuffer]}>
                                    <WordleLettersAvailabilityBufferContext.Provider value={[lettersAvailabilityBuffer, dispatchLettersAvailabilityBuffer]}>
                                        <WordleLettersAvailabilityMapContext.Provider value={[lettersAvailabilityMap, dispatchLettersAvailabilityMap]}>
                                            {children}
                                        </WordleLettersAvailabilityMapContext.Provider>
                                    </WordleLettersAvailabilityBufferContext.Provider>
                                </WordleExistedLettersBufferContext.Provider>
                            </WordleLetterStatesContext.Provider>
                        </WordleWordLetterPositionContext.Provider>
                    </WordleWordCheckContext.Provider>
                </WordleWordDispatchContext.Provider>
            </WordleWordContext.Provider>
        </WordleGameStateContext.Provider>
    );
}