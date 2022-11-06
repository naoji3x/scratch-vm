const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
// const Variable = require('../../engine/variable');
const StageLayering = require('../../engine/stage-layering');
const TileMap = require('./tile-map');
const TileCache = require('./tile-cache');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDQwIDQwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtNjEwLC05MCkiPgogICAgICAgIDxnIGlkPSJibG9jay1pY29uIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwwLjk1MjM4MSwwLDMuMzMzMzMpIj4KICAgICAgICAgICAgPHJlY3QgeD0iNjEwIiB5PSI5MSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQyIiBzdHlsZT0iZmlsbDpub25lOyIvPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgxLjY4NzUsMCwwLDEuNzcxODcsNjE3LDk3LjI5OTkpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNS44MTcsMC4xMTNDMTUuOTMzLDAuMjA4IDE2LDAuMzUgMTYsMC41TDE2LDE0LjVDMTYsMTQuNzM3IDE1LjgzMSwxNC45NDMgMTUuNTk4LDE0Ljk5TDEwLjU5OCwxNS45OUMxMC41MzMsMTYuMDAzIDEwLjQ2NywxNi4wMDMgMTAuNDAyLDE1Ljk5TDUuNSwxNS4wMUwwLjU5OCwxNS45OUMwLjU2NiwxNS45OTYgMC41MzMsMTYgMC41LDE2QzAuMjI2LDE2IDAsMTUuNzc0IDAsMTUuNUwwLDEuNUMwLDEuMjYzIDAuMTY5LDEuMDU3IDAuNDAyLDEuMDFMNS40MDIsMC4wMUM1LjQ2NywtMC4wMDMgNS41MzMsLTAuMDAzIDUuNTk4LDAuMDFMMTAuNSwwLjk5TDE1LjQwMiwwLjAxQzE1LjU0OSwtMC4wMiAxNS43MDEsMC4wMTggMTUuODE3LDAuMTEzWk0xMCwxLjkxTDYsMS4xMUw2LDE0LjA5TDEwLDE0Ljg5TDEwLDEuOTFaTTExLDE0Ljg5TDE1LDE0LjA5TDE1LDEuMTFMMTEsMS45MUwxMSwxNC44OVpNNSwxNC4wOUw1LDEuMTFMMSwxLjkxTDEsMTQuODlMNSwxNC4wOVoiIHN0eWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K';

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDQwIDQwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtNjEwLC0xNDApIj4KICAgICAgICA8ZyBpZD0ibWVudS1pY29uIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwwLjk1MjM4MSwwLDUzLjMzMzMpIj4KICAgICAgICAgICAgPHJlY3QgeD0iNjEwIiB5PSI5MSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQyIiBzdHlsZT0iZmlsbDpub25lOyIvPgogICAgICAgICAgICA8Y2xpcFBhdGggaWQ9Il9jbGlwMSI+CiAgICAgICAgICAgICAgICA8cmVjdCB4PSI2MTAiIHk9IjkxIiB3aWR0aD0iNDAiIGhlaWdodD0iNDIiLz4KICAgICAgICAgICAgPC9jbGlwUGF0aD4KICAgICAgICAgICAgPGcgY2xpcC1wYXRoPSJ1cmwoI19jbGlwMSkiPgogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMS4wNSwwLC01NikiPgogICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9IjYzMCIgY3k9IjE2MCIgcj0iMjAiIHN0eWxlPSJmaWxsOnJnYigyNTUsMTgxLDApOyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMS40Mzc1LDAsMCwxLjUwOTM3LDYxOC41LDk5LjkyNTEpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTUuODE3LDAuMTEzQzE1LjkzMywwLjIwOCAxNiwwLjM1IDE2LDAuNUwxNiwxNC41QzE2LDE0LjczNyAxNS44MzEsMTQuOTQzIDE1LjU5OCwxNC45OUwxMC41OTgsMTUuOTlDMTAuNTMzLDE2LjAwMyAxMC40NjcsMTYuMDAzIDEwLjQwMiwxNS45OUw1LjUsMTUuMDFMMC41OTgsMTUuOTlDMC41NjYsMTUuOTk2IDAuNTMzLDE2IDAuNSwxNkMwLjIyNiwxNiAwLDE1Ljc3NCAwLDE1LjVMMCwxLjVDMCwxLjI2MyAwLjE2OSwxLjA1NyAwLjQwMiwxLjAxTDUuNDAyLDAuMDFDNS40NjcsLTAuMDAzIDUuNTMzLC0wLjAwMyA1LjU5OCwwLjAxTDEwLjUsMC45OUwxNS40MDIsMC4wMUMxNS41NDksLTAuMDIgMTUuNzAxLDAuMDE4IDE1LjgxNywwLjExM1pNMTAsMS45MUw2LDEuMTFMNiwxNC4wOUwxMCwxNC44OUwxMCwxLjkxWk0xMSwxNC44OUwxNSwxNC4wOUwxNSwxLjExTDExLDEuOTFMMTEsMTQuODlaTTUsMTQuMDlMNSwxLjExTDEsMS45MUwxLDE0Ljg5TDUsMTQuMDlaIiBzdHlsZT0iZmlsbDp3aGl0ZTsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==';

/**
 * Class for the new blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3OpenStreetMapBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.tileMap = new TileMap();
        this.tileCache = new TileCache();

        this.canvas = document.createElement('canvas');
        this.canvas.width = 480;
        this.canvas.height = 360;
    }

    drawImage (url) {
        if (this.runtime.renderer) {
            this.ctx = this.canvas.getContext('2d');

            const img = new Image();
            img.src = url;
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0);
                this.skinId = this.runtime.renderer.createBitmapSkin(this.canvas, 1);
                const drawableId = this.runtime.renderer.createDrawable(
                    StageLayering.BACKGROUND_LAYER
                );
                this.runtime.renderer.updateDrawableProperties(drawableId, {
                    skinId: this.skinId
                });
            };
        }
    }

    async drawImages () {
        if (this.runtime.renderer) {
            this.ctx = this.canvas.getContext('2d');

            const promises = [];
            for (const tile of this.tileMap.tiles) {
                promises.push(this.tileCache.getImage(tile.zoom, tile.x, tile.y));
            }

            const images = [];
            for (const promise of promises) {
                images.push(await promise);
            }

            let index = 0;
            for (const tile of this.tileMap.tiles) {
                // console.log(JSON.stringify(tile));
                this.ctx.drawImage(images[index], tile.screenX, tile.screenY);
                ++index;
            }

            this.skinId = this.runtime.renderer.createBitmapSkin(this.canvas, 1);
            const drawableId = this.runtime.renderer.createDrawable(
                StageLayering.BACKGROUND_LAYER
            );
            this.runtime.renderer.updateDrawableProperties(drawableId, {
                skinId: this.skinId
            });

        }
    }

    drawTileMap (args) {
        const latitude = Cast.toNumber(args.LATITUDE);
        const longitude = Cast.toNumber(args.LONGITUDE);
        const zoom = Cast.toNumber(args.ZOOM);

        this.tileMap.buildTiles(zoom, longitude, latitude, 480, 360);
        this.drawImages();
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'openStreetMap',
            name: '地図',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'drawTileMap',
                    text: '緯度 [LATITUDE], 経度 [LONGITUDE]の地図をズームレベル[ZOOM]で表示する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 18
                        },
                        LATITUDE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 35.689185
                        },
                        LONGITUDE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 139.691648
                        }
                    }
                }
            ],
            menus: {
            }
        };
    }
}

module.exports = Scratch3OpenStreetMapBlocks;
