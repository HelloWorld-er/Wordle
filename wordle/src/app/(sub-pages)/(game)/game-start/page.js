'use client';

import Show from "@/components/Show";
import Typist from "modern-react-typist";
import {useContext, useEffect, useRef, useState} from "react";
import {WordleGameStateContext, WordleWordDispatchContext} from "@/context/WordleContext";
import Link from "next/link";

export default function GameStart() {
    const [currentGameState, dispatchCurrentGameState, GameStates, isFirstRender] = useContext(WordleGameStateContext);
    const generateNewWord = useContext(WordleWordDispatchContext);

    const ifReset = useRef(false);

    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");

    useEffect(() => {
        if (!isFirstRender && !ifReset.current) {
            if (currentGameState !== GameStates.Initial && currentGameState !== GameStates.Generated) {
                dispatchCurrentGameState({
                    type: "reset",
                });
            }
            ifReset.current = true;
        }
    }, [isFirstRender, currentGameState, dispatchCurrentGameState, GameStates])

    async function generateAWord() {
        if (generateNewWord) {
            await generateNewWord();
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <Show when={currentGameState === GameStates.Initial}>
                <button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                        onClick={async () => {
                            await generateAWord();
                            dispatchCurrentGameState({
                                type: "set",
                                state: GameStates.Generated
                            });
                        }}>Start a Game</button>
            </Show>
            <Show when={currentGameState === GameStates.Generated}>
                <Link className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                      href="/game-main">
                    Open the panel to try
                </Link>
                <button className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                        onClick={async () => {
                            await generateAWord();
                            dispatchCurrentGameState({
                                type: "reset"
                            });
                            setShowPopup(true);
                            setPopupContent("reset");
                            setTimeout(() => {
                                setShowPopup(false);
                            }, 2000);
                        }}>Re-generate (reset) ?</button>
            </Show>
            <Show when={currentGameState === GameStates.Generated}>
                <Typist delay={10}>
                    <p>A new word is generated.</p>
                </Typist>
            </Show>
            <Show when={showPopup}>
                <div className="absolute left-1/2 top-1/6 px-2 py-1 -translate-1/2 rounded-sm bg-foreground text-background opacity-80 text-sm animate-bounce">
                    {popupContent}
                </div>
            </Show>
        </div>
    );
}