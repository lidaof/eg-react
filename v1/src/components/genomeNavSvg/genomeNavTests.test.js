import { chromosomeTest, model, rulerTest, selectBoxTest, STORY_KIND } from '../../stories/genomeNavStories';
import $ from 'jquery';
import Nightmare from 'nightmare';
import tcpPortUsed from 'tcp-port-used';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({ toMatchImageSnapshot });

/////////////
// Helpers //
/////////////
function buildStorybookUrl(port, storyKind, storyName) {
    let params = $.param({
        selectedKind: storyKind,
        selectedStory: storyName
    });
    return `http://localhost:${port}/iframe.html?${params}`;
}

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

beforeAll(() => {
    return tcpPortUsed.check(PORT, "localhost").then((inUse) => {
        if (!inUse) {
            throw new Error("It appears Storybook is not running.  `npm run storybook` to start it.");
        }
    });
});

describe("Chromosomes", () => {
    const URL = buildStorybookUrl(PORT, STORY_KIND, chromosomeTest.storyName);
    it('renders correctly', () => simpleScreenshotTest(URL), TIMEOUT);
});

////////////////////

describe("Ruler", () => {
    const URL = buildStorybookUrl(PORT, STORY_KIND, rulerTest.storyName);
    it('renders correctly', () => simpleScreenshotTest(URL), TIMEOUT);
});

////////////////////

describe("Selection box", () => {
    it('renders and behaves correctly', () => {
        let url = buildStorybookUrl(PORT, STORY_KIND, selectBoxTest.storyName);
        let nightmare = Nightmare({ switches: { 'force-device-scale-factor': '1' } });
        return nightmare.goto(url)
            .evaluate(() => {
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
            .then(() => {
                return nightmare
                    .evaluate(() => {
                        let mouseup = new MouseEvent('mouseup');
                        let svg = document.querySelector('svg');
                        svg.dispatchEvent(mouseup);
                        return window.newRegion;
                    })
            })
            .then((newRegion) => {
                expect(newRegion).toBeDefined();
                expect(newRegion.start).toBeCloseTo(1, -2); // -2 means "within 50."
                expect(newRegion.end).toBeCloseTo(model.getGenomeLength(), -2);
                nightmare.end().then(() => {});
            });
    }, TIMEOUT);
});
