
namespace TinyWars.MultiCustomWar {
    import Types            = Utility.Types;
    import SerializedBwTile = Types.SerializedBwTile;
    import TileType         = Types.TileType;

    export class McwTile extends BaseWar.BwTile {
        protected _getViewClass(): new () => BaseWar.BwTileView {
            return McwTileView;
        }

        ////////////////////////////////////////////////////////////////////////////////
        // Functions for fog.
        ////////////////////////////////////////////////////////////////////////////////
        public setFogEnabled(): void {
            if (!this.getIsFogEnabled()) {
                this._setIsFogEnabled(true);

                const currentHp = this.getCurrentHp();
                this.init({
                    gridX       : this.getGridX(),
                    gridY       : this.getGridY(),
                    objectViewId: this.getType() === TileType.Headquarters ? this.getObjectViewId() : this.getNeutralObjectViewId(),
                    baseViewId  : this.getBaseViewId(),
                }, this.getConfigVersion());

                this.startRunning(this._getWar());
                this.setCurrentBuildPoint(this.getMaxBuildPoint());
                this.setCurrentCapturePoint(this.getMaxCapturePoint());
                this.setCurrentHp(currentHp);
            }
        }

        public setFogDisabled(data?: SerializedBwTile): void {
            if (this.getIsFogEnabled()) {
                this._setIsFogEnabled(false);

                const war           = this._getWar();
                const configVersion = this.getConfigVersion();
                if (data) {
                    this.init(data, configVersion);
                } else {
                    const tileMap   = war.getTileMap();
                    const mapData   = tileMap._getMapRawData();
                    const gridX     = this.getGridX();
                    const gridY     = this.getGridY();
                    const index     = gridX + gridY * tileMap.getMapSize().width;
                    this.init({
                        objectViewId: mapData.tileObjects[index],
                        baseViewId  : mapData.tileBases[index],
                        gridX,
                        gridY,
                        currentHp           : this.getCurrentHp(),
                        currentBuildPoint   : this.getCurrentBuildPoint(),
                        currentCapturePoint : this.getCurrentCapturePoint(),
                    }, configVersion);
                }

                this.startRunning(war);
            }
        }
    }
}
