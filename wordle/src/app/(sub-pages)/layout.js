'use client';

import {usePathname, useRouter} from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";

export default function Layout({children}) {
    const router = useRouter();
    const pathname = usePathname();
    return (
        <div className="w-screen h-screen px-2 py-2 md:px-6 md:py-8 lg:px-14 grid grid-rows-[auto_1fr] gap-2">
            <button className="cursor-pointer place-self-start text-xl sm:text-2xl"
                  onClick={() => {
                      if (pathname === "/game-start" || pathname === "/game-intro" || pathname === "/app-intro") {
                          router.push("/");
                      } else if (pathname === "/game-main") {
                          router.push("/game-start");
                      }
                  }}>
                <IoIosArrowBack />
            </button>
            <div className="place-self-stretch overflow-auto">
                {children}
            </div>
        </div>
    );
}