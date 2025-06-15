let wordList = []; // Store globally

async function fetchWordListOnce() {
    if (wordList.length === 0) {
        const wordListResponse = await fetch("/wordList.json");
        if (!wordListResponse.ok) {
            throw new Error("Failed to fetch word list");
        }
        wordList = await wordListResponse.json();
    }
}

export async function fetchARandomWord() {
    await fetchWordListOnce();
    try {
        return [true, wordList[Math.floor(Math.random() * wordList.length)]];
    } catch (error) {
        return [false, error];
    }
}

export async function checkIfAWordValid(word){
    await fetchWordListOnce();
    try {
        return [true, wordList.includes(word)];
    } catch (error) {
        return [false, error];
    }
}
