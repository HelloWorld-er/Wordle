'use client';

import {createContext, useReducer, useState} from "react";

export const keyContext = createContext(null);
export const keyDispatchContext = createContext(null);

export default function KeyboardContextProvider({children}) {
    const [isKeyPressed, setIsKeyPressed] = useState(false);

    const [key, dispatchKey] = useReducer((key, action) => {
        switch (action.type) {
            case "set": {
                if (!isKeyPressed) {
                    setIsKeyPressed(true);
                    return action.key;
                }
                return key;
            }
            case "clear": {
                setIsKeyPressed(false);
                return "";
            }
        }
    }, "", undefined);

    return (
        <keyContext.Provider value={[key, isKeyPressed]}>
            <keyDispatchContext.Provider value={dispatchKey}>
                {children}
            </keyDispatchContext.Provider>
        </keyContext.Provider>
    );
}