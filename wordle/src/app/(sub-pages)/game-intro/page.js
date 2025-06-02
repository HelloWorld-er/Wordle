import LettersFalling from "@/components/LettersFalling";

export default function GameIntro() {
    return (
        <div className="relative w-full h-full">
            <LettersFalling positionClass="absolute" className="top-0 left-0 z-0" />
            <div className="w-full h-full grid grid-rows-[auto_1fr] gap-4">
                <h1>About Wordle</h1>
                <div className="flex items-center justify-center">
                    <div className="w-9/10 z-50 flex flex-col gap-16 justify-between">
                        <div className="flex flex-col items-center">
                            <h2 className="font-bold text-xl w-full grid grid-cols-[1fr_auto_1fr] grid-rows-1 gap-2">
                                <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                                Intro
                                <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                            </h2>
                            <p>
                                Wordle is a fun word-guessing game that challenges players to guess a hidden five-letter word in
                                six attempts or less. Each guess must be a valid five-letter word, and after submitting a guess,
                                the game provides feedback to help players refine their choices.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <h2 className="font-bold text-xl w-full grid grid-cols-[1fr_auto_1fr] grid-rows-1 gap-2">
                                <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                                Game Rule
                                <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                            </h2>
                            <ol className="ms-[2rem] list-outside list-decimal">
                                <li className="font-semibold">Make a Guess</li>
                                <li className=""><span className="font-semibold">Check you Guess: </span>
                                    After each guess, the game highlights letters in different colors:
                                    <ul className="list-inside list-disc">
                                        <li><span className="font-semibold">Green</span>: The letter is correct and in the right position.</li>
                                        <li><span className="font-semibold">Yellow</span>: The letter is correct but in the wrong position.</li>
                                        <li><span className="font-semibold">Gray</span>: The letter is not in the word at all.</li>
                                    </ul>
                                </li>
                                <li><span className="font-semibold">Repeat</span>: Use the feedback to adjust your next attempt.</li>
                                <li><span className="font-semibold">Win or Lose</span>: If you guess the word within six attempts, you win! If not, the correct word is revealed.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}