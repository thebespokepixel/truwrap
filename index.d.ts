/**
 * Truwrap - take input from write() and composed a wrapped text block.
 *
 * @class      Truwrap (name)
 */
export class Truwrap {
    /**
     * The base Truwrap instance/api
     *
     * @param      {Object}           options                options object
     * @param      {number}           [options.left=2]       Left margin.
     * @param      {number}           [options.right=2]      Right margin.
     * @param      {number}           options.width          Manually set view width.
     * @param      {string}           [options.mode='soft']  [soft | hyphen | hard | keep | container
     * @param      {number}           [options.tabWidth=4]   Desired width of TAB character.
     * @param      {Stream.writable}  options.outStream      Where to direct output.
     * @param      {Regexp}           options.tokenRegex     Override the tokenisers regexp.
     */
    constructor({ left, right, width, mode, tabWidth, outStream, tokenRegex }: {
        left?: number;
        right?: number;
        width: number;
        mode?: string;
        tabWidth?: number;
        outStream: any;
        tokenRegex: any;
    });
    outStream: any;
    buffer: string;
    mode: string;
    ttyActive: boolean;
    ttyWidth: any;
    viewWidth: number;
    viewHandler: {};
    /**
     * End a block, setting blocking mode and flushing buffers if needed.
     *
     * @return     {string}  The wrapped output, has side effect of writing to stream if defined.
     */
    end(): string;
    /**
     * Fetch the width in characters of the wrapping view.
     *
     * @return     {number}  The width.
     */
    getWidth(): number;
    /**
     * Create a multicolumn panel within this view
     *
     * @param      {panelObject}  content_       Object for columnify
     * @param      {Object}       configuration  Configuration for columnify
     * @return     {Object}       this instance, to allow chaining
     */
    panel(content_: any, configuration: any): any;
    /**
     * Generate linebreaks within this view
     *
     * @param  {number} newlines   number of new lines to add.
     * @return {Object} this instance, to allow chaining
     */
    break(newlines?: number): any;
    /**
     * Similar to css' clear. Write a clearing newline to the stream.
     *
     * @return     {Object}  this instance, to allow chaining
     */
    clear(): any;
    /**
     * Write text via the wrapping logic
     *
     * @param      {string}  content_  The content
     * @return     {Object}  this instance, to allow chaining
     */
    write(content_: string): any;
}
/**
 * Creates an image.
 * @private
 * @param      {string}  source  The source
 * @return     {Image}   A configured (but not yet loaded) image.
 */
export function createImage(source: string): Image;
/**
 * Organise a block of delimited text into a panel
 * @private
 * @param  {string} buffer_ Input plain text.
 * @param  {string} delimiter_ Field delimiter.
 * @param  {number} width_ Panel width.
 * @return {Object} The columnify configuration.
 */
declare function panel(buffer_: string, delimiter_: string, width_: number): any;
/**
 * Create an n-selector for module modes
 *
 * @type       {Function}
 */
export const renderMode: Function;
/**
 * Create a text wrapping instance.
 *
 * @param      {Object}           options                options object
 * @param      {number}           [options.left=2]       Left margin.
 * @param      {number}           [options.right=2]      Right margin.
 * @param      {number}           options.width          Manually set view width.
 * @param      {string}           [options.mode='soft']  [soft | hyphen | hard | keep | container
 * @param      {number}           [options.tabWidth=4]   Desired width of TAB character.
 * @param      {Stream.writable}  options.outStream      Where to direct output.
 * @param      {Regexp}           options.tokenRegex     Override the tokenisers regexp.
 * @return     {Truwrap}  { description_of_the_return_value }
 */
export function truwrap(options: {
    left?: number;
    right?: number;
    width: number;
    mode?: string;
    tabWidth?: number;
    outStream: any;
    tokenRegex: any;
}): Truwrap;
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
     * @param  {Object} options    - The options to set
     * @property {number} align    - The line count needed to realign the cursor.
     * @property {boolean} stretch - Do we stretch the image to match the width
     *                               and height.
     * @property {boolean} nobreak - Do we clear the image with a newline?
     * @return {string} The string to insert into the output buffer, with base64
     *                  encoded image.
     */
    render(options: any): string;
}
export { panel as parsePanel };
