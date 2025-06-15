'use client';

import {useEffect, useState, useContext, useRef} from "react";
import {useBuiltinKeyboard} from "@/hooks/useBuiltinKeyboard";
import Show from "@/components/Show";

import {keyContext, keyDispatchContext} from "@/context/KeyboardContext";
import {
    WordleGameStateContext,
    WordleWordContext,
    WordleWordCheckContext,
    WordleLettersAvailabilityBufferContext,
    WordleLettersAvailabilityMapContext,
    WordleLetterStatesContext,
    WordleWordLetterPositionContext, WordleExistedLettersBufferContext
} from "@/context/WordleContext";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";

function Keyboard() {
    const dispatchKey = useContext(keyDispatchContext);
    const [, , LetterStates] = useContext(WordleLetterStatesContext);
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
            dispatchKey?.({
                type: "set",
                key: key
            });
        }
    }

    useGSAP(() => {
        if (lettersAvailabilityBuffer && lettersAvailabilityBuffer.size) {
            const tl = gsap.timeline();
            let classes = [];
            lettersAvailabilityBuffer.forEach((state, letter) => {
                classes.push(".keyboard-key-" + letter.toUpperCase());
            });
            if (classes.length) {
                tl.to(classes, {
                    background: (i, target) => {
                        if (lettersAvailabilityBuffer.get(target.innerText) === LetterStates.Correct) return "#6aaa64";
                        if (lettersAvailabilityBuffer.get(target.innerText) === LetterStates.Present) return "#c9b458";
                        if (lettersAvailabilityBuffer.get(target.innerText) === LetterStates.Absent) return "#787c7e";
                    },
                    color: "#ffffff",
                });
            }
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
                            <button key={index} className={`keyboard-key-${item} ` + "cursor-pointer flex items-center justify-center text-sm/0 px-1 py-4 sm:text-base/0 sm:px-2 sm:py-5 lg:text-lg/0 lg:px-3 lg:py-7 rounded-sm bg-darker-shadow"}
                                    onClick={(event) => handleKeyClick(event)}>{item}</button>
                        )
                    })
                }
            </div>
            <div className="flex flex-row gap-2">
                {
                    keys[1].map((item, index) => {
                        return (
                            <button key={index} className={`keyboard-key-${item} ` + "cursor-pointer flex items-center justify-center text-sm/0 px-1 py-4 sm:text-base/0 sm:px-2 sm:py-5 lg:text-lg/0 lg:px-3 lg:py-7 rounded-sm bg-darker-shadow"}
                                    onClick={(event) => handleKeyClick(event)}>{item}</button>
                        )
                    })
                }
            </div>
            <div className="flex flex-row gap-2">
                {
                    keys[2].map((item, index) => {
                        return (
                            <button key={index} className={(item === "ENTER" || item === "DEL" ? "text-xs/0 px-1 py-4 sm:text-sm/0 sm:px-2 sm:py-5 lg:text-lg/0 lg:px-3 lg:py-7" : "text-sm/0 px-1 py-4 sm:text-base/0 sm:px-2 sm:py-5 lg:text-lg/0 lg:px-3 lg:py-7") + " " + `keyboard-key-${item} ` + "cursor-pointer flex items-center justify-center rounded-sm bg-darker-shadow"}
                                    onClick={(event) => handleKeyClick(event)}>{item}</button>
                        )
                    })
                }
            </div>
        </div>
    );
}

function useKeyboard() {
    const [builtinKey, isBuiltinKeyPressed] = useBuiltinKeyboard();
    const [key, isKeyPressed] = useContext(keyContext);
    const dispatchKey = useContext(keyDispatchContext);
    useEffect(() => {
        if (isBuiltinKeyPressed) {
            dispatchKey ? dispatchKey({
                type: "set",
                key: builtinKey
            }) : null;
        }
    }, [builtinKey, isBuiltinKeyPressed, dispatchKey]);

    return [key, isKeyPressed, dispatchKey];
}

export default function GameMain() {
    const [isFirstRender, setIsFirstRender] = useState(true);

    const guessLettersContainer = useRef(null);

    const generatedWord = useContext(WordleWordContext);
    const checkIfWordValidAndCompare = useContext(WordleWordCheckContext);
    const [guessedLetterStates, dispatchGuessedLetterStates, LetterStates] = useContext(WordleLetterStatesContext);

    const [currentGameState, dispatchCurrentGameState, GameStates, isInitializingGame] = useContext(WordleGameStateContext);
    const [, dispatchLettersAvailabilityMap] = useContext(WordleLettersAvailabilityMapContext);
    const [updatedLettersBuffer, dispatchUpdatedLettersBuffer] = useContext(WordleExistedLettersBufferContext);

    const [key, isKeyPressed, dispatchKey] = useKeyboard();
    const [ifInput, setIfInput] = useState(false);

    const [guessIndex, setGuessIndex, cursorIndex, setCursorIndex] = useContext(WordleWordLetterPositionContext);

    const [popupContent, setPopupContent] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const [endGame, setEndGame] = useState(false);
    const endWindow = useRef(null);

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

    function getKeyByClass(element, keyClassPrefixes, classes) {
        if (!Array.isArray(keyClassPrefixes)) {
            keyClassPrefixes = [keyClassPrefixes];
        }
        const selectedClass = classes.find(className => {
            return element.classList.contains(className.slice(1)); // remove the '.' at the start of a className
        });
        for (let keyClassPrefix of keyClassPrefixes) {
            const keyClassRegex =  new RegExp(`${keyClassPrefix}(\\d+)`);
            if (keyClassRegex.test(selectedClass)) {
                return {
                    foundKey: true,
                    className: selectedClass,
                    keyClassPrefix: keyClassPrefix,
                    key: parseInt(selectedClass.match(keyClassRegex)[1], 10)
                };
            }
        }
        return {
            foundKey: false,
        };
    }

    useEffect(() => {
        if (!isInitializingGame && (!generatedWord || generatedWord === "" || generatedWord.length !== 5)) {
            throw new Error("The word is not generated properly!");
        }
    }, [isInitializingGame, generatedWord]);

    useEffect(() => {
        if (currentGameState === GameStates.End && !isFirstRender) {
            setEndGame(true);
        }
    }, [currentGameState, GameStates, isFirstRender]);

    useEffect(() => {
        if (endGame && endWindow.current) {
            endWindow.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [endGame]);

    useGSAP(() => {
        if (endGame) {
            const tl = gsap.timeline();
            const classesForLastGuess = Array.from({length: 5}, (_, i) => `.last-guess-letter-key-${i}`);
            const classesForAnswer = Array.from({length: 5}, (_, i) => `.answer-letter-key-${i}`);
            tl.to([...classesForLastGuess, ...classesForAnswer], {
                rotateY: 360,
                backgroundColor: (i, element) => {
                    const letterKeyInfo = getKeyByClass(element, ["last-guess-letter-key-", "answer-letter-key-"], [...classesForLastGuess, ...classesForAnswer]);
                    if (!letterKeyInfo.foundKey) {
                        throw new Error("No letter key found!");
                    }
                    if (letterKeyInfo.keyClassPrefix === "last-guess-letter-key-") {
                        const letterKey = letterKeyInfo.key;
                        // const letterState = guessLetterStates.current[letterKey];
                        const letterState = guessedLetterStates[guessIndex * 5 + letterKey].state;
                        if (letterState === LetterStates.Correct) return "#6aaa64";
                        if (letterState === LetterStates.Present) return "#c9b458";
                        if (letterState === LetterStates.Absent) return "#787c7e";
                    } else {
                        return "#6aaa64";
                    }
                },
                color: "#ffffff",
                borderColor: (i, element) => {
                    const letterKeyInfo = getKeyByClass(element, ["last-guess-letter-key-", "answer-letter-key-"], [...classesForLastGuess, ...classesForAnswer]);
                    if (!letterKeyInfo.foundKey) {
                        throw new Error("No letter key found!");
                    }
                    if (letterKeyInfo.keyClassPrefix === "last-guess-letter-key-") {
                        const letterKey = letterKeyInfo.key;
                        const letterState = guessedLetterStates[guessIndex * 5 + letterKey].state;
                        if (letterState === LetterStates.Correct) return "#6aaa64";
                        if (letterState === LetterStates.Present) return "#c9b458";
                        if (letterState === LetterStates.Absent) return "#787c7e";
                    } else {
                        return "#6aaa64";
                    }
                },
                ease: "power3.inOut",
                duration: 0.5,
                stagger: 0.2,
            });
        }
    }, {dependencies: [endGame], scope: endWindow});

    useEffect(() => {
        if (currentGameState < GameStates.Guessing && dispatchGuessedLetterStates) {
            dispatchGuessedLetterStates({
                type: "init",
                length: 30,
            });
            if (dispatchCurrentGameState && GameStates) {
                dispatchCurrentGameState({
                    type: "set",
                    state: GameStates.Guessing
                })
            }
        }
    }, [currentGameState, GameStates, dispatchCurrentGameState, dispatchGuessedLetterStates]); // launching the component

    useEffect(() => {
        if (isKeyPressed) {
            setIfInput(true);
        }
    }, [isKeyPressed]);

    useEffect(() => {
        async function handleKeyPress() {
            if (!checkIfWordValidAndCompare || !key || !guessedLetterStates) return;
            if (!ifInput) return;
            if (currentGameState !== GameStates.Guessing && currentGameState !== GameStates.MicroCheck) return;
            dispatchCurrentGameState({
                type: "set",
                state: GameStates.MicroCheck,
            });
            let ifEnter = false;

            if (guessIndex < 6) {
                if (isLetter(key) && cursorIndex < 5) {
                    dispatchGuessedLetterStates({
                        type: "setLetter",
                        index: guessIndex * 5 + cursorIndex,
                        letter: key.toUpperCase(),
                    });
                    if (cursorIndex < 4) {
                        setCursorIndex(prevState => prevState + 1);
                    }
                }
                else if (key === "Enter") {
                    ifEnter = true;
                    dispatchCurrentGameState({
                        type: "set",
                        state: GameStates.CheckingStart
                    });
                    const guessWord = guessedLetterStates.slice(guessIndex * 5, guessIndex * 5 + 5).map(item => item.letter.toLowerCase()).join("");
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
                        dispatchGuessedLetterStates({
                            type: "setStates",
                            startIndex: guessIndex * 5,
                            states: content
                        });
                    }
                }
                else if (key === "Backspace"){
                    if (cursorIndex >= 0 && guessedLetterStates[guessIndex * 5 + cursorIndex].letter) {
                        dispatchGuessedLetterStates({
                            type: "remove",
                            index: guessIndex * 5 + cursorIndex
                        });
                    } else if (cursorIndex - 1 >= 0) {
                        dispatchGuessedLetterStates({
                            type: "remove",
                            index: guessIndex * 5 + cursorIndex - 1
                        });
                        if (cursorIndex > 0) {
                            setCursorIndex(prevState => prevState - 1);
                        }
                    }
                }
            }
            setIfInput(false);
            dispatchKey ? dispatchKey({
                type: "clear"
            }) : null;
            if (!ifEnter) {
                dispatchCurrentGameState({
                    type: "set",
                    state: GameStates.Guessing
                });
            }
        }
        handleKeyPress().then(() => {}).catch(() => {});
    }, [ifInput, currentGameState, dispatchCurrentGameState, GameStates, generatedWord, checkIfWordValidAndCompare, key, dispatchKey, cursorIndex, setCursorIndex, guessIndex, guessedLetterStates, dispatchGuessedLetterStates]);

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
            const classes = Array.from({ length: 5 }, (_, i) => ".guess-letter-key-" + (guessIndex * 5 + i));
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
    }, {dependencies: [currentGameState], scope: guessLettersContainer});

    useGSAP(() => {
        if (!isInitializingGame && updatedLettersBuffer && updatedLettersBuffer.size && guessedLetterStates) {
            const tl = gsap.timeline();
            let classes = [];
            updatedLettersBuffer.forEach(({letter, actions}, key) => {
                if (actions.includes("setLetter") || actions.includes("remove")) {
                    classes.push(".guess-letter-key-" + key);
                }
            });
            if (classes.length) {
                tl.to(classes, {
                    onStart: function () {
                        this.targets().forEach(element => {
                            const letterKeyInfo = getKeyByClass(element, "guess-letter-key-", classes);
                            if (!letterKeyInfo.foundKey) {
                                throw new Error("No letter key found!");
                            }
                            if (updatedLettersBuffer.has(letterKeyInfo.key)) {
                                const actions = updatedLettersBuffer.get(letterKeyInfo.key).actions;
                                if (actions.includes("setLetter")) {
                                    element.classList.remove("border-darker-shadow");
                                    element.classList.add("border-darkest-shadow");
                                } else if (actions.includes("remove")) {
                                    element.classList.remove("border-darkest-shadow");
                                    element.classList.add("border-darker-shadow");
                                }
                            }
                        })
                    },
                    scale: (i, element) => {
                        const letterKeyInfo = getKeyByClass(element, "guess-letter-key-", classes);
                        if (!letterKeyInfo.foundKey) {
                            throw new Error("No letter key found!");
                        }
                        if (updatedLettersBuffer.has(letterKeyInfo.key)){
                            const actions = updatedLettersBuffer.get(letterKeyInfo.key).actions;
                            if (!actions.includes("setState") && actions.includes("setLetter")) {
                                return 1.2;
                            }
                        }
                    },
                    rotateY: 0,
                    ease: "power1.out",
                    duration: 0.15,
                }).to(classes, {
                    scale: 1,
                    rotateY: 0,
                    ease: "power3.out",
                    duration: 0.05
                })
            }
            dispatchUpdatedLettersBuffer({
                type: "clearActions",
                actions: ["remove", "setLetter"]
            });
        }
    }, {dependencies: [updatedLettersBuffer, isInitializingGame, isFirstRender, guessedLetterStates], scope: guessLettersContainer})

    useGSAP(() => {
        if (!isInitializingGame && updatedLettersBuffer && updatedLettersBuffer.size && guessedLetterStates) {
            let ifStateChanged = false;
            const tl = gsap.timeline({
                onComplete: () => {
                    if (ifStateChanged) {
                        if (dispatchLettersAvailabilityMap) {
                            for (let i = 0; i < 5; i++) {
                                dispatchLettersAvailabilityMap({
                                    type: "set",
                                    letter: guessedLetterStates[guessIndex * 5 + i].letter,
                                    state: guessedLetterStates[guessIndex * 5 + i].state
                                })
                            }
                        }

                        if (isFirstRender) {
                            // check if the guessIndex should increment
                            if (guessIndex * 5 + 4 < guessedLetterStates.length && guessedLetterStates[guessIndex * 5 + 4].state !== LetterStates.Initial) {
                                if (guessedLetterStates.slice(guessIndex * 5, guessIndex * 5 + 5).every(item => item.state === LetterStates.Correct) || guessIndex >= 5) {
                                    dispatchCurrentGameState({
                                        type: "set",
                                        state: GameStates.End
                                    });
                                } else {
                                    dispatchCurrentGameState({
                                        type: "set",
                                        state: GameStates.Guessing
                                    });
                                    setGuessIndex(prevState => prevState + 1);
                                    setCursorIndex(0);
                                }
                            } else if (guessIndex * 5 + 4 < guessedLetterStates.length && guessedLetterStates[guessIndex * 5 + 4].state === LetterStates.Initial) {
                                if (guessIndex - 1 >= 0 && guessedLetterStates.slice((guessIndex - 1) * 5, (guessIndex - 1) * 5 + 5).every(item => item.state === LetterStates.Correct)) {
                                    setGuessIndex(prevState => prevState - 1);
                                    dispatchCurrentGameState({
                                        type: "set",
                                        state: GameStates.End
                                    });
                                }
                            }
                        } else {
                            if (guessedLetterStates.slice(guessIndex * 5, guessIndex * 5 + 5).every(item => item.state === LetterStates.Correct) || guessIndex >= 5) {
                                handlePopup("Awesome! You got it!");
                                dispatchCurrentGameState({
                                    type: "set",
                                    state: GameStates.End
                                });
                            } else {
                                setGuessIndex(prevState => prevState + 1);
                                setCursorIndex(0);
                                handlePopup("Try again!");
                                dispatchCurrentGameState({
                                    type: "set",
                                    state: GameStates.Guessing
                                });
                            }
                        }
                    }
                    if (isFirstRender) {
                        setIsFirstRender(false);
                    }
                }
            });
            let classes = [];
            updatedLettersBuffer.forEach(({letter, actions}, key) => {
                if (actions.includes("setState")) {
                    classes.push(".guess-letter-key-" + key);
                }
            });
            if (classes.length) {
                ifStateChanged = true;
                tl.to(classes, {
                    rotateY: 360,
                    backgroundColor: (i, element) => {
                        const letterKeyInfo = getKeyByClass(element, "guess-letter-key-", classes);
                        if (!letterKeyInfo.foundKey) {
                            throw new Error("No letter key found!");
                        }
                        if (updatedLettersBuffer.has(letterKeyInfo.key)) {
                            const letterState = updatedLettersBuffer.get(letterKeyInfo.key).state;
                            if (letterState === LetterStates.Correct) return "#6aaa64";
                            if (letterState === LetterStates.Present) return "#c9b458";
                            if (letterState === LetterStates.Absent) return "#787c7e";
                        }
                    },
                    borderColor: (i, element) => {
                        const letterKeyInfo = getKeyByClass(element, "guess-letter-key-", classes);
                        if (!letterKeyInfo.foundKey) {
                            throw new Error("No letter key found!");
                        }
                        if (updatedLettersBuffer.has(letterKeyInfo.key)) {
                            const letterState = updatedLettersBuffer.get(letterKeyInfo.key).state;
                            if (letterState === LetterStates.Correct) return "#6aaa64";
                            if (letterState === LetterStates.Present) return "#c9b458";
                            if (letterState === LetterStates.Absent) return "#787c7e";
                        }
                    },
                    color: "#ffffff",
                    ease: "power3.inOut",
                    duration: 0.5,
                    stagger: 0.2,
                });
            }
            dispatchUpdatedLettersBuffer({
                type: "clearActions",
                actions: ["setState"]
            });
        }
    }, {dependencies: [updatedLettersBuffer, isInitializingGame, isFirstRender, guessedLetterStates], scope: guessLettersContainer})
    return (
        <>
            <div className="w-full h-full flex flex-col justify-center items-center">
                <div className="relative w-full min-h-4/5 max-h-full bg-background flex flex-col gap-4 justify-evenly items-center overflow-hidden">
                    <h1>Wordle</h1>
                    <div className="grow m-4 self-stretch flex flex-col flex-wrap items-center justify-evenly gap-2 overflow-auto">
                        <div ref={guessLettersContainer} className="w-fit h-fit grid grid-cols-5 mx-auto my-2 gap-2 place-content-center place-items-stretch font-roboto-mono">
                            {guessedLetterStates && guessedLetterStates.map((item, index) => {
                                return (
                                    <div key={index} className={`guess-letter-key-${index} ` + "transition-all box-content aspect-square size-text-sm text-sm/0 sm:size-text-base sm:text-base/0 md:size-text-lg md:text-lg/0 lg:size-text-xl lg:text-xl/0 xl:size-text-2xl xl:text-2xl font-bold p-2 border-2 border-solid border-darker-shadow bg-bright-shadow flex items-center justify-center"}>
                                        {item.letter}
                                    </div>
                                )
                            })
                            }
                        </div>
                        <div className="mx-auto block"><Keyboard/></div>
                    </div>
                    <Show when={showPopup}>
                        <div className="absolute left-1/2 top-1/6 p-2 text-sm xl:text-base -translate-1/2 rounded-sm bg-foreground text-background opacity-80 animate-bounce">
                            {popupContent}
                        </div>
                    </Show>
                </div>
            </div>
            <div ref={endWindow} className={(endGame ? "" : "hidden ") + "w-full h-full flex justify-center items-center"}>
                <div className="bg-background shadow-around py-4 px-6 rounded flex flex-col gap-4 justify-evenly items-center">
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-bold">End</div>
                    <div className="flex flex-col gap-2 items-center">
                        Your Last Guess
                        <div className="w-fit h-fit grid grid-cols-5 mx-auto gap-2 place-content-center place-items-stretch font-roboto-mono">
                            {guessedLetterStates && guessedLetterStates.slice(guessIndex * 5, guessIndex * 5 + 5).map((item, index) => {
                                return (
                                    <div key={index} className={`last-guess-letter-key-${index} ` + "transition-all box-content aspect-square size-text-sm text-sm/0 sm:size-text-base sm:text-base/0 md:size-text-lg md:text-lg/0 lg:size-text-xl lg:text-xl/0 xl:size-text-2xl xl:text-2xl font-bold text-transparent p-2 border-2 border-solid border-darker-shadow bg-bright-shadow flex items-center justify-center"}>
                                        {item.letter}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        The Word
                        <div className="w-fit h-fit grid grid-cols-5 mx-auto gap-2 place-content-center place-items-stretch font-roboto-mono">
                            {Array.from(generatedWord, (letter) => letter.toUpperCase()).map((item, index) => {
                                return (
                                    <div key={index} className={`answer-letter-key-${index} ` + "transition-all box-content aspect-square size-text-sm text-sm/0 sm:size-text-base sm:text-base/0 md:size-text-lg md:text-lg/0 lg:size-text-xl lg:text-xl/0 xl:size-text-2xl xl:text-2xl font-bold text-transparent p-2 border-2 border-solid border-darker-shadow bg-bright-shadow flex items-center justify-center"}>
                                        {item}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch justify-center sm:items-center sm:justify-stretch text-center gap-2">
                        <Link className="rounded-2xl border border-solid border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base px-4 py-2"
                              href="/game-start">
                            Try Another One?
                        </Link>
                        <Link className="rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base px-4 py-2"
                              href="/">
                            Close?
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}