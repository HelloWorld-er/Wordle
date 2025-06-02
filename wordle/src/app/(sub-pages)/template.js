'use client';

import {useRouter} from "next/navigation";
import Image from "next/image";

export default function Template({children}) {
    const router = useRouter();
    return (
        <div className="w-screen h-screen px-2 py-2 md:px-6 md:py-8 lg:px-14 grid grid-rows-[auto_1fr] gap-2">
            <button className="cursor-pointer place-self-start"
                  onClick={() => {
                      router.back();
                  }}>
                <Image src="./backIcon.svg"  alt="Go Back" width={25} height={25} />
            </button>
            <div className="place-self-stretch overflow-auto">
                {children}
            </div>
        </div>
    );
}