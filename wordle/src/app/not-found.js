import Link from "next/link";

export default function NotFound() {
    return (
        <div className="w-screen h-screen px-4 py-6 grid grid-rows-[auto_1fr_auto] gap-2 justify-center text-center">
            <div className="row-start-2 flex flex-col items-center justify-center place-items-center">
                <h1>404 - Page Not Found</h1>
                <p>Sorry, the page you are looking for does not exist.</p>
                <Link href="/" className="mt-6 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">Go back to home</Link>
            </div>
        </div>
    );
}