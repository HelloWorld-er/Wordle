'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import Link from "next/link";

export default function Error({error, reset}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error])

    return (
        <div className="absolute w-screen h-screen flex flex-col place-content-center items-center justify-evenly">
            <div className="absolute inset-4 sm:inset-10 p-2 flex place-content-center">
                <div className="flex flex-col justify-evenly items-center gap-4 bg-background shadow-around p-2 sm:py-4 sm:px-6 rounded">
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-bold">Error</div>
                    <div className="grow overflow-y-auto flex flex-col justify-evenly items-center gap-4">
                        <div className="grow flex flex-col place-content-center mx-2 text-center text-base sm:text-lg">
                            <div>
                                <span className="font-semibold">Error Message</span>: {error.message}
                            </div>
                            <div className="mt-2 flex flex-col sm:flex-row items-stretch justify-center sm:items-center sm:justify-stretch text-center gap-2">
                                <button className="rounded-xl border border-solid border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base px-4 py-2"
                                        onClick={() => reset()}
                                >
                                    Reload parts where the error is raised?
                                </button>
                                <Link className="rounded-xl border border-solid border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base px-4 py-2"
                                      href="/game-start">
                                    Back to generate an another wordle word?
                                </Link>
                                <Link className="rounded-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base px-4 py-2"
                                      href="/">
                                    Back to Home Page?
                                </Link>
                            </div>
                        </div>
                        <p className="mx-2 mt-4 text-red-500 text-sm sm:text-base">
                            <span className="font-semibold underline underline-offset-2 decoration-2">Last Resort</span>: If all of the above do not work, please try to refresh the page or reopen the app.
                        </p>
                        <p className="mx-2 text-xs">
                            If possible, please report the issue to the developer at <span className="font-bold text-blue-500 break-all">https://github.com/HelloWorld-er/Wordle/issues</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}