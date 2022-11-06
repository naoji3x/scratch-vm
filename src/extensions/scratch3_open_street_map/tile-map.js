class TileMap {
    constructor () {
        this.tileSize = 256;
        this.xCount = 0;
        this.yCount = 0;
        this.tiles = [];
    }

    // 経度→x変換
    longitude2x (lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }

    // 緯度→y変換
    latitude2y (lat, zoom) {
        const n = lat * Math.PI / 180;
        return (Math.floor((1 - (Math.log(Math.tan(n) + (1 / Math.cos(n))) / Math.PI)) / 2 * Math.pow(2, zoom)));
    }

    // x→経度変換
    x2longitude (x, zoom) {
        return (x / Math.pow(2, zoom) * 360) - 180;
    }

    // y→緯度変換
    y2latitude (y, zoom) {
        const n = Math.PI - (2 * Math.PI * y / Math.pow(2, zoom));
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    // x, yをcountからはみ出ている場合に補正
    adjust (index, count) {
        // 計算例
        // count = 1の時は常に0
        // count = 2, index = -1 の時は1を返す
        // count = 2, index = -2 の時は0を返す
        // count = 2, index = 2 の時は0を返す
        // count = 2, index = 3 の時は1を返す
        if (count === 1) {
            return 0;
        } else if (index >= 0 && index < count) {
            return index;
        }
        const remainder = index % count;

        return (index < 0) ? count + remainder : remainder;
    }

    // screenWidth, screenHeightを埋めるタイルを計算しtilesに格納する。
    buildTiles (zoom, centerLongitude, centerLatitude, screenWidth, screenHeight) {
        zoom = Math.round(zoom);
        if (zoom < 0) zoom = 0;
        if (zoom > 18) zoom = 18;

        // 画面の1/2に敷き詰めるタイル数を計算
        const wHalfCount = Math.ceil(screenWidth / (2 * this.tileSize));
        const hHalfCount = Math.ceil(screenHeight / (2 * this.tileSize));

        // 真ん中のタイルのx, yを求める
        const xc = this.longitude2x(centerLongitude, zoom);
        const yc = this.latitude2y(centerLatitude, zoom);

        // 画面に表示するタイルの範囲を取得
        const yMin = yc - hHalfCount;
        const yMax = yc + hHalfCount;
        const xMin = xc - wHalfCount;
        const xMax = xc + wHalfCount;

        // タイル行列の列数、行数を計算
        this.xCount = xMax - xMin + 1;
        this.yCount = yMax - yMin + 1;
        this.tiles = [];

        // 真ん中のタイルの左上のWold座標を求める
        const lng0 = this.x2longitude(xc, zoom);
        const lat0 = this.y2latitude(yc, zoom);

        // 真ん中のタイルの右下のWorld座標を求める
        const lng1 = this.x2longitude(xc + 1, zoom);
        const lat1 = this.y2latitude(yc + 1, zoom);

        // センタータイルの表示位置の左上からのオフセット（画面座標系）を計算
        const xOffset = this.tileSize * (centerLongitude - lng0) / (lng1 - lng0);
        const yOffset = this.tileSize * (centerLatitude - lat0) / (lat1 - lat0);

        const count = 2 ** zoom;
        // 画面に表示するタイルを列挙
        let n = 0;
        for (let y = yMin; y <= yMax; ++y) {
            let m = 0;
            for (let x = xMin; x <= xMax; ++x) {
                // 画面上のx座標を計算
                const screenX = -(this.xCount * this.tileSize / 2) +
                (m * this.tileSize) + (this.tileSize / 2) - xOffset + (screenWidth / 2);
                // 画面上のy座標を計算
                const screenY = -(this.yCount * this.tileSize / 2) +
                (n * this.tileSize) + (this.tileSize / 2) - yOffset + (screenHeight / 2);
                this.tiles.push({zoom, x: this.adjust(x, count), y: this.adjust(y, count), screenX, screenY});
                ++m;
            }
            ++n;
        }
    }
}

module.exports = TileMap;
