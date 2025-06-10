import LettersFalling from "@/components/LettersFalling";

export default function GameIntro() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            <LettersFalling positionClass="absolute" className="hidden sm:block -z-50 top-0 left-0" />
            <div className="max-w-full max-h-full bg-background shadow-around py-4 px-6 rounded flex flex-col gap-4 justify-evenly items-center">
                <h1 className="text-center">About Wordle</h1>
                <div className="grow z-50 w-9/10 flex flex-col place-content-center sm:justify-evenly gap-2 overflow-y-auto">
                    <div className="flex flex-col items-center">
                        <h2 className="w-full grid grid-cols-[1fr_auto_1fr] grid-rows-1 gap-2">
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                            Intro
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                        </h2>
                        <p className="tracking-tight text-sm sm:text-base text-center">
                            Wordle is a fun word-guessing game that challenges players to guess a hidden five-letter word in
                            six attempts or less. Each guess must be a valid five-letter word, and after submitting a guess,
                            the game provides feedback to help players refine their choices.
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="w-full grid grid-cols-[1fr_auto_1fr] grid-rows-1 gap-2">
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                            Game Rule
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                        </h2>
                        <ol className="ms-[2rem] list-outside list-decimal tracking-tight text-sm sm:text-base">
                            <li className="font-semibold">Make a Guess</li>
                            <li><span className="font-semibold">Check you Guess: </span>
                                After each guess, the game highlights letters in different colors:
                                <ul className="list-inside list-disc">
                                    <li><span className="font-semibold text-wordle-correct">Green</span>: The letter is correct and in the right position.</li>
                                    <li><span className="font-semibold text-wordle-present">Yellow</span>: The letter is correct but in the wrong position.</li>
                                    <li><span className="font-semibold text-wordle-absent">Gray</span>: The letter is not in the word at all.</li>
                                </ul>
                            </li>
                            <li><span className="font-semibold">Repeat</span>: Use the feedback to adjust your next attempt.</li>
                            <li><span className="font-semibold">Win or Lose</span>: If you guess the word within six attempts, you win! If not, the correct word is revealed.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}