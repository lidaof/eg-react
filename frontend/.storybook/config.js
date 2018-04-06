import { configure } from '@storybook/react';

function loadStories() {
  require('../src/stories');
  //require('../src/stories/genomeNavStories.js');
  require('../src/stories/geneAnnotationStories.js');
}

configure(loadStories, module);
