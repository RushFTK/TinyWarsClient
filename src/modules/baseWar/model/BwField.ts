
namespace TinyWars.BaseWar {
    import Types                = Utility.Types;
    import SerializedBwField    = Types.SerializedBwField;

    export abstract class BwField {
        private _unitMap            : BwUnitMap;
        private _tileMap            : BwTileMap;
        private _fogMap             : BwFogMap;
        private _cursor             : BwCursor;
        private _actionPlanner      : BwActionPlanner;
        private _gridVisionEffect   : BwGridVisionEffect;
        private _view               : BwFieldView;

        public async init(data: SerializedBwField, configVersion: string, mapFileName: string): Promise<BwField> {
            this._setFogMap(await (this.getFogMap() || new (this._getFogMapClass())).init(data.fogMap, mapFileName));
            this._setTileMap(await (this.getTileMap() || new (this._getTileMapClass())).init(configVersion, mapFileName, data.tileMap));
            this._setUnitMap(await (this.getUnitMap() || new (this._getUnitMapClass())).init(configVersion, mapFileName, data.unitMap));
            this._setCursor(await (this.getCursor() || new (this._getCursorClass())).init(mapFileName));
            this._setActionPlanner(await (this.getActionPlanner() || new (this._getActionPlannerClass())).init(mapFileName));
            this._setGridVisionEffect(await (this.getGridVisionEffect() || new (this._getGridVisionEffectClass())).init());

            this._view = this._view || new (this._getViewClass())();
            this._view.init(this);

            return this;
        }
        protected abstract _getFogMapClass(): new () => BwFogMap;
        protected abstract _getTileMapClass(): new () => BwTileMap;
        protected abstract _getUnitMapClass(): new () => BwUnitMap;
        protected abstract _getCursorClass(): new () => BwCursor;
        protected abstract _getActionPlannerClass(): new () => BwActionPlanner;
        protected abstract _getGridVisionEffectClass(): new () => BwGridVisionEffect;
        protected abstract _getViewClass(): new () => BwFieldView;

        public startRunning(war: BwWar): void {
            this.getTileMap().startRunning(war);
            this.getUnitMap().startRunning(war);
            this.getFogMap().startRunning(war);
            this.getCursor().startRunning(war);
            this.getActionPlanner().startRunning(war);
            this.getGridVisionEffect().startRunning(war);
        }
        public startRunningView(): void {
            this.getView().startRunningView();
            this.getTileMap().startRunningView();
            this.getUnitMap().startRunningView();
            this.getCursor().startRunningView();
            this.getActionPlanner().startRunningView();
            this.getGridVisionEffect().startRunningView();
        }
        public stopRunning(): void {
            this.getView().stopRunningView();
            this.getTileMap().stopRunning();
            this.getUnitMap().stopRunning();
            this.getCursor().stopRunning();
            this.getActionPlanner().stopRunning();
            this.getGridVisionEffect().stopRunning();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // The other functions.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        public getView(): BwFieldView {
            return this._view;
        }

        private _setFogMap(map: BwFogMap): void {
            this._fogMap = map;
        }
        public getFogMap(): BwFogMap {
            return this._fogMap;
        }

        private _setTileMap(map: BwTileMap): void {
            this._tileMap = map;
        }
        public getTileMap(): BwTileMap {
            return this._tileMap;
        }

        private _setUnitMap(map: BwUnitMap): void {
            this._unitMap = map;
        }
        public getUnitMap(): BwUnitMap {
            return this._unitMap;
        }

        private _setCursor(cursor: BwCursor): void {
            this._cursor = cursor;
        }
        public getCursor(): BwCursor {
            return this._cursor;
        }

        private _setActionPlanner(actionPlanner: BwActionPlanner): void {
            this._actionPlanner = actionPlanner;
        }
        public getActionPlanner(): BwActionPlanner {
            return this._actionPlanner;
        }

        private _setGridVisionEffect(gridVisionEffect: BwGridVisionEffect): void {
            this._gridVisionEffect = gridVisionEffect;
        }
        public getGridVisionEffect(): BwGridVisionEffect {
            return this._gridVisionEffect;
        }
    }
}
