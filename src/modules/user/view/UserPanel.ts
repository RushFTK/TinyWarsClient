
namespace TinyWars.User {
    import Lang         = Utility.Lang;
    import Helpers      = Utility.Helpers;
    import Notify       = Utility.Notify;
    import FlowManager  = Utility.FlowManager;
    import Types        = Utility.Types;
    import LocalStorage = Utility.LocalStorage;

    export class UserPanel extends GameUi.UiPanel {
        protected readonly _LAYER_TYPE   = Utility.Types.LayerType.Hud0;
        protected readonly _IS_EXCLUSIVE = true;

        private static _instance: UserPanel;

        private _labelTitle         : GameUi.UiLabel;
        private _btnChangeNickname  : GameUi.UiButton;

        private _labelRankScore     : GameUi.UiLabel;
        private _labelRankName      : GameUi.UiLabel;
        private _labelRank2pWins    : GameUi.UiLabel;
        private _labelRank2pLoses   : GameUi.UiLabel;
        private _labelRank2pDraws   : GameUi.UiLabel;

        private _labelMcw2pWins     : GameUi.UiLabel;
        private _labelMcw2pLoses    : GameUi.UiLabel;
        private _labelMcw2pDraws    : GameUi.UiLabel;
        private _labelMcw3pWins     : GameUi.UiLabel;
        private _labelMcw3pLoses    : GameUi.UiLabel;
        private _labelMcw3pDraws    : GameUi.UiLabel;
        private _labelMcw4pWins     : GameUi.UiLabel;
        private _labelMcw4pLoses    : GameUi.UiLabel;
        private _labelMcw4pDraws    : GameUi.UiLabel;

        private _labelRegisterTime  : GameUi.UiLabel;
        private _labelLastLoginTime : GameUi.UiLabel;
        private _labelOnlineTime    : GameUi.UiLabel;
        private _labelLoginCount    : GameUi.UiLabel;
        private _labelUserId        : GameUi.UiLabel;
        private _labelDiscordId     : GameUi.UiLabel;
        private _btnChangeDiscordId : GameUi.UiButton;

        private _btnShowOnlineUsers : GameUi.UiButton;
        private _btnChangeLanguage  : GameUi.UiButton;
        private _btnClose           : GameUi.UiButton;

        private _userId: number;

        public static show(userId: number): void {
            if (!UserPanel._instance) {
                UserPanel._instance = new UserPanel();
            }
            UserPanel._instance._userId = userId;
            UserPanel._instance.open();
        }

        public static hide(): void {
            if (UserPanel._instance) {
                UserPanel._instance.close();
            }
        }

        private constructor() {
            super();

            this._setAutoAdjustHeightEnabled();
            this.skinName = "resource/skins/user/UserPanel.exml";
        }

        protected _onFirstOpened(): void {
            this._notifyListeners = [
                { type: Notify.Type.SGetUserPublicInfo,     callback: this._onNotifySGetUserPublicInfo },
                { type: Notify.Type.SUserChangeNickname,    callback: this._onNotifySUserChangeNickname },
                { type: Notify.Type.SUserChangeDiscordId,   callback: this._onNotifySUserChangeDiscordId },
            ];
            this._uiListeners = [
                { ui: this._btnChangeNickname,  callback: this._onTouchedBtnChangeNickname },
                { ui: this._btnChangeDiscordId, callback: this._onTouchedBtnChangeDiscordId },
                { ui: this._btnShowOnlineUsers, callback: this._onTouchedBtnShowOnlineUsers },
                { ui: this._btnChangeLanguage,  callback: this._onTouchedBtnChangeLanguage },
                { ui: this._btnClose,           callback: this.close },
            ];
        }
        protected _onOpened(): void {
            UserProxy.reqGetUserPublicInfo(this._userId);

            this._updateView();
        }
        protected _onClosed(): void {
            FlowManager.gotoLobby();
        }

        private _onNotifySGetUserPublicInfo(e: egret.Event): void {
            this._updateView();
        }
        private _onNotifySUserChangeNickname(e: egret.Event): void {
            const userId = this._userId;
            if (userId === UserModel.getSelfUserId()) {
                UserProxy.reqGetUserPublicInfo(this._userId);
            }
        }
        private _onNotifySUserChangeDiscordId(e: egret.Event): void {
            const userId = this._userId;
            if (userId === UserModel.getSelfUserId()) {
                UserProxy.reqGetUserPublicInfo(this._userId);
            }
        }
        private _onTouchedBtnChangeNickname(e: egret.TouchEvent): void {
            UserChangeNicknamePanel.show();
        }
        private _onTouchedBtnChangeDiscordId(e: egret.TouchEvent): void {
            UserChangeDiscordIdPanel.show();
        }
        private _onTouchedBtnShowOnlineUsers(e: egret.TouchEvent): void {
            UserOnlineUsersPanel.show();
        }
        private _onTouchedBtnChangeLanguage(e: egret.TouchEvent): void {
            const languageType = Lang.getLanguageType() === Types.LanguageType.Chinese
                ? Types.LanguageType.English
                : Types.LanguageType.Chinese;
            Lang.setLanguageType(languageType);
            LocalStorage.setLanguageType(languageType);

            Notify.dispatch(Notify.Type.LanguageChanged);
            this._updateView();
        }

        private _updateView(): void {
            const userId    = this._userId;
            const info      = userId != null ? UserModel.getUserInfo(userId) : undefined;
            if (info) {
                const isSelf                    = userId === UserModel.getSelfUserId();
                this._labelTitle.text           = Lang.getFormatedText(Lang.Type.F0009, info.nickname);
                this._btnChangeNickname.visible = isSelf;

                this._labelRankScore.text   = `${info.rank2pScore}`;
                this._labelRankName.text    = ConfigManager.getRankName(ConfigManager.getNewestConfigVersion(), info.rank2pScore);
                this._labelRank2pWins.text  = Lang.getFormatedText(Lang.Type.F0010, info.rank2pWins);
                this._labelRank2pLoses.text = Lang.getFormatedText(Lang.Type.F0011, info.rank2pLoses);
                this._labelRank2pDraws.text = Lang.getFormatedText(Lang.Type.F0012, info.rank2pDraws);

                this._labelMcw2pWins.text   = Lang.getFormatedText(Lang.Type.F0010, info.mcw2pWins);
                this._labelMcw2pLoses.text  = Lang.getFormatedText(Lang.Type.F0011, info.mcw2pLoses);
                this._labelMcw2pDraws.text  = Lang.getFormatedText(Lang.Type.F0012, info.mcw2pDraws);
                this._labelMcw3pWins.text   = Lang.getFormatedText(Lang.Type.F0010, info.mcw3pWins);
                this._labelMcw3pLoses.text  = Lang.getFormatedText(Lang.Type.F0011, info.mcw3pLoses);
                this._labelMcw3pDraws.text  = Lang.getFormatedText(Lang.Type.F0012, info.mcw3pDraws);
                this._labelMcw4pWins.text   = Lang.getFormatedText(Lang.Type.F0010, info.mcw4pWins);
                this._labelMcw4pLoses.text  = Lang.getFormatedText(Lang.Type.F0011, info.mcw4pLoses);
                this._labelMcw4pDraws.text  = Lang.getFormatedText(Lang.Type.F0012, info.mcw4pDraws);

                this._labelRegisterTime.text        = Helpers.getTimestampShortText(info.registerTime);
                this._labelLastLoginTime.text       = Helpers.getTimestampShortText(info.lastLoginTime);
                this._labelOnlineTime.text          = Helpers.getTimeDurationText(info.onlineTime);
                this._labelLoginCount.text          = `${info.loginCount}`;
                this._labelUserId.text              = `${userId}`;
                this._labelDiscordId.text           = info.discordId || "--";
                this._btnChangeDiscordId.visible    = isSelf;
            }

            this._updateBtnChangeNickname();
            this._updateBtnChangeDiscordId();
            this._updateBtnShowOnlineUsers();
            this._updateBtnChangeLanguage();
        }

        private _updateBtnChangeNickname(): void {
            this._btnChangeNickname.label = Lang.getText(Lang.Type.B0149);
        }
        private _updateBtnChangeDiscordId(): void {
            this._btnChangeDiscordId.label = Lang.getText(Lang.Type.B0150);
        }
        private _updateBtnShowOnlineUsers(): void {
            this._btnShowOnlineUsers.label = Lang.getText(Lang.Type.B0151);
        }
        private _updateBtnChangeLanguage(): void {
            this._btnChangeLanguage.label = Lang.getLanguageType() === Types.LanguageType.Chinese
                ? Lang.getTextWithLanguage(Lang.Type.B0148, Types.LanguageType.English)
                : Lang.getTextWithLanguage(Lang.Type.B0148, Types.LanguageType.Chinese);
        }
    }
}
