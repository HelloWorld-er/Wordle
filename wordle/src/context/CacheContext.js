'use client';

import {createContext, useEffect, useRef, useState} from "react";
import {load} from "@tauri-apps/plugin-store";
import * as path from '@tauri-apps/api/path';
import {getCurrentWindow} from "@tauri-apps/api/window";



export const HandleCacheContext = createContext(null);

async function loadCacheStore() {
    console.log(await path.join(await path.appCacheDir() + '/store.json'))
    return await load(await path.join(await path.appCacheDir() + '/store.json'), {autoSave: false});
}

export function CacheContextProvider({children}) {
    const ifCloseRequested = useRef(false);
    const cacheStore = useRef(null);
    const [ifCacheStoreAvailable, setIfCacheStoreAvailable] = useState(false);
    useEffect(() => {
        let unlisten = null;
        const fetchStore = async () => {
            console.log("Loading cache store...");
            cacheStore.current = await loadCacheStore();
            const appWindow = getCurrentWindow();
            unlisten = await appWindow.onCloseRequested(async () => {
                if (ifCloseRequested.current) {
                    return;
                }
                ifCloseRequested.current = true; // Prevent multiple close requests
                await cacheStore.current.clear();
                await cacheStore.current.save(); // Persist cleared store
                console.log("Cache store cleared and saved.");
                await appWindow.close();
            });
            setIfCacheStoreAvailable(true);
        };
        fetchStore().then().catch();
        return () => {
            unlisten ? unlisten() : null;
        };
    }, []);

    async function handleDataInCache(action) {
        if (!cacheStore) return null;
        console.log(action);
        console.log("cacheStoreRef keys: ", await cacheStore.current.keys());
        console.log("cacheStoreRef values: ", await cacheStore.current.values());
        switch (action.type) {
            case "get": {
                return await cacheStore.current.get(action.key);
            }
            case "set": {
                await cacheStore.current.set(action.key, action.value);
                await cacheStore.current.save();
                return;
            }
            case "has": {
                return await cacheStore.current.has(action.key);
            }
            case "delete": {
                await cacheStore.current.delete(action.key);
                await cacheStore.current.save();
                return;
            }
            case "clear": {
                await cacheStore.current.clear();
                await cacheStore.current.save();
                return;
            }
            case "init": {
                await cacheStore.current.init();
                await cacheStore.current.save();
                setIfCacheStoreAvailable(true);
                return;
            }
            case "close": {
                await cacheStore.current.clear();
                await cacheStore.current.close();
                setIfCacheStoreAvailable(false);
                return;
            }
        }
    }

    return (
        <HandleCacheContext.Provider value={[ifCacheStoreAvailable, handleDataInCache]}>
            {children}
        </HandleCacheContext.Provider>
    );
}