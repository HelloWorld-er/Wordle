import Link from "next/link";
import Typist from "modern-react-typist";
import LettersFalling from "@/components/LettersFalling";

export default function Home() {
  return (
      <div className="relative">
        <LettersFalling positionClass="absolute" className="hidden md:block top-0 left-0"/>
        <div className="flex flex-col items-center justify-evenly justify-items-center h-screen px-6 py-8 lg:px-14 overflow-y-auto">
          <main className="grow z-50 flex flex-col items-center place-content-center place-items-stretch sm:items-start gap-4">
            <h1 className="">Wordle</h1>
            <Typist cursor={<span className="animate-pulse mx-2">|</span>} delay={50}>
              <div className="tracking-tight text-sm sm:text-base flex flex-col items-center text-center sm:text-left sm:items-start">
                <p>Wordle is a web-based word game created and developed by the Welsh software engineer Josh Wardle.</p>
              </div>
            </Typist>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <Link
                  className="w-fit rounded-3xl border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-center font-medium text-sm px-4 py-2 sm:text-base sm:px-5 sm:w-auto"
                  href="/game-start"
              >
                Start to Play
              </Link>
              <Link
                  className="w-fit rounded-3xl border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-center font-medium text-sm px-4 py-2 sm:text-base sm:px-5 sm:w-auto"
                  href="/game-intro"
              >
                Read more about Wordle
              </Link>
              <Link
                  className="w-fit rounded-3xl border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-center font-medium text-sm px-4 py-2 sm:text-base sm:px-5 sm:w-auto"
                  href="/app-intro"
              >
                Read more about this app
              </Link>
            </div>
          </main>
          <footer className="flex flex-wrap items-center justify-center text-xs">
            Built by Yimin Liu
          </footer>
        </div>
      </div>
  );
}
