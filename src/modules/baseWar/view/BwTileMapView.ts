
namespace TinyWars.BaseWar {
    import Notify           = Utility.Notify;
    import Helpers          = Utility.Helpers;
    import GridIndexHelpers = Utility.GridIndexHelpers;

    const { width: GRID_WIDTH, height: GRID_HEIGHT } = ConfigManager.getGridSize();

    export abstract class BwTileMapView extends egret.DisplayObjectContainer {
        private _tileViews          = new Array<BwTileView>();
        private _baseLayer          = new egret.DisplayObjectContainer();
        private _objectLayer        = new egret.DisplayObjectContainer();
        private _coZoneContainer    = new egret.DisplayObjectContainer();
        private _coZoneImages       = new Map<number, GameUi.UiImage[][]>();

        private _tileMap    : BwTileMap;

        private _notifyListeners = [
            { type: Notify.Type.TileAnimationTick, callback: this._onNotifyTileAnimationTick },
        ];

        public constructor() {
            super();

            this.addChild(this._baseLayer);
            this.addChild(this._objectLayer);
            this.addChild(this._coZoneContainer);
        }

        public init(tileMap: BwTileMap): void {
            this._tileMap = tileMap;

            this._tileViews.length = 0;
            this._baseLayer.removeChildren();
            this._objectLayer.removeChildren();

            tileMap.forEachTile(tile => {
                const view  = tile.getView();
                const x     = GRID_WIDTH * tile.getGridX();
                const y     = GRID_HEIGHT * (tile.getGridY() + 1);
                this._tileViews.push(view);

                const imgBase = view.getImgBase();
                imgBase.x   = x;
                imgBase.y   = y;
                this._baseLayer.addChild(imgBase);

                const imgObject = view.getImgObject();
                imgObject.x = x;
                imgObject.y = y;
                this._objectLayer.addChild(imgObject);
            });

            this._initCoZoneContainer();
        }

        private _initCoZoneContainer(): void {
            const container = this._coZoneContainer;
            container.removeChildren();

            const images = this._coZoneImages;
            images.clear();

            const { mapWidth, mapHeight, playersCount } = this._tileMap._getMapRawData();
            for (let i = 1; i <= playersCount; ++i) {
                const layer     = new egret.DisplayObjectContainer();
                const imgSource = `c08_t03_s${Helpers.getNumText(i)}_f01`;
                const matrix: GameUi.UiImage[][] = [];
                for (let x = 0; x < mapWidth; ++x) {
                    matrix[x] = [];
                    for (let y = 0; y < mapHeight; ++y) {
                        const img   = new GameUi.UiImage(imgSource);
                        img.x       = GRID_WIDTH * x;
                        img.y       = GRID_HEIGHT * y;
                        layer.addChild(img);
                        matrix[x].push(img);
                    }
                }

                images.set(i, matrix);
                container.addChild(layer);
            }
        }

        public startRunningView(): void {
            Notify.addEventListeners(this._notifyListeners, this);

            const coZoneContainer = this._coZoneContainer;
            egret.Tween.removeTweens(coZoneContainer);
            coZoneContainer.alpha = 0;
            egret.Tween.get(coZoneContainer, { loop: true })
                .to({ alpha: 0.75 }, 1000)
                .to({ alpha: 0 }, 1000);

            this.updateCoZone();
        }
        public stopRunningView(): void {
            Notify.removeEventListeners(this._notifyListeners, this);

            egret.Tween.removeTweens(this._coZoneContainer);
        }

        public updateCoZone(): void {
            const tileMap                               = this._tileMap;
            const war                                   = tileMap.getWar();
            const { mapWidth, mapHeight, playersCount } = tileMap._getMapRawData();

            for (let playerIndex = 1; playerIndex <= playersCount; ++playerIndex) {
                const matrix        = this._coZoneImages.get(playerIndex);
                const player        = war.getPlayer(playerIndex);
                const gridIndex     = player.getCoGridIndexOnMap();
                const radius        = player.getCoZoneRadius();
                const canShow       = (!!gridIndex) && (!player.checkCoIsUsingActiveSkill()) && (radius != null);

                for (let x = 0; x < mapWidth; ++x) {
                    for (let y = 0; y < mapHeight; ++y) {
                        matrix[x][y].visible = (canShow) && (radius >= GridIndexHelpers.getDistance({ x, y }, gridIndex));
                    }
                }
            }
        }

        private _onNotifyTileAnimationTick(e: egret.Event): void {
            for (const view of this._tileViews) {
                view.updateOnAnimationTick();
            }
        }
    }
}
