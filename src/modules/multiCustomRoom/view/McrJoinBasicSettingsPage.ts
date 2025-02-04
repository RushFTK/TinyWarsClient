
namespace TinyWars.MultiCustomRoom {
    import ProtoTypes   = Utility.ProtoTypes;
    import Helpers      = Utility.Helpers;
    import Lang         = Utility.Lang;
    import Types        = Utility.Types;
    import HelpPanel    = Common.HelpPanel;
    import WarMapModel  = WarMap.WarMapModel;

    export class McrJoinBasicSettingsPage extends GameUi.UiTabPage {
        private _labelMapName       : GameUi.UiLabel;
        private _labelPlayersCount  : GameUi.UiLabel;

        private _labelWarName       : GameUi.UiTextInput;
        private _labelWarPassword   : GameUi.UiTextInput;
        private _labelWarComment    : GameUi.UiTextInput;

        private _btnPrevPlayerIndex : GameUi.UiButton;
        private _btnNextPlayerIndex : GameUi.UiButton;
        private _labelPlayerIndex   : GameUi.UiLabel;
        private _btnHelpPlayerIndex : GameUi.UiButton;

        private _btnPrevTeam    : GameUi.UiButton;
        private _btnNextTeam    : GameUi.UiButton;
        private _labelTeam      : GameUi.UiLabel;
        private _btnHelpTeam    : GameUi.UiButton;

        private _labelFog   : GameUi.UiLabel;
        private _btnHelpFog : GameUi.UiButton;

        private _labelTimeLimit     : GameUi.UiLabel;
        private _btnHelpTimeLimit   : GameUi.UiButton;

        private _labelCoName    : GameUi.UiLabel;
        private _btnChangeCo    : GameUi.UiLabel;

        private _listPlayer     : GameUi.UiScrollList;

        private _mapMetaData: ProtoTypes.IMapMetaData;

        public constructor() {
            super();

            this.skinName = "resource/skins/multiCustomRoom/McrJoinBasicSettingsPage.exml";
        }

        protected _onFirstOpened(): void {
            this._uiListeners = [
                { ui: this._btnPrevPlayerIndex, callback: this._onTouchedBtnPrevPlayerIndex, },
                { ui: this._btnNextPlayerIndex, callback: this._onTouchedBtnNextPlayerIndex, },
                { ui: this._btnHelpPlayerIndex, callback: this._onTouchedBtnHelpPlayerIndex, },
                { ui: this._btnPrevTeam,        callback: this._onTouchedBtnPrevTeam, },
                { ui: this._btnNextTeam,        callback: this._onTouchedBtnNextTeam, },
                { ui: this._btnHelpTeam,        callback: this._onTouchedBtnHelpTeam, },
                { ui: this._btnHelpFog,         callback: this._onTouchedBtnHelpFog, },
                { ui: this._btnHelpTimeLimit,   callback: this._onTouchedBtnHelpTimeLimit, },
                { ui: this._btnChangeCo,        callback: this._onTouchedBtnChangeCo, },
            ];

            this._listPlayer.setItemRenderer(PlayerRenderer);
        }

        protected _onOpened(): void {
            this._mapMetaData = McrModel.getJoinWarMapMetaData();

            this._updateLabelWarName();
            this._updateLabelWarPassword();
            this._updateLabelWarComment();
            this._updateLabelMapName();
            this._updateLabelPlayersCount();
            this._updateLabelPlayerIndex();
            this._updateLabelTeam();
            this._updateLabelFog();
            this._updateLabelTimeLimit();
            this._updateLabelCoName();
            this._updateListPlayer();
        }

        protected _onClosed(): void {
            this._listPlayer.clear();
        }

        ////////////////////////////////////////////////////////////////////////////////
        // Event callbacks.
        ////////////////////////////////////////////////////////////////////////////////
        private _onTouchedBtnPrevPlayerIndex(e: egret.TouchEvent): void {
            McrModel.setJoinWarPrevPlayerIndex();
            this._updateLabelPlayerIndex();
        }

        private _onTouchedBtnNextPlayerIndex(e: egret.TouchEvent): void {
            McrModel.setJoinWarNextPlayerIndex();
            this._updateLabelPlayerIndex();
        }

        private _onTouchedBtnHelpPlayerIndex(e: egret.TouchEvent): void {
            HelpPanel.show({
                title  : Lang.getText(Lang.Type.B0018),
                content: Lang.getRichText(Lang.RichType.R0000),
            });
        }

        private _onTouchedBtnPrevTeam(e: egret.TouchEvent): void {
            McrModel.setJoinWarPrevTeamIndex();
            this._updateLabelTeam();
        }

        private _onTouchedBtnNextTeam(e: egret.TouchEvent): void {
            McrModel.setJoinWarNextTeamIndex();
            this._updateLabelTeam();
        }

        private _onTouchedBtnHelpTeam(e: egret.TouchEvent): void {
            HelpPanel.show({
                title  : Lang.getText(Lang.Type.B0019),
                content: Lang.getRichText(Lang.RichType.R0001),
            });
        }

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

        private _onTouchedBtnChangeCo(e: egret.TouchEvent): void {
            McrJoinSettingsPanel.hide();
            McrJoinCoListPanel.show(McrModel.getJoinWarCoId());
        }

        ////////////////////////////////////////////////////////////////////////////////
        // View functions.
        ////////////////////////////////////////////////////////////////////////////////
        private _updateLabelWarName(): void {
            this._labelWarName.text = McrModel.getJoinWarRoomInfo().warName || "--";
        }

        private _updateLabelWarPassword(): void {
            this._labelWarPassword.text = McrModel.getJoinWarRoomInfo().warPassword || "--";
        }

        private _updateLabelWarComment(): void {
            this._labelWarComment.text = McrModel.getJoinWarRoomInfo().warComment || "--";
        }

        private _updateLabelMapName(): void {
            this._labelMapName.text =  WarMapModel.getMapNameInLanguage(this._mapMetaData.mapFileName);
        }

        private _updateLabelPlayersCount(): void {
            this._labelPlayersCount.text = "" + this._mapMetaData.playersCount;
        }

        private _updateLabelPlayerIndex(): void {
            const index = McrModel.getJoinWarPlayerIndex();
            this._labelPlayerIndex.text = `${index} (${Helpers.getColorTextForPlayerIndex(index)})`;
        }

        private _updateLabelTeam(): void {
            this._labelTeam.text = Helpers.getTeamText(McrModel.getJoinWarTeamIndex());
        }

        private _updateLabelFog(): void {
            this._labelFog.text = Lang.getText(McrModel.getJoinWarRoomInfo() ? Lang.Type.B0012 : Lang.Type.B0013);
        }

        private _updateLabelTimeLimit(): void {
            this._labelTimeLimit.text = Helpers.getTimeDurationText(McrModel.getJoinWarRoomInfo().timeLimit);
        }

        private _updateLabelCoName(): void {
            const coId = McrModel.getJoinWarCoId();
            if (coId == null) {
                this._labelCoName.text = `(${Lang.getText(Lang.Type.B0013)} CO)`;
            } else {
                const cfg               = ConfigManager.getCoBasicCfg(ConfigManager.getNewestConfigVersion(), coId);
                this._labelCoName.text  = `${cfg.name} (T${cfg.tier})`;
            }
        }

        private _updateListPlayer(): void {
            this._listPlayer.bindData(this._getDataForListPlayer());
        }

        private _getDataForListPlayer(): DataForPlayerRenderer[] {
            const warInfo = McrModel.getJoinWarRoomInfo();
            const data: DataForPlayerRenderer[] = [
                {
                    playerIndex : 1,
                    nickname    : warInfo.p1UserNickname,
                    teamIndex   : warInfo.p1TeamIndex,
                    coId        : warInfo.p1CoId,
                },
                {
                    playerIndex : 2,
                    nickname    : warInfo.p2UserNickname,
                    teamIndex   : warInfo.p2TeamIndex,
                    coId        : warInfo.p2CoId,
                },
            ];

            const playersCount = WarMapModel.getMapMetaData(warInfo.mapFileName).playersCount;
            if (playersCount >= 3) {
                data.push({
                    playerIndex : 3,
                    nickname    : warInfo.p3UserNickname,
                    teamIndex   : warInfo.p3TeamIndex,
                    coId        : warInfo.p3CoId,
                });
            }
            if (playersCount >= 4) {
                data.push({
                    playerIndex : 4,
                    nickname    : warInfo.p4UserNickname,
                    teamIndex   : warInfo.p4TeamIndex,
                    coId        : warInfo.p4CoId,
                });
            }

            return data;
        }
    }

    type DataForPlayerRenderer = {
        playerIndex : number | null;
        nickname    : string | null;
        teamIndex   : number | null;
        coId        : number | null;
    }

    class PlayerRenderer extends eui.ItemRenderer {
        private _labelNickname  : GameUi.UiLabel;
        private _labelIndex     : GameUi.UiLabel;
        private _labelTeam      : GameUi.UiLabel;
        private _labelCoName    : GameUi.UiLabel;

        protected dataChanged(): void {
            super.dataChanged();

            const data                  = this.data as DataForPlayerRenderer;
            this._labelIndex.text       = Helpers.getColorTextForPlayerIndex(data.playerIndex);
            this._labelNickname.text    = data.nickname || "????";
            this._labelTeam.text        = data.teamIndex != null ? Helpers.getTeamText(data.teamIndex) : "??";

            if (data.coId == null) {
                this._labelCoName.text = data.nickname == null ? "????" : `(${Lang.getText(Lang.Type.B0013)} CO)`;
            } else {
                const cfg               = ConfigManager.getCoBasicCfg(ConfigManager.getNewestConfigVersion(), data.coId);
                this._labelCoName.text  = `${cfg.name} (T${cfg.tier})`;
            }
        }
    }
}
