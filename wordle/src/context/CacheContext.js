'use client';

import {createContext} from "react";



export const HandleCacheContext = createContext(null);

export function CacheContextProvider({children}) {
    function handleDataInCache(action) {
        switch (action.type) {
            case "get": {
                return JSON.parse(sessionStorage.getItem(action.key));
            }
            case "set": {
                sessionStorage.setItem(action.key, JSON.stringify(action.value));
                return;
            }
            case "has": {
                return sessionStorage.getItem(action.key);
            }
            case "delete": {
                sessionStorage.removeItem(action.key);
                return;
            }
            case "clear": {
                sessionStorage.clear();
                return;
            }
        }
    }

    return (
        <HandleCacheContext.Provider value={handleDataInCache}>
            {children}
        </HandleCacheContext.Provider>
    );
}