
namespace Login {
    export class LoginPanel extends GameUi.UiPanel {
        protected readonly _layerType = Types.LayerType.Hud;
        protected readonly _isAlone   = true;

        private _inputAccount : GameUi.UiTextInput;
        private _inputPassword: GameUi.UiTextInput;
        private _btnRegister  : GameUi.UiButton;
        private _btnLogin     : GameUi.UiButton;

        private static _instance: LoginPanel;

        public static create(): void {
            egret.assert(!LoginPanel._instance);
            LoginPanel._instance = new LoginPanel();
            LoginPanel._instance.open();
        }

        public static destroy(): void {
            LoginPanel._instance.close();
            delete LoginPanel._instance;
        }

        private constructor() {
            super();

            this._setAutoAdjustHeightEnabled();
            this.skinName = "resource/skins/login/LoginPanel.exml";
        }

        protected _onFirstOpened(): void {
            this._notifyListeners = [
                { name: Types.NotifyType.SLogin, callback: this._onNotifySLogin },
            ];
            this._uiListeners = [
                { ui: this._btnLogin, callback: this._onTouchedBtnLogin },
            ];
        }

        private _onNotifySLogin(e: egret.Event): void {
            const data = e.data as Network.Proto.IS_Login;
            if (data.status === ProtoEnums.S_Login_Status.AccountInvalid) {
                Utility.FloatText.show("用户名不正确");
            } else if (data.status === ProtoEnums.S_Login_Status.AlreadyLoggedIn) {
                Utility.FloatText.show("当前已登陆");
            } else if (data.status === ProtoEnums.S_Login_Status.PasswordInvalid) {
                Utility.FloatText.show("密码不正确");
            } else {
                Utility.FloatText.show("成功登陆");
            }
        }

        private _onTouchedBtnLogin(e: egret.TouchEvent): void {
            LoginProxy.reqLogin(this._inputAccount.text || "", this._inputPassword.text || "");
        }
    }
}
