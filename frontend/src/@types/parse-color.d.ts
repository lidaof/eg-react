declare module 'parse-color' {
    type NumberTriple = [number, number, number];
    type NumberQuad = [number, number, number, number];

    /**
     * Parse results from `parseColor`.
     */
    export interface Color {
        /**
         * An array of [ red, green, blue ]
         */
        rgb?: NumberTriple;

        /**
         * An array of [ hue, saturation, luminosity ]
         */
        hsl?: NumberTriple;

        /**
         * An array of [ hue, saturation, value ]
         */
        hsv?: NumberTriple;

        /**
         * An array of [ cyan, magenta, yellow, blac(k) ]
         */
        cmyk?: NumberQuad;

        /**
         * Name of the color, if known.  Example: 'blue'
         */
        keyword?: string,

        /**
         * The hex rgb string #rrggbb
         */
        hex?: string,

        /**
         * rgb plus an alpha value from 0 to 1, inclusive
         */
        rgba?: NumberQuad,

        /**
         * hsl plus an alpha value from 0 to 1, inclusive
         */
        hsla?: NumberQuad,

        /**
         * hsv plus an alpha value from 0 to 1, inclusive
         */
        hsva?: NumberQuad,

        /**
         * cmyk plus an alpha value from 0 to 1, inclusive
         */
        cmyka?: NumberQuad,
    }

    /**
     * Parses a CSS color string.  If parsing fails, returns an object with `keyword` set to "x" and the other
     * attributes set to `undefined`.
     * 
     * @example
    parseColor('rgba(153,50,204,60%)')
    {
        rgb: [ 153, 50, 204 ],
        hsl: [ 280, 61, 50 ],
        hsv: [ 280, 75, 80 ],
        cmyk: [ 25, 75, 0, 20 ],
        keyword: 'darkorchid',
        hex: '#9932cc',
        rgba: [ 153, 50, 204, 0.6 ],
        hsla: [ 280, 61, 50, 0.6 ],
        hsva: [ 280, 75, 80, 0.6 ],
        cmyka: [ 25, 75, 0, 20, 0.6 ]
    }
     * @param {string} color - color to parse
     * @return {Color} parsed color info
     */
    export function parseColor(color: string): Color;
    export default parseColor;
}
