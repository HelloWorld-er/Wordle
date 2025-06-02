'use client';

import {createContext, useEffect, useReducer, useState} from "react";

export const keyContext = createContext(null);
export const keyDispatchContext = createContext(null);

export default function KeyboardContextProvider({children}) {
    const [isKeyPressed, setIsKeyPressed] = useState(false);

    const [key, dispatchKey] = useReducer((key, action) => {
        switch (action.type) {
            case "update": {
                setIsKeyPressed(true);
                return action.key;
            }
        }
    }, "", undefined);

    useEffect(() => {
        if (isKeyPressed) {
            setIsKeyPressed(false);
        }
    }, [isKeyPressed]);

    return (
        <keyContext.Provider value={[key, isKeyPressed]}>
            <keyDispatchContext.Provider value={dispatchKey}>
                {children}
            </keyDispatchContext.Provider>
        </keyContext.Provider>
    );
}