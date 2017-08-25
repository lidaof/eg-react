import $ from 'jquery';
import { ChromosomeTest, RulerTest, STORY_KIND } from '../../stories/genomeNavStories';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
const Nightmare = require('nightmare');

/////////////
// Helpers //
/////////////
expect.extend({ toMatchImageSnapshot });

function buildStorybookUrl(port, storyKind, storyName) {
    let params = $.param({
        selectedKind: storyKind,
        selectedStory: storyName
    });
    return `http://localhost:${port}/iframe.html?${params}`;
}

function doScreenshotTest(url) {
    let nightmare = Nightmare();
    return nightmare.goto(url)
        .screenshot()
        .end()
        .catch((error) => {
            if (error.code === -102) {
                throw new Error("Connection failed.  Is Storybook running (`npm run storybook`)?");
            }
            throw error;
        })
        .then((screenshot) => {
            expect(screenshot).toMatchImageSnapshot();
        });
}

///////////
// Tests //
///////////

const PORT = 9009;

test('Chromosomes renders correctly', () => {
    let url = buildStorybookUrl(PORT, STORY_KIND, ChromosomeTest.storyName);
    return doScreenshotTest(url);
});

test('Ruler renders properly', () => {
    let url = buildStorybookUrl(PORT, STORY_KIND, RulerTest.storyName);
    return doScreenshotTest(url);
});
