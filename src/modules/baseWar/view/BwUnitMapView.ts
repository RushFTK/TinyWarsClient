
namespace TinyWars.BaseWar {
    import Notify               = Utility.Notify;
    import Types                = Utility.Types;
    import UnitCategory         = Types.UnitCategory;
    import ActionPlannerState   = Types.ActionPlannerState;

    const { width: _GRID_WIDTH, height: _GRID_HEIGHT } = ConfigManager.getGridSize();

    export abstract class BwUnitMapView extends egret.DisplayObjectContainer {
        private _layerForNaval  = new egret.DisplayObjectContainer();
        private _layerForGround = new egret.DisplayObjectContainer();
        private _layerForAir    = new egret.DisplayObjectContainer();

        private _unitMap        : BwUnitMap;
        private _actionPlanner  : BwActionPlanner;

        private _notifyListeners = [
            { type: Notify.Type.UnitAnimationTick,              callback: this._onNotifyUnitAnimationTick },
            { type: Notify.Type.BwActionPlannerStateChanged,    callback: this._onNotifyBwActionPlannerStateChanged },
        ];

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Initializers.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        public constructor() {
            super();

            this.addChild(this._layerForNaval);
            this.addChild(this._layerForGround);
            this.addChild(this._layerForAir);
        }

        public init(unitMap: BwUnitMap): void {
            this._unitMap = unitMap;

            this._layerForAir.removeChildren();
            this._layerForGround.removeChildren();
            this._layerForNaval.removeChildren();

            unitMap.forEachUnit(unit => this.addUnit(unit.getView(), false));
            this._resetZOrderForAllLayers();
        }

        public startRunningView(): void {
            this._actionPlanner = this._unitMap.getWar().getField().getActionPlanner();
            Notify.addEventListeners(this._notifyListeners, this);
        }
        public stopRunningView(): void {
            Notify.removeEventListeners(this._notifyListeners, this);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Other public functions.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        public addUnit(view: BwUnitView, needResetZOrder: boolean): void {
            const model = view.getUnit();

            view.x = _GRID_WIDTH * model.getGridX();
            view.y = _GRID_HEIGHT * model.getGridY();
            (model.getLoaderUnitId() != null) && (view.visible = false);

            const layer = this._getLayerByUnitType(model.getType());
            layer.addChild(view);
            (needResetZOrder) && (this._resetZOrderForLayer(layer));
        }

        public removeUnit(view: BwUnitView): void {
            view.parent.removeChild(view);
        }

        public resetZOrder(unitType: Types.UnitType): void {
            this._resetZOrderForLayer(this._getLayerByUnitType(unitType));
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Callbacks.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        private _onNotifyUnitAnimationTick(e: egret.Event): void {
            this._updateAnimationsOnTick(this._layerForAir);
            this._updateAnimationsOnTick(this._layerForGround);
            this._updateAnimationsOnTick(this._layerForNaval);
        }

        private _onNotifyBwActionPlannerStateChanged(e: egret.Event): void {
            const actionPlanner = this._actionPlanner;
            const state         = actionPlanner.getState();

            if (state === ActionPlannerState.Idle) {
                this._setAllUnitsOnMapVisible(true);

            } else if (state === ActionPlannerState.ExecutingAction) {
                this._setAllUnitsOnMapVisible(true);

            } else if (state === ActionPlannerState.MakingMovePath) {
                this._setAllUnitsOnMapVisible(true);
                actionPlanner.getFocusUnitOnMap().setViewVisible(false);
                const focusUnitLoaded = actionPlanner.getFocusUnitLoaded();
                (focusUnitLoaded) && (focusUnitLoaded.setViewVisible(false));

            } else if (state === ActionPlannerState.ChoosingAction) {
                this._setAllUnitsOnMapVisible(true);
                actionPlanner.getFocusUnitOnMap().setViewVisible(false);
                const focusUnitLoaded = actionPlanner.getFocusUnitLoaded();
                (focusUnitLoaded) && (focusUnitLoaded.setViewVisible(false));

            } else if (state === ActionPlannerState.ChoosingAttackTarget) {
                this._setAllUnitsOnMapVisible(true);
                actionPlanner.getFocusUnitOnMap().setViewVisible(false);
                const focusUnitLoaded = actionPlanner.getFocusUnitLoaded();
                (focusUnitLoaded) && (focusUnitLoaded.setViewVisible(false));

            } else if (state === ActionPlannerState.ChoosingDropDestination) {
                this._setAllUnitsOnMapVisible(true);
                actionPlanner.getFocusUnitOnMap().setViewVisible(false);
                const focusUnitLoaded = actionPlanner.getFocusUnitLoaded();
                (focusUnitLoaded) && (focusUnitLoaded.setViewVisible(false));

            } else if (state === ActionPlannerState.ChoosingFlareDestination) {
                this._setAllUnitsOnMapVisible(true);
                actionPlanner.getFocusUnitOnMap().setViewVisible(false);
                const focusUnitLoaded = actionPlanner.getFocusUnitLoaded();
                (focusUnitLoaded) && (focusUnitLoaded.setViewVisible(false));

            } else if (state === ActionPlannerState.ChoosingSiloDestination) {
                this._setAllUnitsOnMapVisible(true);
                actionPlanner.getFocusUnitOnMap().setViewVisible(false);
                const focusUnitLoaded = actionPlanner.getFocusUnitLoaded();
                (focusUnitLoaded) && (focusUnitLoaded.setViewVisible(false));

            } else if (state === ActionPlannerState.ChoosingProductionTarget) {
                this._setAllUnitsOnMapVisible(true);

            } else if (state === ActionPlannerState.PreviewingAttackableArea) {
                this._setAllUnitsOnMapVisible(true);
                for (const [, unit] of actionPlanner.getUnitsForPreviewingAttackableArea()) {
                    unit.setViewVisible(false);
                }

            } else if (state === ActionPlannerState.PreviewingMovableArea) {
                this._setAllUnitsOnMapVisible(true);
                actionPlanner.getUnitForPreviewingMovableArea().setViewVisible(false);

            } else {
                // Nothing to do.
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Other private functions.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        private _resetZOrderForLayer(layer: egret.DisplayObjectContainer): void {
            const viewsCount    = layer.numChildren;
            const views         = new Array<BwUnitView>(viewsCount);
            for (let i = 0; i < viewsCount; ++i) {
                views[i] = layer.getChildAt(i) as any;
            }
            views.sort((v1, v2) => v1.getUnit().getGridY() - v2.getUnit().getGridY());
            for (let i = 0; i < viewsCount; ++i) {
                layer.setChildIndex(views[i], i);
            }
        }
        private _resetZOrderForAllLayers(): void {
            this._resetZOrderForLayer(this._layerForAir);
            this._resetZOrderForLayer(this._layerForGround);
            this._resetZOrderForLayer(this._layerForNaval);
        }

        private _updateAnimationsOnTick(layer: egret.DisplayObjectContainer): void {
            const viewsCount = layer.numChildren;
            for (let i = 0; i < viewsCount; ++i) {
                const view = layer.getChildAt(i) as BwUnitView;
                view.tickStateAnimationFrame();
                view.tickUnitAnimationFrame();
            }
        }

        private _getLayerByUnitType(unitType: Types.UnitType): egret.DisplayObjectContainer | undefined {
            const version = this._unitMap.getConfigVersion();
            if (ConfigManager.checkIsUnitTypeInCategory(version, unitType, UnitCategory.Air)) {
                return this._layerForAir;
            } else if (ConfigManager.checkIsUnitTypeInCategory(version, unitType, UnitCategory.Ground)) {
                return this._layerForGround;
            } else if (ConfigManager.checkIsUnitTypeInCategory(version, unitType, UnitCategory.Naval)) {
                return this._layerForNaval;
            } else {
                return undefined;
            }
        }

        private _setAllUnitsOnMapVisible(visible: boolean): void {
            this._unitMap.forEachUnitOnMap(unit => unit.setViewVisible(visible));
        }
    }
}
