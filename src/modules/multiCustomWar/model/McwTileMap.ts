
namespace TinyWars.MultiCustomWar {
    import Types                = Utility.Types;
    import WarMapModel          = WarMap.WarMapModel;
    import Helpers              = Utility.Helpers;
    import SerializedMcTileMap  = Types.SerializedMcwTileMap;
    import SerializedMcTile     = Types.SerializedMcwTile;
    import MapSize              = Types.MapSize;

    export class McwTileMap {
        private _templateMap: Types.TemplateMap;
        private _mapIndexKey: Types.MapIndexKey;
        private _map        : McwTile[][];
        private _mapSize    : MapSize;
        private _war        : McwWar;

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Initializers and serializers.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        public constructor() {
        }

        public async init(configVersion: number, mapIndexKey: Types.MapIndexKey, data?: SerializedMcTileMap): Promise<McwTileMap> {
            return data
                ? this._initWithSerializedData(configVersion, mapIndexKey, data)
                : this._initWithoutSerializedData(configVersion, mapIndexKey);
        }
        private async _initWithSerializedData(configVersion: number, mapIndexKey: Types.MapIndexKey, data: SerializedMcTileMap): Promise<McwTileMap> {
            const mapData                   = await WarMapModel.getMapData(mapIndexKey);
            const { mapWidth, mapHeight }   = mapData;
            const map                       = Helpers.createEmptyMap<McwTile>(mapWidth);

            for (const tileData of data.tiles || []) {
                map[tileData.gridX!][tileData.gridY!] = new McwTile().init(tileData, configVersion);
            }

            for (let x = 0; x < mapWidth; ++x) {
                for (let y = 0; y < mapHeight; ++y) {
                    if (!map[x][y]) {
                        const index = x + y * mapWidth;
                        map[x][y] = new McwTile().init({
                            baseViewId  : mapData.tileBases[index],
                            objectViewId: mapData.tileObjects[index],
                            gridX       : x,
                            gridY       : y,
                        }, configVersion);
                    }
                }
            }

            this._templateMap   = mapData;
            this._mapIndexKey   = mapIndexKey;
            this._map           = map;
            this._setMapSize(mapWidth, mapHeight);

            return this;
        }
        private async _initWithoutSerializedData(configVersion: number, mapIndexKey: Types.MapIndexKey): Promise<McwTileMap> {
            const mapData                   = await WarMapModel.getMapData(mapIndexKey);
            const { mapWidth, mapHeight }   = mapData;
            const map                       = Helpers.createEmptyMap<McwTile>(mapWidth);

            for (let x = 0; x < mapWidth; ++x) {
                for (let y = 0; y < mapHeight; ++y) {
                    const index = x + y * mapWidth;
                    map[x][y] = new McwTile().init({
                        baseViewId  : mapData.tileBases[index],
                        objectViewId: mapData.tileObjects[index],
                        gridX       : x,
                        gridY       : y,
                    }, configVersion);
                }
            }

            this._templateMap   = mapData;
            this._mapIndexKey   = mapIndexKey;
            this._map           = map;
            this._setMapSize(mapWidth, mapHeight);

            return this;
        }

        public startRunning(war: McwWar): void {
            this._war = war;
            this.forEachTile(tile => tile.startRunning(war));
        }

        public serialize(): SerializedMcTileMap | undefined {
            const mapData           = this._templateMap;
            const { width, height } = this.getMapSize();
            const map               = this._map;
            const tilesData: SerializedMcTile[] = [];
            for (let x = 0; x < width; ++x) {
                for (let y = 0; y < height; ++y) {
                    const tileData = map[x][y].serialize();
                    (checkShouldSerializeTile(tileData, mapData, x + y * width)) && (tilesData.push(tileData));
                }
            }
            return tilesData.length ? { tiles: tilesData } : undefined;
        }
        public serializeForPlayer(playerIndex: number): SerializedMcTileMap | undefined {
            const mapData           = this._templateMap;
            const { width, height } = this.getMapSize();
            const map               = this._map;
            const tilesData: SerializedMcTile[] = [];
            for (let x = 0; x < width; ++x) {
                for (let y = 0; y < height; ++y) {
                    const tileData = map[x][y].serializeForPlayer(playerIndex);
                    (checkShouldSerializeTile(tileData, mapData, x + y * width)) && (tilesData.push(tileData));
                }
            }
            return tilesData.length ? { tiles: tilesData } : undefined;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Other public functions.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        public forEachTile(func: (mcTile: McwTile) => any): void {
            for (const column of this._map) {
                for (const tile of column) {
                    func(tile);
                }
            }
        }
        public getTile(gridIndex: Types.GridIndex): McwTile {
            return this._map[gridIndex.x][gridIndex.y];
        }

        private _setMapSize(width: number, height: number): void {
            this._mapSize = { width: width, height: height };
        }
        public getMapSize(): MapSize {
            return this._mapSize;
        }
    }

    function checkShouldSerializeTile(tileData: SerializedMcTile, mapData: Types.TemplateMap, posIndex: number): boolean {
        return (tileData.currentBuildPoint      != null)
            || (tileData.currentCapturePoint    != null)
            || (tileData.currentHp              != null)
            || (tileData.baseViewId             != mapData.tileBases[posIndex])
            || (tileData.objectViewId           != mapData.tileObjects[posIndex]);
    }
}

