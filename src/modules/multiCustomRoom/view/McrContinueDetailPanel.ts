
namespace TinyWars.MultiCustomRoom {
    import ProtoTypes   = Utility.ProtoTypes;
    import Helpers      = Utility.Helpers;
    import Notify       = Utility.Notify;
    import Lang         = Utility.Lang;
    import Types        = Utility.Types;
    import FlowManager  = Utility.FlowManager;
    import HelpPanel    = Common.HelpPanel;
    import BlockPanel   = Common.BlockPanel;

    export class McrContinueDetailPanel extends GameUi.UiPanel {
        protected readonly _LAYER_TYPE   = Utility.Types.LayerType.Hud0;
        protected readonly _IS_EXCLUSIVE = true;

        private static _instance: McrContinueDetailPanel;

        private _btnHelpFog                 : GameUi.UiButton;
        private _btnHelpTimeLimit           : GameUi.UiButton;
        private _labelWarPassword           : GameUi.UiLabel;
        private _labelHasFog                : GameUi.UiLabel;
        private _labelTimeLimit             : GameUi.UiLabel;
        private _labelInitialFund           : GameUi.UiLabel;
        private _labelIncomeModifier        : GameUi.UiLabel;
        private _labelInitialEnergy         : GameUi.UiLabel;
        private _labelEnergyGrowthModifier  : GameUi.UiLabel;
        private _labelMoveRangeModifier     : GameUi.UiLabel;
        private _labelAttackPowerModifier   : GameUi.UiLabel;
        private _labelVisionRangeModifier   : GameUi.UiLabel;
        private _listPlayer                 : GameUi.UiScrollList;

        private _btnConfirm: GameUi.UiButton;
        private _btnCancel : GameUi.UiButton;

        private _openData: ProtoTypes.IMcwOngoingDetail;

        public static show(data: ProtoTypes.IMcwOngoingDetail): void {
            if (!McrContinueDetailPanel._instance) {
                McrContinueDetailPanel._instance = new McrContinueDetailPanel();
            }
            McrContinueDetailPanel._instance._openData = data;
            McrContinueDetailPanel._instance.open();
        }
        public static hide(): void {
            if (McrContinueDetailPanel._instance) {
                McrContinueDetailPanel._instance.close();
            }
        }

        private constructor() {
            super();

            this._setAutoAdjustHeightEnabled();
            this._setTouchMaskEnabled();
            this._callbackForTouchMask = () => McrContinueDetailPanel.hide();
            this.skinName = "resource/skins/multiCustomRoom/McrContinueDetailPanel.exml";
        }

        protected _onFirstOpened(): void {
            this._uiListeners = [
                { ui: this._btnHelpFog,       callback: this._onTouchedBtnHelpFog },
                { ui: this._btnHelpTimeLimit, callback: this._onTouchedBtnHelpTimeLimit },
                { ui: this._btnCancel,        callback: this._onTouchedBtnCancel },
                { ui: this._btnConfirm,       callback: this._onTouchedBtnConfirm },
            ];
            this._notifyListeners = [
                { type: Notify.Type.SMcrContinueWar,        callback: this._onNotifySMcrContinueWar },
                { type: Notify.Type.SMcrContinueWarFailed,  callback: this._onNotifySMcrContinueWarFailed },
            ];

            this._listPlayer.setItemRenderer(PlayerRenderer);
        }

        protected _onOpened(): void {
            this._updateView();
        }

        protected _onClosed(): void {
            this._listPlayer.clear();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Callbacks.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        private _onTouchedBtnHelpFog(e: egret.TouchEvent): void {
            HelpPanel.show({
                title  : Lang.getText(Lang.Type.B0020),
                content: Lang.getRichText(Lang.RichType.R0002),
            });
        }
        private _onTouchedBtnHelpTimeLimit(e: egret.TouchEvent): void {
            HelpPanel.show({
                title  : Lang.getText(Lang.Type.B0021),
                content: Lang.getRichText(Lang.RichType.R0003),
            });
        }
        private _onTouchedBtnCancel(e: egret.TouchEvent): void {
            McrContinueDetailPanel.hide();
        }
        private _onTouchedBtnConfirm(e: egret.TouchEvent): void {
            BlockPanel.show({
                title   : Lang.getText(Lang.Type.B0029),
                content : Lang.getText(Lang.Type.A0021),
            });
            McrProxy.reqContinueWar(this._openData.id);
        }

        private _onNotifySMcrContinueWar(e: egret.Event): void {
            FlowManager.gotoMultiCustomWar((e.data as ProtoTypes.IS_McrContinueWar).war as Types.SerializedBwWar);
        }
        private _onNotifySMcrContinueWarFailed(e: egret.Event): void {
            BlockPanel.hide();
            McrContinueDetailPanel.hide();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Other functions.
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        private _updateView(): void {
            const info = this._openData;
            this._labelWarPassword.text             = info.warPassword ? info.warPassword : "----";
            this._labelHasFog.text                  = Lang.getText(info.hasFog ? Lang.Type.B0012 : Lang.Type.B0013);
            this._labelTimeLimit.text               = Helpers.getTimeDurationText(info.timeLimit);
            this._labelInitialFund.text             = `${info.initialFund}`;
            this._labelIncomeModifier.text          = `${info.incomeModifier}%`;
            this._labelInitialEnergy.text           = `${info.initialEnergy}%`;
            this._labelEnergyGrowthModifier.text    = `${info.energyGrowthModifier}%`;
            this._labelMoveRangeModifier.text       = `${info.moveRangeModifier > 0 ? "+" : ""}${info.moveRangeModifier}`;
            this._labelAttackPowerModifier.text     = `${info.attackPowerModifier > 0 ? "+" : ""}${info.attackPowerModifier}%`;
            this._labelVisionRangeModifier.text     = `${info.visionRangeModifier > 0 ? "+" : ""}${info.visionRangeModifier}`;
            this._listPlayer.bindData(this._getDataForListPlayer());
        }

        private _getDataForListPlayer(): DataForPlayerRenderer[] {
            const warInfo = this._openData;
            const mapInfo = WarMap.WarMapModel.getMapMetaData(warInfo.mapFileName);
            if (!mapInfo) {
                return [];
            } else {
                const data: DataForPlayerRenderer[] = [
                    {
                        playerIndex : 1,
                        playerName  : warInfo.p1UserNickname,
                        teamIndex   : warInfo.p1TeamIndex,
                        isAlive     : warInfo.p1IsAlive,
                        coId        : warInfo.p1CoId,
                    },
                    {
                        playerIndex : 2,
                        playerName  : warInfo.p2UserNickname,
                        teamIndex   : warInfo.p2TeamIndex,
                        isAlive     : warInfo.p2IsAlive,
                        coId        : warInfo.p2CoId,
                    },
                ];

                if (mapInfo.playersCount >= 3) {
                    data.push({
                        playerIndex : 3,
                        playerName  : warInfo.p3UserNickname,
                        teamIndex   : warInfo.p3TeamIndex,
                        isAlive     : warInfo.p3IsAlive,
                        coId        : warInfo.p3CoId,
                    });
                }
                if (mapInfo.playersCount >= 4) {
                    data.push({
                        playerIndex : 4,
                        playerName  : warInfo.p4UserNickname,
                        teamIndex   : warInfo.p4TeamIndex,
                        isAlive     : warInfo.p4IsAlive,
                        coId        : warInfo.p4CoId,
                    });
                }
                data[warInfo.playerIndexInTurn - 1].defeatTimestamp = warInfo.enterTurnTime + warInfo.timeLimit;

                return data;
            }
        }
    }

    type DataForPlayerRenderer = {
        playerIndex     : number;
        playerName      : string;
        teamIndex       : number;
        isAlive         : boolean;
        coId            : number | null;
        defeatTimestamp?: number;
    }

    class PlayerRenderer extends eui.ItemRenderer {
        private _labelNickname  : GameUi.UiLabel;
        private _labelIndex     : GameUi.UiLabel;
        private _labelTeam      : GameUi.UiLabel;
        private _labelCoName    : GameUi.UiLabel;

        protected dataChanged(): void {
            super.dataChanged();

            const data = this.data as DataForPlayerRenderer;
            if (data.defeatTimestamp != null) {
                const leftTime                  = data.defeatTimestamp - Time.TimeModel.getServerTimestamp();
                this.currentState               = "down";
                this._labelIndex.text           = Helpers.getColorTextForPlayerIndex(data.playerIndex);
                this._labelTeam.text            = Helpers.getTeamText(data.teamIndex);
                this._labelNickname.text        = data.playerName;
                this._labelNickname.textColor   = 0x00FF00;
                this._labelCoName.text          = this._getCoName(data.coId) + (leftTime > 0
                    ? ` (${Lang.getText(Lang.Type.B0027)}:${Helpers.getTimeDurationText(leftTime)})`
                    : ` (${Lang.getText(Lang.Type.B0028)})`);
            } else {
                this.currentState               = "up";
                this._labelIndex.text           = Helpers.getColorTextForPlayerIndex(data.playerIndex);
                this._labelTeam.text            = Helpers.getTeamText(data.teamIndex);
                this._labelNickname.text        = data.playerName;
                this._labelNickname.textColor   = data.isAlive ? 0xFFFFFF : 0x999999;
                this._labelCoName.text          = this._getCoName(data.coId);
            }
        }

        private _getCoName(coId: number | null): string {
            return coId == null
                ? `(${Lang.getText(Lang.Type.B0001)}CO)`
                : ConfigManager.getCoBasicCfg(ConfigManager.getNewestConfigVersion(), coId).name;
        }
    }
}
