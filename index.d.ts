export const console: any;
/**
 * Creates an image.
 * @private
 * @param      {string}  source  The source
 * @return     {Image}   A configured (but not yet loaded) image.
 */
export function createImage(source: string): Image;
export const locale: string;
export const metadata: {
    readonly name: string;
    readonly description: string;
    readonly copyright: any;
    readonly license: string;
    readonly bugs: string;
    readonly bin: string;
    version: (style?: number) => string;
};
/**
 * Organise a block of delimited text into a panel
 * @private
 * @param  {string} buffer_ Input plain text.
 * @param  {string} delimiter_ Field delimiter.
 * @param  {number} width_ Panel width.
 * @return {object} The columnify configuration.
 */
declare function panel(buffer_: string, delimiter_: string, width_: number): object;
export const renderMode: import("@thebespokepixel/n-selector").NSelector;
/**
 * Create a text wrapping instance.
 *
 * @param  {object}          options            options object
 * @param  {number}          options.left       Left margin.
 * @param  {number}          options.right      Right margin.
 * @param  {number}          options.width      Manually set view width.
 * @param  {mode}            options.mode       [soft | hyphen | hard | keep | container]
 * @param  {number}          options.tabWidth   Desired width of TAB character.
 * @param  {Stream.writable} options.outStream  Where to direct output.
 * @param  {Regexp}          options.tokenRegex Override the tokenisers regexp.
 * @return {api} A truwrap api instance.
 */
export function truwrap({ left, right, width, mode, tabWidth, outStream, tokenRegex }: {
    left: number;
    right: number;
    width: number;
    mode: any;
    tabWidth: number;
    outStream: any;
    tokenRegex: any;
}): {
    /**
     * End a block, setting blocking mode and flushing buffers if needed.
     * @function
     * @return {undefined} has side effect of writing to stream
     */
    end(): undefined;
    /**
     * Fetch the width in characters of the wrapping view.
     * @function
     * @return {number} wrapping width
     */
    getWidth: typeof unimplemented;
    /**
     * Create a multicolumn panel within this view
     * @function
     * @param {panelObject} content - Object for columnify
     * @param {object} configuration - Configuration for columnify
     * @return {string} - The rendered panel.
     */
    panel(content: any, configuration: object): string;
    /**
     * Generate linebreaks within this view
     * @function
     * @param {number} newlines - number of new lines to add.
     * @return {api} has side effect of writing to stream.
     */
    break(newlines?: number): any;
    /**
     * Similar to css' clear. Write a clearing newline to the stream.
     * @function
     * @return {api} has side effect of writing to stream.
     */
    clear(): any;
    /**
     * Write text via the wrapping logic
     * @function
     * @param {string} text - The raw, unwrapped test to wrap.
     * @return {api} has side effect of writing to stream.
     */
    write(text: string): any;
};
/**
 * Provides an image formatted for inclusion in the TTY
 * @private
 */
declare class Image {
    /**
     * Create a new image reference
     * @param  {string} $0.file   - The filename of the image.
     * @param  {string} $0.name   - The name of the image
     *                              [will be taken from image if missing]
     * @param  {string} $0.width  - Can be X(chars), Xpx(pixels),
     *                              X%(% width of window) or 'auto'
     * @param  {string} $0.height - Can be Y(chars), Ypx(pixels),
     *                              Y%(% width of window) or 'auto'
     */
    constructor({ file, name, width, height, }: string);
    config: string;
    filePath: any;
    /**
     * Load and render the image into the CLI
     * @param  {object} options    - The options to set
     * @property {number} align    - The line count needed to realign the cursor.
     * @property {boolean} stretch - Do we stretch the image to match the width
     *                               and height.
     * @property {boolean} nobreak - Do we clear the image with a newline?
     * @return {string} The string to insert into the output buffer, with base64
     *                  encoded image.
     */
    render(options: object): string;
}
/**
 * Throw a error if a method remains unimplemented
 * @private
 * @return {undefined}
 */
declare function unimplemented(): undefined;
export { panel as parsePanel };
