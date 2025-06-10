'use client';

import {createContext, useCallback, useContext, useEffect, useReducer, useRef, useState} from "react";
import {fetchARandomWord as fetchARandomWordFromSever, checkIfAWordValid as checkIfAWordValidFromServer} from "@/utils/handleWordList";
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
    const [ifCacheStoreAvailable, handleDataInCache] = useContext(HandleCacheContext);
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
            case "set": {
                const newUpdatedLettersBuffer = new Map(updatedLettersBuffer);
                if (newUpdatedLettersBuffer.has(action.key)) {
                    if (action.actions) {
                        newUpdatedLettersBuffer.set(action.key, {letter: action.letter, actions: [...newUpdatedLettersBuffer.get(action.key).actions, ...action.actions], state: (action.state ? action.state : LetterStates.Initial)});
                    } else {
                        newUpdatedLettersBuffer.set(action.key, {letter: action.letter, actions: [...newUpdatedLettersBuffer.get(action.key).actions, action.action], state: (action.state ? action.state : LetterStates.Initial)});
                    }
                } else {
                    if (action.actions) {
                        newUpdatedLettersBuffer.set(action.key, {letter: action.letter, actions: [...action.actions], state: (action.state ? action.state : LetterStates.Initial)});
                    } else {
                        newUpdatedLettersBuffer.set(action.key, {letter: action.letter, actions: [action.action], state: (action.state ? action.state : LetterStates.Initial)});
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
                for (let index = 0; index < action.initGuessedLetterStates.length; index ++) {
                    if (action.initGuessedLetterStates[index].letter) {
                        if (action.initGuessedLetterStates[index].state) {
                            dispatchUpdatedLettersBuffer({
                                type: "set",
                                key: index,
                                letter: action.initGuessedLetterStates[index].letter,
                                state: action.initGuessedLetterStates[index].state,
                                actions: ["setLetter", "setState"]
                            });
                        } else {
                            dispatchUpdatedLettersBuffer({
                                type: "set",
                                key: index,
                                letter: action.initGuessedLetterStates[index].letter,
                                action: "setLetter"
                            });
                        }
                    }
                }
                return action.initGuessedLetterStates;
            }
            case "remove": {
                const newGuessedLetterStates = [...guessedLetterStates];
                if (action.index >= 0 && action.index < newGuessedLetterStates.length) {
                    newGuessedLetterStates[action.index] = {letter: "", state: LetterStates.Initial};
                    dispatchUpdatedLettersBuffer({
                        type: "set",
                        key: action.index,
                        letter: guessedLetterStates[action.index].letter,
                        action: "remove"
                    })
                }
                return newGuessedLetterStates;
            }
            case "setLetter": {
                const newGuessedLetterStates = [...guessedLetterStates];
                if (action.index >= 0 && action.index < newGuessedLetterStates.length) {
                    newGuessedLetterStates[action.index].letter = action.letter;
                    dispatchUpdatedLettersBuffer({
                        type: "set",
                        key: action.index,
                        letter: action.letter,
                        action: "setLetter"
                    })
                }
                return newGuessedLetterStates;
            }
            case "setState": {
                const newGuessedLetterStates = [...guessedLetterStates];
                if (action.index >= 0 && action.index < newGuessedLetterStates.length) {
                    newGuessedLetterStates[action.index].state = action.state;
                    dispatchUpdatedLettersBuffer({
                        type: "set",
                        key: action.index,
                        letter: action.initGuessedLetterStates[action.index].letter,
                        state: action.state,
                        action: "setState"
                    });
                }
                return guessedLetterStates;
            }
            case "setStates": {
                const newGuessedLetterStates = [...guessedLetterStates];
                for (let i = 0; i < action.states.length && i + action.startIndex < newGuessedLetterStates.length; i++) {
                    newGuessedLetterStates[i + action.startIndex].state = action.states[i];
                    dispatchUpdatedLettersBuffer({
                        type: "set",
                        key: i + action.startIndex,
                        letter: newGuessedLetterStates[i + action.startIndex].letter,
                        state: action.states[i],
                        action: "setState"
                    });
                }
                return newGuessedLetterStates;
            }
        }
    }, [], undefined);
    const [guessIndex, setGuessIndex] = useState(0); // index of the current guess
    const [cursorIndex, setCursorIndex] = useState(0); // index of the current cursor position in the current guess - based on guessedLetterStates and guessIndex

    useEffect(() => {
        async function syncStates () {
            if (handleDataInCache) {
                console.log("Syncing states from cache...");
                const wordleWordInCache = await handleDataInCache({
                    type: "get",
                    key: "wordleWord"
                });
                if (wordleWordInCache) {
                    setWordleWord(wordleWordInCache);
                }
                const currentGameStateInCache = await handleDataInCache({
                    type: "get",
                    key: "currentGameState"
                });
                if (currentGameStateInCache) {
                    dispatchCurrentGameState({
                        type: "set",
                        state: currentGameStateInCache
                    });
                }
                const guessedLetterStatesInCache = await handleDataInCache({
                    type: "get",
                    key: "guessedLetterStates"
                });
                if (guessedLetterStatesInCache) {
                    dispatchGuessedLetterStates({
                        type: "initSet",
                        initGuessedLetterStates: guessedLetterStatesInCache
                    });
                }
                const guessIndexInCache = await handleDataInCache({
                    type: "get",
                    key: "guessIndex"
                });
                if (guessIndexInCache) {
                    setGuessIndex(guessIndexInCache);
                }
            }
        }
        if (ifCacheStoreAvailable && isFirstRender) {
            syncStates().then(() => {
                setIsFirstRender(false);
            }).catch();
        }
    }, [ifCacheStoreAvailable, handleDataInCache, isFirstRender]); // run when store is loaded

    // sync wordleWord to cache when it changes
    const syncWordleWordToCache = useCallback(async () => {
        if (handleDataInCache) {
            console.log("syncing wordleWord to cache: ", wordleWord);
            await handleDataInCache({
                type: "set",
                key: "wordleWord",
                value: wordleWord
            });
        }
    }, [handleDataInCache, wordleWord]);
    useEffect(() => {
        if (ifCacheStoreAvailable && !isFirstRender) {
            syncWordleWordToCache().then().catch();
        }
    }, [ifCacheStoreAvailable, isFirstRender, syncWordleWordToCache]);

    // sync currentGameState to cache when it changes
    const syncCurrentGameStateToCache = useCallback(async () => {
        if (handleDataInCache) {
            console.log("syncing currentGameState to cache: ", currentGameState);
            await handleDataInCache({
                type: "set",
                key: "currentGameState",
                value: currentGameState
            });
        }
    }, [handleDataInCache, currentGameState]);
    useEffect(() => {
        if (ifCacheStoreAvailable && !isFirstRender) {
            syncCurrentGameStateToCache().then().catch();
        }
    }, [ifCacheStoreAvailable, isFirstRender, syncCurrentGameStateToCache]);

    // sync guessedLetterStates to cache when it changes
    const syncGuessedLetterStatesToCache = useCallback(async () => {
        if (handleDataInCache) {
            console.log("syncing guessedLetterStates to cache: ", guessedLetterStates);
            await handleDataInCache({
                type: "set",
                key: "guessedLetterStates",
                value: guessedLetterStates
            });
        }
    }, [handleDataInCache, guessedLetterStates]);
    useEffect(() => {
        if (ifCacheStoreAvailable && !isFirstRender) {
            syncGuessedLetterStatesToCache().then().catch();
        }
    }, [ifCacheStoreAvailable, isFirstRender, syncGuessedLetterStatesToCache]);

    // sync guessIndex to cache when it changes
    const syncGuessIndexToCache = useCallback(async () => {
        if (handleDataInCache) {
            console.log("syncing guessIndex to cache: ", guessIndex);
            await handleDataInCache({
                type: "set",
                key: "guessIndex",
                value: guessIndex
            });
        }
    }, [handleDataInCache, guessIndex]);
    useEffect(() => {
        if (ifCacheStoreAvailable && !isFirstRender) {
            syncGuessIndexToCache().then().catch();
        }
    }, [ifCacheStoreAvailable, isFirstRender, syncGuessIndexToCache]);

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
            console.log("Initializing lettersAvailabilityMap based on guessedLetterStates...");
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
            console.log("Updating guessIndex and cursorIndex based on guessedLetterStates...");
            let newCursorIndex = 0;
            for (let index = guessIndex * 5; index < guessIndex * 5 + 5 && index < guessedLetterStates.length; index ++) {
                if (guessedLetterStates[index].letter) {
                    newCursorIndex ++;
                } else {
                    break;
                }
            }
            console.log("guessIndex: ", guessIndex);
            console.log("cursorIndex: ", newCursorIndex);
            setCursorIndex(newCursorIndex);
        }
    }, [isFirstRender, isInitializingGuessedLetterStates, guessedLetterStates, guessIndex]); // update cursorIndex based on guessedLetterStates when it is initialized

    useEffect(() => {
        if (!isFirstRender && previousGameStateRef.current !== currentGameState && currentGameState === GameStates.Initial) {
            console.log("Game state is reset to Initial, resetting lettersAvailabilityMap and wordleWord...");
            setWordleWord("");
            dispatchGuessedLetterStates({
                type: "clear",
            });
            setGuessIndex(0);
        }
        previousGameStateRef.current = currentGameState; // update previous game state
    }, [isFirstRender, currentGameState]); // reset guessedLetterStates, wordleWord, and guessIndex when game state is reset to Initial

    // useEffect(() => {
    //     if (previousGameStateRef.current !== currentGameState && currentGameState === GameStates.Initial && handleDataInCache) {
    //         console.log("Game state is reset to Initial, clearing cache...");
    //         handleDataInCache({
    //             type: "clear"
    //         }).then().catch();
    //     }
    //     previousGameStateRef.current = currentGameState; // update previous game state
    // }, [currentGameState, handleDataInCache]); // clear cache when game state is reset to Initial

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