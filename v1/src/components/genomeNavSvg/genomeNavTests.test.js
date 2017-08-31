import { chromosomeTest, model, rulerTest, selectBoxTest, STORY_KIND } from '../../stories/genomeNavStories';
import $ from 'jquery';
import Nightmare from 'nightmare';
import tcpPortUsed from 'tcp-port-used';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({ toMatchImageSnapshot });

/////////////
// Helpers //
/////////////
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
 * Browses to a URL, takes a screenshot, and asserts that the screenshot matches the stored snapshot.  Returns a promise
 * that resolves if the screenshot is close enough, and rejects if the screenshot does not match or some other error
 * occurs.
 * 
 * @param {string} url - the URL to browse to
 * @return {Promise<void>} a promise that resolves when the screenshot test succeeds
 */
function simpleScreenshotTest(url) {
    // Force a constant window.devicePixelRatio so screenshots are consistent
    let nightmare = Nightmare({ switches: { 'force-device-scale-factor': '1' } });
    return nightmare.goto(url)
        .screenshot()
        .end()
        .then((screenshot) => {
            expect(screenshot).toMatchImageSnapshot();
        });
}

///////////
// Tests //
///////////
const PORT = 9009;
const TIMEOUT = 10000; // Time before test fails

// Check Storybook is running
beforeAll(() => {
    return tcpPortUsed.check(PORT, "localhost").then((inUse) => {
        if (!inUse) {
            throw new Error("It appears Storybook is not running.  `npm run storybook` to start it.");
        }
    });
});

///////////

describe("Chromosomes", () => {
    const URL = buildStorybookUrl(PORT, STORY_KIND, chromosomeTest.storyName);
    it('renders correctly', () => simpleScreenshotTest(URL), TIMEOUT);
});

///////////

describe("Ruler", () => {
    const URL = buildStorybookUrl(PORT, STORY_KIND, rulerTest.storyName);
    it('renders correctly', () => simpleScreenshotTest(URL), TIMEOUT);
});

///////////

describe("Selection box", () => {
    it('renders and behaves correctly', () => {
        let url = buildStorybookUrl(PORT, STORY_KIND, selectBoxTest.storyName);
        let nightmare = Nightmare({ switches: { 'force-device-scale-factor': '1' } });
        return nightmare.goto(url)
            .evaluate(() => { // Select a region spanning the entire SVG
                let svg = document.querySelector('svg');
                let svgRect = svg.getBoundingClientRect();
                let mousedown = new MouseEvent('mousedown', {clientX: svgRect.left, clientY: 30});
                let mousemove = new MouseEvent('mousemove', {clientX: svgRect.right, clientY: 30});
                svg.dispatchEvent(mousedown);
                svg.dispatchEvent(mousemove);
            })
            .screenshot()
            .then((screenshot) => {
                expect(screenshot).toMatchImageSnapshot();
            })
            .then(() => { // Let go of the mouse
                return nightmare
                    .evaluate(() => {
                        let mouseup = new MouseEvent('mouseup');
                        let svg = document.querySelector('svg');
                        svg.dispatchEvent(mouseup);
                        return window.newRegion;
                    })
            })
            .then((newRegion) => { // Assert that the correct region was selected
                expect(newRegion).toBeDefined();
                expect(newRegion.start).toBeCloseTo(0, -2); // -2 means "within 50."
                expect(newRegion.end).toBeCloseTo(model.getGenomeLength(), -2);
                nightmare.end().then(() => {});
            });
    }, TIMEOUT);
});
