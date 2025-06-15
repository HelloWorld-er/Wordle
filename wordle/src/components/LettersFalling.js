'use client';

import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {Physics2DPlugin} from "gsap/Physics2DPlugin";
import {useEffect, useRef, useState} from "react";

gsap.registerPlugin(Physics2DPlugin);

export default function LettersFalling({className, style, positionClass = "relative"}) {
    const animationContainer = useRef(null);
    const [isItemsCreated, setIsItemsCreated] = useState(false);
    const animateItemClassName = "falling-letter";
    const numberOfAnimateItem = 50;

    const [generatedLetters, setGeneratedLetters] = useState([]);

    function generateNewLetters(numberOfLetters) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const newLetters = Array.from({length: numberOfLetters}, () => {
            return {
                letter: letters[Math.floor(Math.random() * letters.length)],
                className: animateItemClassName,
            };
        });
        setGeneratedLetters(newLetters);
    }

    useEffect(() => {
        if (!isItemsCreated) {
            generateNewLetters(numberOfAnimateItem);
            setIsItemsCreated(true);
        }
    }, [isItemsCreated]);

    useGSAP(() => {
        if (isItemsCreated) {
            const tl = gsap.timeline({});

            tl.set(animationContainer.current.children, {
                clearProps: "all",
            }).set(animationContainer.current.children, {
                top: "-10%",
                left: () => Math.random() * 100 + "%",
            }).to(animationContainer.current.children, {
                top: "100%",
                rotate: () => Math.random() > 0.5 ? 360 * Math.random() : -360 * Math.random(),
                duration: 3,
                stagger: 0.1,
                ease: "power1.in",
                physics2D: {
                    velocity: 100,
                    angle: 90,
                    gravity: 200,
                },
                onComplete: () => {
                    setIsItemsCreated(false);
                },
            });
        }
    }, {dependencies: [isItemsCreated], scope: animationContainer});

    return (
        <div ref={animationContainer} className={"w-full h-full overflow-hidden" + " " + className + " " + positionClass} style={style}>
            {generatedLetters.map((item, index) => {
                return (
                    <span key={index} className={"absolute select-none" + " " + item.className}>
                        {item.letter}
                    </span>
                );
            })}
        </div>
    );
}