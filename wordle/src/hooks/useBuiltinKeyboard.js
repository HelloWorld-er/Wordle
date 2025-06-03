import {useEffect, useState} from "react";

export function useBuiltinKeyboard() {
    const [key, setKey] = useState(null);
    const [isKeyUpdated, setisKeyUpdated] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();
            setKey(event.key);
            setisKeyUpdated(true);
        };

        const handleKeyUp = () => {
            setisKeyUpdated(false);
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