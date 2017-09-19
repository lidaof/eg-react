import { checkStorybookRunning, getBrowserConnectedToStorybook } from '../storybookTestUtils';
import { STORY_KIND, annotationStory } from '../../stories/geneAnnotationStories';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

describe('Gene annotations', () => {
    beforeAll(checkStorybookRunning);

    it('look right', () => {
        let nightmare = getBrowserConnectedToStorybook(STORY_KIND, annotationStory.storyName);
        return nightmare
            .screenshot()
            .then(screenshot => expect(screenshot).toMatchImageSnapshot())
            .then(() => nightmare.end());
    }, 10000);
});
