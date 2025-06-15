'use client';

import WordleContextProvider from "@/context/WordleContext";

export default function Layout({children}) {
    return (
        <WordleContextProvider>
                {children}
        </WordleContextProvider>
    );
}