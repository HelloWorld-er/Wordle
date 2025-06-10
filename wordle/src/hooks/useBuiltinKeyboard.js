import {useEffect, useState} from "react";

export function useBuiltinKeyboard() {
    const [key, setKey] = useState(null);
    const [isKeyUpdated, setIsKeyPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();
            setKey(event.key);
            setIsKeyPressed(true);
        };

        const handleKeyUp = () => {
            setIsKeyPressed(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return [key, isKeyUpdated];
}