import LettersFalling from "@/components/LettersFalling";

export default function GameIntro() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            <LettersFalling positionClass="absolute" className="hidden sm:block -z-50 top-0 left-0" />
            <div className="max-w-full max-h-full bg-background shadow-around py-4 px-6 rounded flex flex-col gap-4 justify-evenly items-center">
                <h1 className="text-center">About this App</h1>
                <div className="grow z-50 w-9/10 flex flex-col place-content-center sm:justify-evenly gap-2 overflow-y-auto">
                    <div className="flex flex-col items-center">
                        <h2 className="w-full grid grid-cols-[1fr_auto_1fr] grid-rows-1 gap-2">
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                            Intro
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                        </h2>
                        <p className="tracking-tight text-sm sm:text-base text-center">
                            This is an open-source wordle game licensed under the MIT license. This app is hosted and published on Github.
                        </p>
                        <ul className="list-inside list-disc">
                            <li className="tracking-tight text-sm sm:text-base text-center">
                                You can find the source code at <span className="font-bold text-blue-500 break-all">https://github.com/HelloWorld-er/Wordle</span>
                            </li>
                            <li className="tracking-tight text-sm sm:text-base text-center">
                                You can find other versions of this app at <span className="font-bold text-blue-500 break-all">https://github.com/HelloWorld-er/Wordle/releases</span>
                                <p className="font-semibold text-red-500">Currently, update is not supported in this app. If you want to update to a newer version, you have to install it by yourself.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="w-full grid grid-cols-[1fr_auto_1fr] grid-rows-1 gap-2">
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                            Acknowledgements
                            <span className="box-border border-b-2 h-1/2 border-b-darkest-shadow"></span>
                        </h2>
                        <ul className="ms-[2rem] list-outside list-disc tracking-tight text-sm sm:text-base">
                            <li>
                                <span className="font-semibold">Tauri 2.0</span>:
                                The framework used to build this app, allowing it to run as a desktop application.
                            </li>
                            <li>
                                <span className="font-semibold">NextJS</span>:
                                The framework used to build the frontend of this app, providing a robust and scalable architecture.
                            </li>
                            <li>
                                <span className="font-semibold">TailwindCSS</span>:
                                The CSS framework used for styling this app, enabling rapid and responsive design.
                            </li>
                            <li>
                                <span className="font-semibold">GSAP</span>:
                                The animation library used to create smooth and engaging animations in this app.
                            </li>
                            <li>
                                <span className="font-semibold">wordle-list</span>:
                                The word list used in this project is sourced from tabatkins/wordle-list which is hosted at <span className="font-bold text-blue-500 break-all">https://github.com/tabatkins/wordle-list</span> and is licensed under the MIT License.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}