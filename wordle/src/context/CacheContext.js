'use client';

import {createContext} from "react";



export const HandleCacheContext = createContext(null);

export function CacheContextProvider({children}) {
    function handleDataInCache(action) {
        console.log(action);
        console.log("session storage: ", sessionStorage);
        console.log("cacheStore keys: ", Object.keys(sessionStorage));
        console.log("cacheStore values: ", Object.values(sessionStorage));
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