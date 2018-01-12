/**
 * Utilities for unit tests that use Storybook.
 * 
 * @author Silas Hsu
 */

import $ from 'jquery';
import Nightmare from 'nightmare';
import tcpPortUsed from 'tcp-port-used';

const PORT = 9009;

/**
 * Constructs a URL where Storybook should be serving a standalone story.
 * 
 * @param {number} port - the port to connect to
 * @param {string} storyKind - kind of story to request
 * @param {string} storyName - name of story to request
 * @return {string} the URL where Storybook should be serving the story
 */
function buildStorybookUrl(port, storyKind, storyName) {
    let params = $.param({
        selectedKind: storyKind,
        selectedStory: storyName
    });
    return `http://localhost:${port}/iframe.html?${params}`;
}

/**
 * Gets an instance of the Nightmare automated web browser connected to Storybook.
 * 
 * @param {string} storyKind - kind of story to request
 * @param {string} storyName - name of story to request
 * @return {Nightmare} an instance of the Nightmare automated web browser
 */
export function getBrowserConnectedToStorybook(storyKind, storyName) {
    let nightmare = Nightmare({ switches: { 'force-device-scale-factor': '1' } });
    return nightmare.goto(buildStorybookUrl(PORT, storyKind, storyName));
}

/**
 * Checks if Storybook is running.  Returns a promise that resolves if Storybook is running, and rejects if not.
 * 
 * @return {Promise<void>} a promise that resolves if Storybook is running, and rejects if not.
 */
export function checkStorybookRunning() {
    return tcpPortUsed.check(PORT, "localhost").then((inUse) => {
        if (!inUse) {
            throw new Error("It appears Storybook is not running.  `npm run storybook` to start it.");
        }
    });
}
