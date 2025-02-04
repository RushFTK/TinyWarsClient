
namespace TinyWars.BaseWar.BwHelpers {
    import Types                = Utility.Types;
    import GridIndexHelpers     = Utility.GridIndexHelpers;
    import ProtoTypes           = Utility.ProtoTypes;
    import Logger               = Utility.Logger;
    import GridIndex            = Types.GridIndex;
    import MovableArea          = Types.MovableArea;
    import AttackableArea       = Types.AttackableArea;
    import MapSize              = Types.MapSize;
    import MovePathNode         = Types.MovePathNode;
    import UnitType             = Types.UnitType;

    type AvailableMovableGrid = {
        currGridIndex   : GridIndex;
        prevGridIndex   : GridIndex | undefined;
        totalMoveCost   : number;
    }

    export function createMovableArea(origin: GridIndex, maxMoveCost: number, moveCostGetter: (g: GridIndex) => number | undefined): MovableArea {
        const area              = [] as MovableArea;
        const availableGrids    = [] as AvailableMovableGrid[];
        _pushToAvailableMovableGrids(availableGrids, origin, undefined, 0);

        let index = 0;
        while (index < availableGrids.length) {
            const availableGrid = availableGrids[index];
            const { currGridIndex, totalMoveCost } = availableGrid;
            if (_checkAndUpdateMovableArea(area, currGridIndex, availableGrid.prevGridIndex, totalMoveCost)) {
                for (const nextGridIndex of GridIndexHelpers.getAdjacentGrids(currGridIndex)) {
                    const nextMoveCost = moveCostGetter(nextGridIndex);
                    if ((nextMoveCost != null) && (nextMoveCost + totalMoveCost <= maxMoveCost)) {
                        _pushToAvailableMovableGrids(availableGrids, nextGridIndex, currGridIndex, nextMoveCost + totalMoveCost);
                    }
                }
            }

            ++index;
        }

        return area;
    }

    export function createAttackableArea(movableArea: MovableArea, mapSize: MapSize, minAttackRange: number, maxAttackRange: number, checkCanAttack: (destination: GridIndex, target: GridIndex) => boolean): AttackableArea {
        const area = [] as AttackableArea;
        const { width, height } = mapSize;
        for (let moveX = 0; moveX < width; ++moveX) {
            if (movableArea[moveX]) {
                for (let moveY = 0; moveY < height; ++moveY) {
                    const movableGrid = movableArea[moveX][moveY];
                    if (movableGrid) {
                        const moveGridIndex = { x: moveX, y: moveY };
                        for (const attackGridIndex of GridIndexHelpers.getGridsWithinDistance(moveGridIndex, minAttackRange, maxAttackRange, mapSize)) {
                            const { x: attackX, y: attackY } = attackGridIndex;
                            if (checkCanAttack(moveGridIndex, attackGridIndex)) {
                                area[attackX] = area[attackX] || [];
                                const attackableGrid = area[attackX][attackY];
                                if ((!attackableGrid)                                                                                                               ||
                                    (movableGrid.totalMoveCost < movableArea[attackableGrid.movePathDestination.x][attackableGrid.movePathDestination.y].totalMoveCost)
                                ) {
                                    area[attackX][attackY] = {
                                        movePathDestination: { x: moveX, y: moveY },
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
        return area;
    }

    export function createShortestMovePath(area: MovableArea, destination: GridIndex): MovePathNode[] {
        const reversedPath = [] as MovePathNode[];
        let gridIndex   = destination;
        let movableNode = area[gridIndex.x][gridIndex.y];

        while (true) {
            reversedPath.push({
                x               : gridIndex.x,
                y               : gridIndex.y,
                totalMoveCost   : movableNode.totalMoveCost,
            });

            gridIndex = movableNode.prevGridIndex;
            if (!gridIndex) {
                return reversedPath.reverse();
            }
            movableNode = area[gridIndex.x][gridIndex.y];
        }
    }

    export function getUnitProductionCost(war: BwWar, unitType: UnitType): number | undefined {
        // TODO: take skills into account.
        const cfg = ConfigManager.getUnitTemplateCfg(war.getConfigVersion(), unitType);
        return cfg ? cfg.productionCost : undefined;
    }

    function _pushToAvailableMovableGrids(grids: AvailableMovableGrid[], gridIndex: GridIndex, prev: GridIndex, totalMoveCost: number): void {
        grids.push({
            currGridIndex: gridIndex,
            prevGridIndex: prev ? { x: prev.x, y: prev.y } : undefined,
            totalMoveCost,
        });
    }
    function _checkAndUpdateMovableArea(area: MovableArea, gridIndex: GridIndex, prev: GridIndex, totalMoveCost: number): boolean {
        const { x, y } = gridIndex;
        area[x] = area[x] || [];

        if ((area[x][y]) && (area[x][y].totalMoveCost <= totalMoveCost)) {
            return false;
        } else {
            area[x][y] = {
                prevGridIndex: prev ? { x: prev.x, y: prev.y } : undefined,
                totalMoveCost,
            };
            return true;
        }
    }

    export function checkAreaHasGrid(area: AttackableArea | MovableArea, gridIndex: GridIndex): boolean {
        const { x, y } = gridIndex;
        return (!!area[x]) && (!!area[x][y]);
    }

    export function checkIsStateRequesting(state: Types.ActionPlannerState): boolean {
        return (state === Types.ActionPlannerState.RequestingPlayerActivateSkill)
            || (state === Types.ActionPlannerState.RequestingPlayerBeginTurn)
            || (state === Types.ActionPlannerState.RequestingPlayerDeleteUnit)
            || (state === Types.ActionPlannerState.RequestingPlayerEndTurn)
            || (state === Types.ActionPlannerState.RequestingPlayerSurrender)
            || (state === Types.ActionPlannerState.RequestingPlayerVoteForDraw)
            || (state === Types.ActionPlannerState.RequestingPlayerProduceUnit)
            || (state === Types.ActionPlannerState.RequestingUnitAttack)
            || (state === Types.ActionPlannerState.RequestingUnitBeLoaded)
            || (state === Types.ActionPlannerState.RequestingUnitBuildTile)
            || (state === Types.ActionPlannerState.RequestingUnitCaptureTile)
            || (state === Types.ActionPlannerState.RequestingUnitDive)
            || (state === Types.ActionPlannerState.RequestingUnitDrop)
            || (state === Types.ActionPlannerState.RequestingUnitJoin)
            || (state === Types.ActionPlannerState.RequestingUnitLaunchFlare)
            || (state === Types.ActionPlannerState.RequestingUnitLaunchSilo)
            || (state === Types.ActionPlannerState.RequestingUnitLoadCo)
            || (state === Types.ActionPlannerState.RequestingUnitProduceUnit)
            || (state === Types.ActionPlannerState.RequestingUnitSupply)
            || (state === Types.ActionPlannerState.RequestingUnitSurface)
            || (state === Types.ActionPlannerState.RequestingUnitUseCoPower)
            || (state === Types.ActionPlannerState.RequestingUnitUseCoSuperPower)
            || (state === Types.ActionPlannerState.RequestingUnitWait);
    }

    export function exeInstantSkill(war: BwWar, player: BwPlayer, skillId: number, extraData: ProtoTypes.IWarUseCoSkillExtraData): void {
        const configVersion = war.getConfigVersion();
        const cfg           = ConfigManager.getCoSkillCfg(configVersion, skillId)!;
        const playerIndex   = player.getPlayerIndex();
        const unitMap       = war.getUnitMap();

        if (cfg.selfHpGain) {
            const category      = cfg.selfHpGain[0];
            const modifier      = cfg.selfHpGain[1] * ConfigManager.UNIT_HP_NORMALIZER;
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() === playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    unit.setCurrentHp(Math.max(
                        1,
                        Math.min(
                            unit.getMaxHp(),
                            unit.getCurrentHp() + modifier
                        ),
                    ));
                }
            });
        }

        if (cfg.enemyHpGain) {
            const category      = cfg.enemyHpGain[0];
            const modifier      = cfg.enemyHpGain[1] * ConfigManager.UNIT_HP_NORMALIZER;
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() !== playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    unit.setCurrentHp(Math.max(
                        1,
                        Math.min(
                            unit.getMaxHp(),
                            unit.getCurrentHp() + modifier
                        ),
                    ));
                }
            });
        }

        if (cfg.selfFuelGain) {
            const category      = cfg.selfFuelGain[0];
            const modifier      = cfg.selfFuelGain[1];
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() === playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    const maxFuel = unit.getMaxFuel();
                    if (maxFuel != null) {
                        if (modifier > 0) {
                            unit.setCurrentFuel(Math.min(
                                maxFuel,
                                unit.getCurrentFuel() + Math.floor(maxFuel * modifier / 100)
                            ));
                        } else {
                            unit.setCurrentFuel(Math.max(
                                0,
                                Math.floor(unit.getCurrentFuel() * (100 + modifier) / 100)
                            ));
                        }
                    }
                }
            });
        }

        if (cfg.enemyFuelGain) {
            const category      = cfg.enemyFuelGain[0];
            const modifier      = cfg.enemyFuelGain[1];
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() !== playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    const maxFuel = unit.getMaxFuel();
                    if (maxFuel != null) {
                        if (modifier > 0) {
                            unit.setCurrentFuel(Math.min(
                                maxFuel,
                                unit.getCurrentFuel() + Math.floor(maxFuel * modifier / 100)
                            ));
                        } else {
                            unit.setCurrentFuel(Math.max(
                                0,
                                Math.floor(unit.getCurrentFuel() * (100 + modifier) / 100)
                            ));
                        }
                    }
                }
            });
        }

        if (cfg.selfMaterialGain) {
            const category      = cfg.selfMaterialGain[0];
            const modifier      = cfg.selfMaterialGain[1];
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() === playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    const maxBuildMaterial = unit.getMaxBuildMaterial();
                    if (maxBuildMaterial != null) {
                        if (modifier > 0) {
                            unit.setCurrentBuildMaterial(Math.min(
                                maxBuildMaterial,
                                unit.getCurrentBuildMaterial() + Math.floor(maxBuildMaterial * modifier / 100)
                            ));
                        } else {
                            unit.setCurrentBuildMaterial(Math.max(
                                0,
                                Math.floor(unit.getCurrentBuildMaterial() * (100 + modifier) / 100)
                            ));
                        }
                    }

                    const maxProduceMaterial = unit.getMaxProduceMaterial();
                    if (maxProduceMaterial != null) {
                        if (modifier > 0) {
                            unit.setCurrentProduceMaterial(Math.min(
                                maxProduceMaterial,
                                unit.getCurrentProduceMaterial() + Math.floor(maxProduceMaterial * modifier / 100)
                            ));
                        } else {
                            unit.setCurrentProduceMaterial(Math.max(
                                0,
                                Math.floor(unit.getCurrentProduceMaterial() * (100 + modifier) / 100)
                            ));
                        }
                    }
                }
            });
        }

        if (cfg.enemyMaterialGain) {
            const category      = cfg.enemyMaterialGain[0];
            const modifier      = cfg.enemyMaterialGain[1];
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() !== playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    const maxBuildMaterial = unit.getMaxBuildMaterial();
                    if (maxBuildMaterial != null) {
                        if (modifier > 0) {
                            unit.setCurrentBuildMaterial(Math.min(
                                maxBuildMaterial,
                                unit.getCurrentBuildMaterial() + Math.floor(maxBuildMaterial * modifier / 100)
                            ));
                        } else {
                            unit.setCurrentBuildMaterial(Math.max(
                                0,
                                Math.floor(unit.getCurrentBuildMaterial() * (100 + modifier) / 100)
                            ));
                        }
                    }

                    const maxProduceMaterial = unit.getMaxProduceMaterial();
                    if (maxProduceMaterial != null) {
                        if (modifier > 0) {
                            unit.setCurrentProduceMaterial(Math.min(
                                maxProduceMaterial,
                                unit.getCurrentProduceMaterial() + Math.floor(maxProduceMaterial * modifier / 100)
                            ));
                        } else {
                            unit.setCurrentProduceMaterial(Math.max(
                                0,
                                Math.floor(unit.getCurrentProduceMaterial() * (100 + modifier) / 100)
                            ));
                        }
                    }
                }
            });
        }

        if (cfg.selfPrimaryAmmoGain) {
            const category      = cfg.selfPrimaryAmmoGain[0];
            const modifier      = cfg.selfPrimaryAmmoGain[1];
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() === playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    const maxAmmo = unit.getPrimaryWeaponMaxAmmo();
                    if (maxAmmo != null) {
                        if (modifier > 0) {
                            unit.setPrimaryWeaponCurrentAmmo(Math.min(
                                maxAmmo,
                                unit.getPrimaryWeaponCurrentAmmo() + Math.floor(maxAmmo * modifier / 100)
                            ));
                        } else {
                            unit.setPrimaryWeaponCurrentAmmo(Math.max(
                                0,
                                Math.floor(unit.getPrimaryWeaponCurrentAmmo() * (100 + modifier) / 100)
                            ));
                        }
                    }
                }
            });
        }

        if (cfg.enemyPrimaryAmmoGain) {
            const category      = cfg.enemyPrimaryAmmoGain[0];
            const modifier      = cfg.enemyPrimaryAmmoGain[1];
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() !== playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    const maxAmmo = unit.getPrimaryWeaponMaxAmmo();
                    if (maxAmmo != null) {
                        if (modifier > 0) {
                            unit.setPrimaryWeaponCurrentAmmo(Math.min(
                                maxAmmo,
                                unit.getPrimaryWeaponCurrentAmmo() + Math.floor(maxAmmo * modifier / 100)
                            ));
                        } else {
                            unit.setPrimaryWeaponCurrentAmmo(Math.max(
                                0,
                                Math.floor(unit.getPrimaryWeaponCurrentAmmo() * (100 + modifier) / 100)
                            ));
                        }
                    }
                }
            });
        }

        if (cfg.indiscriminateAreaDamage) {
            const center = extraData ? extraData.indiscriminateAreaDamageCenter : null;
            if (!center) {
                Logger.error("BwHelpers.exeInstantSkill() no center for indiscriminateAreaDamage!");
            } else {
                const hpDamage = cfg.indiscriminateAreaDamage[2] * ConfigManager.UNIT_HP_NORMALIZER;
                for (const gridIndex of GridIndexHelpers.getGridsWithinDistance(center as GridIndex, 0, cfg.indiscriminateAreaDamage[1], unitMap.getMapSize())) {
                    const unit = unitMap.getUnitOnMap(gridIndex);
                    if (unit) {
                        unit.setCurrentHp(Math.max(1, unit.getCurrentHp() - hpDamage));
                    }
                }
            }
        }

        if (cfg.selfPromotionGain) {
            const category      = cfg.selfPromotionGain[0];
            const modifier      = cfg.selfPromotionGain[1] * ConfigManager.UNIT_HP_NORMALIZER;
            const maxPromotion  = ConfigManager.getUnitMaxPromotion(configVersion);
            unitMap.forEachUnit(unit => {
                if ((unit.getPlayerIndex() === playerIndex)                                         &&
                    (ConfigManager.checkIsUnitTypeInCategory(configVersion, unit.getType(), category))
                ) {
                    unit.setCurrentPromotion(Math.max(
                        0,
                        Math.min(
                            maxPromotion,
                            unit.getCurrentPromotion() + modifier
                        ),
                    ));
                }
            });
        }
    }
}
