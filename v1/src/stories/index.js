import React from 'react';
import { storiesOf } from '@storybook/react';

storiesOf('Welcome', module).add('to Storybook', () => {
    return (
    <div>
        <h1>Welcome to Storybook</h1>
        <h2>Some unit tests use these stories</h2>
        <p>
            Especially for those components that render SVGs, the unit tests specify browsing to the server hosting this 
            Storybook, taking a screenshot, and then comparing it to the stored snapshot.
        </p>

        <h2>Adding new story files</h2>
        <p>
            Simply make a new .js file anywhere (though probably the <code>stories</code> folder makes the most sense),
            and <code> require()</code> it in <code>./.storybook/config.js</code>.
        </p>

        <h2>Testing a story</h2>
        <p>
            Following the paradigm of Don't Repeat Yourself, export whatever consts that your story uses (like the
            story's name), and import it in your unit tests, so you only have to modify one place.
        </p>
        <p>
            Nonetheless, you still may have to modify both story and test -- the stories contain everything the
            components display, and the tests control how the headless browser behaves.
        </p>
        <p>
            It would have been nice for the unit test files to specify both story and test. However, the unit tests
            import <code>nightmare</code> and <code>toMatchImageSnapshot</code>, which Webpack dislikes for some reason
            while building Storybook.
        </p>
    </div>
    );
});
