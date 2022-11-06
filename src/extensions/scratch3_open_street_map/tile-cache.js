class TileCache {
    constructor () {
        this.cache = new Map();
    }

    async getImage (zoom, x, y) {
        const key = `${zoom}-${x}-${y}`;
        const cachedImage = this.cache.get(key);
        if (cachedImage) {
            return cachedImage;
        }

        const img = await this.loadImage(zoom, x, y);
        // キャッシュする画像は100まで
        if (this.cache.size >= 100) {
            const deleteKey = this.cache.keys().next().value;
            this.cache.delete(deleteKey);
        }
        this.cache.set(key, img);
        return img;
    }

    loadImage (zoom, x, y) {
        const prefix = 'https://a.tile.openstreetmap.org';
        const suffix = '.png';

        const url = `${prefix}/${zoom}/${x}/${y}${suffix}`;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = e => reject(e);
            img.src = url;
            img.crossOrigin = 'Anonymous';
        });
    }
}

module.exports = TileCache;
