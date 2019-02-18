import React from 'react';

import './HotKeyInfo.css';

export class HotKeyInfo extends React.Component {
    render(){
        return (
            <div>
                <ul>
                    <li><kbd>Alt</kbd> + <kbd>H</kbd> or <kbd>Alt</kbd> + <kbd>D</kbd>: Drag tool</li>
                    <li><kbd>Alt</kbd> + <kbd>S</kbd> or <kbd>Alt</kbd> + <kbd>R</kbd>: Reorder/Swap Tool</li>
                    <li><kbd>Alt</kbd> + <kbd>M</kbd>: Magnify Tool</li>
                    <li><kbd>Alt</kbd> + <kbd>Z</kbd> and <kbd>Alt</kbd> + <kbd>X</kbd>: Pan one full panel left or right.</li>
                    <li><kbd>Alt</kbd> + <kbd>I</kbd> and <kbd>Alt</kbd> + <kbd>O</kbd>: Zoom In and Out 1 fold.</li>
                    <li><kbd>Alt</kbd> + <kbd>G</kbd>: Toogle the re-order many tracks interface.</li>
                </ul>
            </div>
        );
    }
}