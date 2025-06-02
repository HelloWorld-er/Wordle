'use client';

import {useEffect, useState, useContext, useRef} from "react";
import {useBuiltinKeyboard} from "@/hooks/useBuiltinKeyboard";
import Show from "@/components/Show";

import {keyContext, keyDispatchContext} from "@/context/KeyboardContext";
import {
    WordleGameStateContext,
    WordleWordContext,
    WordleWordCheckContext,
    WordleLettersAvailabilityBufferContext, WordleLettersAvailabilityMapContext, WordleLetterStatesContext
} from "@/context/WordleInfoContext";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

function Keyboard() {
    const dispatchKey = useContext(keyDispatchContext);
    const LetterStates = useContext(WordleLetterStatesContext);
    const [lettersAvailabilityBuffer, dispatchLettersAvailabilityBuffer] = useContext(WordleLettersAvailabilityBufferContext);

    const keys = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"]
    ];

    function handleKeyClick(event) {
        let key = event.target.innerText;
        if (keys.flat().includes(key)) {
            if (key === "ENTER") {
                key = "Enter";
            }
            else if (key === "DEL") {
                key = "Backspace";
            }
            dispatchKey ? dispatchKey({
                type: "update",
                key: key
            }) : null;
        }
    }

    useGSAP(() => {
        if (lettersAvailabilityBuffer && lettersAvailabilityBuffer.size) {
            const tl = gsap.timeline();
            let classes = [];
            lettersAvailabilityBuffer.forEach((state, letter) => {
                classes.push(".keyboard-key-" + letter.toUpperCase());
            });
            tl.to(classes.join(", "), {
                background: (i, target) => {
                   if (lettersAvailabilityBuffer.get(target.innerText) === LetterStates.Correct) return "#6aaa64";
                    if (lettersAvailabilityBuffer.get(target.innerText) === LetterStates.Present) return "#c9b458";
                    if (lettersAvailabilityBuffer.get(target.innerText) === LetterStates.Absent) return "#787c7e";
                   },
                color: "#ffffff",
            });
            dispatchLettersAvailabilityBuffer({
                type: "clear",
            });
        }
    }, {dependencies: [lettersAvailabilityBuffer]});

    return (
        <div className="flex flex-col items-center gap-2 font-roboto-mono font-bold">
            <div className="flex flex-row gap-2">
                {
                    keys[0].map((item, index) => {
                        return (
                            <button key={index} className={`keyboard-key-${item} ` + "cursor-pointer flex items-center justify-center p-2 rounded-sm bg-darker-shadow"}
                                    onClick={(event) => handleKeyClick(event)}>{item}</button>
                        )
                    })
                }
            </div>
            <div className="flex flex-row gap-2">
                {
                    keys[1].map((item, index) => {
                        return (
                            <button key={index} className={`keyboard-key-${item} ` + "cursor-pointer flex items-center justify-center p-2 rounded-sm bg-darker-shadow"}
                                    onClick={(event) => handleKeyClick(event)}>{item}</button>
                        )
                    })
                }
            </div>
            <div className="flex flex-row gap-2">
                {
                    keys[2].map((item, index) => {
                        return (
                            <button key={index} className={(item === "ENTER" || item === "DEL" ? "text-sm " : "") + `keyboard-key-${item} ` + "cursor-pointer flex items-center justify-center p-2 rounded-sm bg-darker-shadow"}
                                    onClick={(event) => handleKeyClick(event)}>{item}</button>
                        )
                    })
                }
            </div>
        </div>
    );
}

function useKeyboard() {
    const [ builtinKey, isBuiltinKeyPressed ] = useBuiltinKeyboard();
    const [key, isKeyPressed] = useContext(keyContext);
    const dispatchKey = useContext(keyDispatchContext);
    useEffect(() => {
        if (isBuiltinKeyPressed) {
            dispatchKey ? dispatchKey({
                type: "update",
                key: builtinKey
            }) : null;
        }
    }, [builtinKey, isBuiltinKeyPressed, dispatchKey]);

    return [key, isKeyPressed];
}

export default function GameMain() {
    const generatedWord = useContext(WordleWordContext);
    const checkIfWordValidAndCompare = useContext(WordleWordCheckContext);
    const LetterStates = useContext(WordleLetterStatesContext);

    const [lettersAvailabilityMap, dispatchLettersAvailabilityMap] = useContext(WordleLettersAvailabilityMapContext);
    const [currentGameState, dispatchCurrentGameState, GameStates] = useContext(WordleGameStateContext);

    const [guessWord, setGuessWord] = useState("");
    const [key, isKeyPressed] = useKeyboard();
    const [ ifInput, setIfInput ] = useState(false);

    const [guessIndex, setGuessIndex] = useState(0);
    const [cursorIndex, setCursorIndex] = useState(0);

    const guessLetterStates = useRef([]);

    const [letters, setLetters] = useState([]);

    const [ popupContent, setPopupContent ] = useState("");
    const [ showPopup, setShowPopup ] = useState(false);

    const [ endGame, setEndGame ] = useState(false);

    function isLetter(char) {
        return char.length === 1 && char.match(/[a-zA-Z]/i);
    }

    function handlePopup(message, time = 2000) {
        setShowPopup(true);
        setPopupContent(message);
        setTimeout(() => {
            setShowPopup(false);
        }, time);
    }

    useEffect(() => {
        if (currentGameState === GameStates.End) {
            setEndGame(true);
        }
    }, [currentGameState, GameStates]);

    useEffect(() => {
        const items = Array.from({length: 30}).fill("");
        setLetters(items);
        if (dispatchCurrentGameState && GameStates) {
            dispatchCurrentGameState({
                type: "set",
                state: GameStates.Guessing
            })
        }
    }, [dispatchCurrentGameState, GameStates]); // launching the component

    useEffect(() => {
        if (isKeyPressed) {
            setIfInput(true);
        }
    }, [isKeyPressed]);

    useEffect(() => {
        async function handleKeyPress() {
            if (!checkIfWordValidAndCompare) return;

            if (ifInput && guessIndex < 6 && currentGameState === GameStates.Guessing) {
                if (isLetter(key) && cursorIndex < 5) {
                    if (letters[guessIndex * 5 + cursorIndex] && letters[guessIndex * 5 + cursorIndex].length) {
                        setGuessWord(prev => prev.slice(0, prev.length - 1) + key.toLowerCase());
                    } else {
                        setGuessWord(prev => prev + key.toLowerCase());
                    }
                    setLetters((prev) => {
                        const newLetters = [...prev];
                        newLetters[guessIndex * 5 + cursorIndex] = key.toUpperCase();
                        return newLetters;
                    })
                    if (cursorIndex < 4) {
                        setCursorIndex(prevState => prevState + 1);
                    }
                }
                else if (key === "Enter") {
                    console.log(guessWord, generatedWord);
                    dispatchCurrentGameState({
                        type: "set",
                        state: GameStates.CheckingStart
                    });
                    const {status, content} = await checkIfWordValidAndCompare(guessWord);
                    if (!status && typeof content === "string") {
                        dispatchCurrentGameState({
                            type: "set",
                            state: GameStates.CheckingUnrecognized
                        });
                        handlePopup(content);
                    } else if (status) {
                        dispatchCurrentGameState({
                            type: "set",
                            state: GameStates.CheckingFlip
                        });
                        guessLetterStates.current = content;
                        setGuessWord("");
                        setGuessIndex(prevState => prevState + 1);
                        setCursorIndex(0);
                    }
                }
                else if (key === "Backspace"){
                    setGuessWord(prev => prev.slice(0, prev.length - 1));
                    if (cursorIndex >= 0 && letters[guessIndex * 5 + cursorIndex]) {
                        setLetters((prev) => {
                            const newLetters = [...prev];
                            newLetters[guessIndex * 5 + cursorIndex] = "";
                            return newLetters;
                        })
                    } else if (cursorIndex - 1 >= 0) {
                        setLetters((prev) => {
                            const newLetters = [...prev];
                            newLetters[guessIndex * 5 + cursorIndex - 1] = "";
                            return newLetters;
                        })
                        if (cursorIndex > 0) {
                            setCursorIndex(prevState => prevState - 1);
                        }
                    }
                }
                setIfInput(false);
            }
        }
        handleKeyPress().then(() => {}).catch(() => {});

    }, [ifInput, currentGameState, dispatchCurrentGameState, GameStates, guessWord, generatedWord, checkIfWordValidAndCompare, letters, key, cursorIndex, guessIndex]);

    useGSAP(() => {
        if (currentGameState === GameStates.CheckingUnrecognized) {
            const tl = gsap.timeline({
                onComplete: () => {
                    dispatchCurrentGameState({
                        type: "set",
                        state: GameStates.Guessing
                    });
                },
            });
            const classes = Array.from({ length: 5 }, (_, i) => ".key-" + (guessIndex * 5 + i)).join(", ");
            tl.to(classes, {
                x: -40,
                ease: "power2.out",
                duration: 0.1,
            }).to(classes, {
                x: 40,
                ease: "bounce.out",
                duration: 0.1,
            }).to(classes, {
                x: 0,
                ease: "bounce.out",
                duration: 0.1,
            });
        }
    }, {dependencies: [currentGameState]});

    useGSAP(() => {
        if (currentGameState === GameStates.CheckingFlip) {
            const tl = gsap.timeline({
                onComplete: () => {
                    if (guessLetterStates.current.every(item => item === LetterStates.Correct)) {
                        handlePopup("Awesome! You got it!");
                        dispatchCurrentGameState({
                            type: "set",
                            state: GameStates.End
                        });
                    } else {
                        handlePopup("Try again!");
                        dispatchCurrentGameState({
                            type: "set",
                            state: GameStates.Guessing
                        });
                    }
                    if (dispatchLettersAvailabilityMap && lettersAvailabilityMap) {
                        for (let i = 0; i < 5; i++) {
                            if (lettersAvailabilityMap.get(letters[(guessIndex - 1) * 5 + i]) === LetterStates.Initial) {
                                dispatchLettersAvailabilityMap({
                                    type: "set",
                                    letter: letters[(guessIndex - 1) * 5 + i],
                                    state: guessLetterStates.current[i],
                                })
                            }
                        }
                    }
                }
            });
            const classes = Array.from({ length: 5 }, (_, i) => ".key-" + ((guessIndex - 1) * 5 + i)).join(", ");
            tl.to(classes, {
                rotateY: "360deg",
                backgroundColor: (i) => {
                    const letterState = guessLetterStates.current[i % 5];
                    if (letterState === LetterStates.Correct) return "#6aaa64";
                    if (letterState === LetterStates.Present) return "#c9b458";
                    if (letterState === LetterStates.Absent) return "#787c7e";
                },
                color: "#ffffff",
                borderColor: (i) => {
                    const letterState = guessLetterStates.current[i % 5];
                    if (letterState === LetterStates.Correct) return "#6aaa64";
                    if (letterState === LetterStates.Present) return "#c9b458";
                    if (letterState === LetterStates.Absent)  return "#787c7e";
                },
                ease: "power3.inOut",
                duration: 0.5,
                stagger: 0.2,
            })
        }
    }, {dependencies: [currentGameState]});

    return (
        <div className="w-full h-full max-h-full overflow-y-scroll">
            <div className="relative **:transition-all w-full h-full flex flex-col">
                <h1>Wordle</h1>
                <div className="grow flex flex-col place-content-center justify-evenly">
                    <div className="w-fit h-fit grid grid-cols-5 mx-auto gap-2 place-content-center place-items-stretch font-roboto-mono">
                        {letters && letters.map((item, index) => {
                            return item ? (
                                <div key={index} className={`key-${index} ` + "transition-all box-content aspect-square size-text-sm text-sm/0 sm:size-text-base sm:text-base/0 md:size-text-lg md:text-lg/0 lg:size-text-xl lg:text-xl/0 xl:size-text-2xl xl:text-2xl font-bold p-2 border-2 border-solid border-darkest-shadow bg-bright-shadow flex items-center justify-center animate-ping-once"}>
                                    {item}
                                </div>
                            ) : (
                                <div key={index} className={`key-${index} ` + "transition-all box-content aspect-square size-text-sm text-sm/0 sm:size-text-base sm:text-base/0 md:size-text-lg md:text-lg/0 lg:size-text-xl lg:text-xl/0 xl:size-text-2xl xl:text-2xl font-bold p-2 border-2 border-solid border-darker-shadow bg-bright-shadow flex items-center justify-center"}>
                                    {item}
                                </div>
                            );
                        })
                        }
                    </div>
                    <Keyboard />
                </div>
                <Show when={showPopup}>
                    <div className="absolute left-1/2 top-1/6 px-2 py-1 -translate-1/2 rounded-sm bg-foreground text-background opacity-80 text-sm animate-bounce">
                        {popupContent}
                    </div>
                </Show>
            </div>
            <Show when={endGame}>
                <div className="w-full h-full flex justify-center items-center">
                    <div className="shadow-around py-4 px-6 rounded flex flex-col gap-4 justify-evenly items-center">
                        <div className="text-2xl sm:text-3xl xl:text-4xl font-bold">End</div>
                        <div className="w-fit h-fit grid grid-cols-5 mx-auto gap-2 place-content-center place-items-stretch font-roboto-mono">
                            {Array.from({length: 5}).map((item, index) => {
                                return (
                                    <div key={index} className={`key-${index} ` + "transition-all box-content aspect-square size-text-sm text-sm/0 sm:size-text-base sm:text-base/0 md:size-text-lg md:text-lg/0 lg:size-text-xl lg:text-xl/0 xl:size-text-2xl xl:text-2xl font-bold p-2 border-2 border-solid border-darker-shadow bg-bright-shadow flex items-center justify-center"}>
                                        {item}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    )
}