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
            Simply specify stories in a .js file anywhere, and <code> require()</code> it in <code>
            .storybook/config.js</code>.
        </p>

        <h2>Testing a story</h2>
        <p>
            Since Storybook doesn't understand Jest's global functions like <code>describe</code>, the stories and tests
            for the stories are in separate files.  While there exist addons that rectify this 
            (like <a href="https://www.npmjs.com/package/storybook-addon-specifications">storybook-addon-specifications
            </a>), they require ejecting from create-react-app first.  In the meantime, I hope your text editor supports
            screen splitting!  ^_^
        </p>
        <p>
            Following the paradigm of Don't Repeat Yourself, export whatever consts that your story uses (like the
            story's name), and import it in your unit tests, so you only have to modify one place.
        </p>
        <p>
            On macOS, if you get an EMFILE error when you <code>npm test</code>, 
            try <code>brew install watchman</code> first.
        </p>
        <p>
            If you need to update a snapshot, simply press the "u" key inside the test runner app.
        </p>
    </div>
    );
});
