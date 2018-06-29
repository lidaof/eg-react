import { checkStorybookRunning, getBrowserConnectedToStorybook } from '../test/storybookTestUtils';
import { STORY_KIND, STORIES } from '../../stories/genomeNavStories';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

/**
 * TODO this test is disabled because using TwoBitSource in Chromosomes causes a Webpack bundling error with Storybook.
 * In any case, MainPane shouldn't require Storybook, since it doesn't visualize anything - its children do.
 */
xdescribe('Main pane', () => {
    beforeAll(checkStorybookRunning);

    it('view 1 looks right and selection box behaves correctly', () => {
        let story = STORIES.mainPaneView1;
        let nightmare = getBrowserConnectedToStorybook(STORY_KIND, story.storyName);
        return nightmare
            .screenshot()
            .then(screenshot => expect(screenshot).toMatchImageSnapshot())
            .then(() => {
                return nightmare
                    .evaluate(() => { // Drag mouse across the SVG; it should select the whole region
                        let svg = document.querySelector('svg');
                        let svgRect = svg.getBoundingClientRect();
                        let mousedown = new MouseEvent('mousedown', {clientX: svgRect.left, clientY: 30, bubbles: true});
                        let mousemove = new MouseEvent('mousemove', {clientX: svgRect.right, clientY: 30, bubbles: true});
                        svg.dispatchEvent(mousedown);
                        svg.dispatchEvent(mousemove);
                    });
            })
            .then(() => { // Screenshot before letting go of the mouse
                return nightmare
                    .screenshot()
                    .then(screenshot => expect(screenshot).toMatchImageSnapshot());
            })
            .then(() => { // Let go of the mouse
                return nightmare
                    .evaluate(() => {
                        let svg = document.querySelector('svg');
                        let mouseup = new MouseEvent('mouseup', {bubbles: true});
                        svg.dispatchEvent(mouseup);
                        return window.newSelectedRegion;
                    });
            })
            .then((newRegion) => { // Assert that the correct region was selected
                expect(newRegion).toBeTruthy();
                expect(newRegion.start).toBeCloseTo(0);
                expect(newRegion.end).toBeCloseTo(story.viewRegion.getContextCoordinates().end, -2); // -2 means "within 50."
                return nightmare.end();
            });
    }, 10000);
    
    it('view 2 looks right, and goto button and mousewheel callbacks behave correctly', () => {
        let story = STORIES.mainPaneView2;
        let nightmare = getBrowserConnectedToStorybook(STORY_KIND, story.storyName);
        return nightmare
            .screenshot()
            .then(screenshot => expect(screenshot).toMatchImageSnapshot())
            .then(() => {
                return nightmare
                    .evaluate(() => {
                        // FIXME This is flaky; for if anybody adds a polygon to the main pane this might fail
                        let polygon = document.querySelector('polygon');
                        let click = new MouseEvent('click', {bubbles: true});
                        polygon.dispatchEvent(click);
    
                        // Dispatch a mousewheel event on the SVG
                        let svg = document.querySelector('svg');
                        let svgRect = svg.getBoundingClientRect();
                        let svgCenter = (svgRect.left + svgRect.right) / 2;
                        let wheel = new WheelEvent('wheel', {clientX: svgCenter, deltaY: 1, bubbles: true});
                        svg.dispatchEvent(wheel);
    
                        return {
                            gotoButtonRegion: window.gotoButtonRegion,
                            zoomArgs: window.zoomArgs,
                        };
                    });
            })
            .then((data) => {
                expect(data.gotoButtonRegion).toBeTruthy();
                expect(data.zoomArgs).toBeTruthy();
    
                const selectedRegionCenter = 1500;
                const viewHalfWidth = 2500;
                expect(data.gotoButtonRegion.start).toBeCloseTo(selectedRegionCenter - viewHalfWidth);
                expect(data.gotoButtonRegion.end).toBeCloseTo(selectedRegionCenter + viewHalfWidth);
                expect(data.zoomArgs.focusPoint).toBeCloseTo(0.5, 1);
    
                return nightmare.end();
            })
    }, 10000);

});
