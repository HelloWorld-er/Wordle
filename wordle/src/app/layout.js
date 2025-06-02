import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import KeyboardContextProvider from "@/context/KeyboardContext";
import WordleInfoContextProvider from "@/context/WordleInfoContext";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wordle",
  description: "An open source project of the popular game Wordle",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased font-roboto bg-background text-foreground`}
      >
          <KeyboardContextProvider>
              <WordleInfoContextProvider>
                  {children}
              </WordleInfoContextProvider>
          </KeyboardContextProvider>
      </body>
    </html>
  );
}
