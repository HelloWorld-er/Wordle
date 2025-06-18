import { openPath } from '@tauri-apps/plugin-opener';

export async function openLinkInBrowser(link) {
    try {
        await openPath(link);
    } catch (e) {
        console.error("Failed to open link:", e);
    }
}
