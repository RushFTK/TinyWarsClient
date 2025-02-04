
namespace TinyWars.BaseWar {
    import MapManager               = WarMap.WarMapModel;
    import Types                    = Utility.Types;
    import Helpers                  = Utility.Helpers;
    import GridIndexHelpers         = Utility.GridIndexHelpers;
    import SerializedBwFogMap       = Types.SerializedBwFogMap;
    import ForceFogCode             = Types.ForceFogCode;
    import GridIndex                = Types.GridIndex;
    import MapSize                  = Types.MapSize;
    import Visibility               = Types.Visibility;
    import VisibilityFromPaths      = Types.VisibilityFromPaths;
    import VisibilityFromTiles      = Types.VisibilityFromTiles;
    import VisibilityFromUnits      = Types.VisibilityFromUnits;

    export abstract class BwFogMap {
        private _forceFogCode           : ForceFogCode;
        private _forceExpirePlayerIndex : number | null;
        private _forceExpireTurnIndex   : number | null;
        private _mapSize                : MapSize;
        private _mapsFromPaths          : Map<number, VisibilityFromPaths[][]>;
        private _mapsFromTiles          : Map<number, number[][]>;
        private _mapsFromUnits          : Map<number, number[][]>;
        private _war                    : BwWar;

        public init(data: SerializedBwFogMap, mapFileName: string): BwFogMap {
            const mapInfo           = MapManager.getMapMetaData(mapFileName);
            const mapSize: MapSize  = { width: mapInfo.mapWidth, height: mapInfo.mapHeight };
            this._mapsFromPaths     = createEmptyMaps<VisibilityFromPaths>(mapSize, mapInfo.playersCount);
            this._mapsFromTiles     = createEmptyMaps<number>(mapSize, mapInfo.playersCount);
            this._mapsFromUnits     = createEmptyMaps<number>(mapSize, mapInfo.playersCount);
            this._setMapSize(mapInfo.mapWidth, mapInfo.mapHeight);
            this.setForceFogCode(data.forceFogCode || ForceFogCode.None);
            this.setForceExpirePlayerIndex(data.forceExpirePlayerIndex);
            this.setForceExpireTurnIndex(data.forceExpireTurnIndex);

            for (const d of data.mapsForPath || []) {
                this.resetMapFromPathsForPlayer(d.playerIndex, d.encodedMap);
            }

            return this;
        }

        public startRunning(war: BwWar): void {
            this._war = war;

            for (const [playerIndex, ] of this._mapsFromTiles) {
                this.resetMapFromTilesForPlayer(playerIndex);
                this.resetMapFromUnitsForPlayer(playerIndex);
            }
        }

        protected _getWar(): BwWar {
            return this._war;
        }
        protected _getMapsFromPaths(): Map<number, VisibilityFromPaths[][]> {
            return this._mapsFromPaths;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Other public functions.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        private _setMapSize(width: number, height: number): void {
            this._mapSize = { width: width, height: height };
        }
        public getMapSize(): MapSize {
            return this._mapSize;
        }

        public setForceFogCode(code: ForceFogCode): void {
            this._forceFogCode = code;
        }
        public getForceFogCode(): ForceFogCode {
            return this._forceFogCode;
        }

        public checkHasFogByDefault(): boolean {
            return this._war.getSettingsHasFog();
        }
        public checkHasFogCurrently(): boolean {
            const fogCode = this.getForceFogCode();
            return (fogCode === ForceFogCode.Fog)
                || ((this.checkHasFogByDefault()) && (fogCode !== ForceFogCode.Clear));
        }

        public setForceExpireTurnIndex(index: number | undefined | null): void {
            this._forceExpireTurnIndex = index;
        }
        public getForceExpireTurnIndex(): number | undefined | null {
            return this._forceExpireTurnIndex;
        }

        public setForceExpirePlayerIndex(index: number | undefined | null): void {
            this._forceExpirePlayerIndex = index;
        }
        public getForceExpirePlayerIndex(): number | undefined | null {
            return this._forceExpirePlayerIndex;
        }

        public resetAllMapsForPlayer(playerIndex: number): void {
            this.resetMapFromPathsForPlayer(playerIndex);
            this.resetMapFromTilesForPlayer(playerIndex);
            this.resetMapFromUnitsForPlayer(playerIndex);
        }

        public resetMapFromPathsForPlayer(playerIndex: number, encodedData?: string): void {
            const map = this._mapsFromPaths.get(playerIndex)!;
            if (encodedData == null) {
                fillMap(map, 0);
            } else {
                const { width, height } = this.getMapSize();
                for (let x = 0; x < width; ++x) {
                    for (let y = 0; y < height; ++y) {
                        map[x][y] = Number(encodedData[x + y * width]) as VisibilityFromPaths;
                    }
                }
            }
        }
        public updateMapFromPathsByUnitAndPath(unit: BwUnit, path: GridIndex[]): void {
            const playerIndex   = unit.getPlayerIndex();
            const map           = this._mapsFromPaths.get(playerIndex)!;
            const mapSize       = this.getMapSize();
            for (const pathNode of path) {
                const visionRange = unit.getVisionRangeForPlayer(playerIndex, pathNode);
                if (visionRange) {
                    for (const gridIndex of GridIndexHelpers.getGridsWithinDistance(pathNode, 0, 1, mapSize)) {
                        map[gridIndex.x][gridIndex.y] = 2;
                    }
                    for (const gridIndex of GridIndexHelpers.getGridsWithinDistance(pathNode, 2, visionRange, mapSize)) {
                        map[gridIndex.x][gridIndex.y] = Math.max(1, map[gridIndex.x][gridIndex.y]) as VisibilityFromPaths;
                    }
                }
            }
        }
        public updateMapFromPathsByFlare(playerIndex: number, flareGridIndex: GridIndex, flareRadius: number): void {
            const map = this._mapsFromPaths.get(playerIndex)!;
            for (const gridIndex of GridIndexHelpers.getGridsWithinDistance(flareGridIndex, 0, flareRadius, this.getMapSize())) {
                map[gridIndex.x][gridIndex.y] = 2;
            }
        }

        public resetMapFromTilesForPlayer(playerIndex: number): void {
            const map       = this._mapsFromTiles.get(playerIndex)!;
            const mapSize   = this.getMapSize();
            fillMap(map, 0);
            this._war.getTileMap().forEachTile(tile => {
                updateMap(map, mapSize, tile.getGridIndex(), tile.getVisionRangeForPlayer(playerIndex), 1);
            });
        }
        public updateMapFromTilesForPlayerOnGettingOwnership(playerIndex: number, gridIndex: GridIndex, vision: number | null | undefined): void {
            updateMap(this._mapsFromTiles.get(playerIndex)!, this.getMapSize(), gridIndex, vision, 1);
        }
        public updateMapFromTilesForPlayerOnLosingOwnership(playerIndex: number, gridIndex: GridIndex, vision: number | null | undefined): void {
            updateMap(this._mapsFromTiles.get(playerIndex)!, this.getMapSize(), gridIndex, vision, -1);
        }

        public resetMapFromUnitsForPlayer(playerIndex: number): void {
            const map       = this._mapsFromUnits.get(playerIndex)!;
            const mapSize   = this.getMapSize();
            fillMap(map, 0);
            this._war.getUnitMap().forEachUnitOnMap(unit => {
                const gridIndex = unit.getGridIndex();
                updateMap(map, mapSize, gridIndex, unit.getVisionRangeForPlayer(playerIndex, gridIndex), 1);
            });
        }
        public updateMapFromUnitsForPlayerOnArriving(playerIndex: number, gridIndex: GridIndex, vision: number | null | undefined): void {
            updateMap(this._mapsFromUnits.get(playerIndex)!, this.getMapSize(), gridIndex, vision, 1);
        }
        public updateMapFromUnitsForPlayerOnLeaving(playerIndex: number, gridIndex: GridIndex, vision: number | null | undefined): void {
            updateMap(this._mapsFromUnits.get(playerIndex)!, this.getMapSize(), gridIndex, vision, -1);
        }

        public getVisibilityForPlayer(gridIndex: GridIndex, playerIndex: number): Visibility {
            if (!this.checkHasFogCurrently()) {
                return {
                    fromPaths   : 2,
                    fromTiles   : 1,
                    fromUnits   : 1,
                };
            } else {
                const { x, y } = gridIndex;
                return {
                    fromPaths   : this._mapsFromPaths.get(playerIndex)![x][y],
                    fromTiles   : this._mapsFromTiles.get(playerIndex)![x][y] > 0 ? 1 : 0,
                    fromUnits   : this._mapsFromUnits.get(playerIndex)![x][y] > 0 ? 1 : 0,
                };
            }
        }
        public getVisibilityForTeam(gridIndex: GridIndex, teamIndex: number): Visibility {
            if (!this.checkHasFogCurrently()) {
                return {
                    fromPaths   : 2,
                    fromTiles   : 1,
                    fromUnits   : 1,
                };
            } else {
                let [fromPaths, fromTiles, fromUnits] = [0, 0, 0];
                this._war.getPlayerManager().forEachPlayer(false, (player: BwPlayer) => {
                    if ((player.getIsAlive()) && (player.getTeamIndex() === teamIndex)) {
                        const v = this.getVisibilityForPlayer(gridIndex, player.getPlayerIndex());
                        fromPaths   = Math.max(fromPaths, v.fromPaths);
                        fromTiles   = Math.max(fromTiles, v.fromTiles);
                        fromUnits   = Math.max(fromUnits, v.fromUnits);
                    }
                });
                return {
                    fromPaths   : fromPaths as VisibilityFromPaths,
                    fromTiles   : fromTiles as VisibilityFromTiles,
                    fromUnits   : fromUnits as VisibilityFromUnits,
                };
            }
        }
    }

    function createEmptyMaps<T extends (number | VisibilityFromPaths)>(mapSize: MapSize, playersCount: number): Map<number, T[][]> {
        const map = new Map<number, T[][]>();
        for (let i = 0; i < playersCount + 1; ++i) {
            map.set(i, Helpers.createEmptyMap<T>(mapSize.width, mapSize.height, 0 as T));
        }
        return map;
    }

    function fillMap(map: number[][], data: number): void {
        for (const column of map) {
            column.fill(data);
        }
    }

    function updateMap(map: number[][], mapSize: MapSize, origin: GridIndex, vision: number | null | undefined, modifier: -1 | 1) {
        if (vision) {
            for (const gridIndex of GridIndexHelpers.getGridsWithinDistance(origin, 0, vision, mapSize)) {
                map[gridIndex.x][gridIndex.y] += modifier;
            }
        }
    }
}
