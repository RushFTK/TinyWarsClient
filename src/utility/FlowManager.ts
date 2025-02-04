
namespace TinyWars.Utility.FlowManager {
    import UserModel    = User.UserModel;
    import McwProxy     = MultiCustomWar.McwProxy;
    import McwModel     = MultiCustomWar.McwModel;
    import ReplayModel  = Replay.ReplayModel;
    import ErrorPanel   = Common.ErrorPanel;

    const _NET_EVENTS = [
        { msgCode: Network.Codes.S_ServerDisconnect,   callback: _onNetSServerDisconnect },
    ];
    const _NOTIFY_EVENTS = [
        { type: Notify.Type.NetworkConnected,   callback: _onNotifyNetworkConnected, },
        { type: Notify.Type.ConfigLoaded,       callback: _onNotifyConfigLoaded },
        { type: Notify.Type.SLogin,             callback: _onNotifySLogin },
        { type: Notify.Type.SLogout,            callback: _onNotifySLogout },
    ];

    let _hasOnceWentToLobby = false;

    export async function startGame(stage: egret.Stage): Promise<void> {
        window.onerror = (message, filename, row, col, err) => {
            ErrorPanel.show({
                content : `${message}\n\n${err ? err.stack : "No available call stack."}`,
            });
        };

        Network.Manager.addListeners(_NET_EVENTS, FlowManager);
        Notify.addEventListeners(_NOTIFY_EVENTS, FlowManager);
        Utility.StageManager.init(stage);
        await Promise.all([ResManager.init(), ProtoManager.init()]);

        Lang.init();
        NoSleepManager.init();
        ConfigManager.init();
        Network.Manager.init();
        McwProxy.init();
        McwModel.init();
        Time.TimeProxy.init();
        Time.TimeModel.init();
        User.UserProxy.init();
        User.UserModel.init();
        WarMap.WarMapProxy.init();
        WarMap.WarMapModel.init();
        Login.LoginProxy.init();
        MultiCustomRoom.McrProxy.init();

        _removeLoadingDom();
        gotoLogin();

        await ResManager.loadMainRes();
        (_checkCanFirstGoToLobby()) && (gotoLobby());
    }

    export function gotoLogin(): void {
        McwModel.unloadWar();
        ReplayModel.unloadWar();
        StageManager.closeAllPanels();
        Login.LoginBackgroundPanel.show();
        Login.LoginPanel.show();
    }
    export function gotoLobby(): void {
        _hasOnceWentToLobby = true;
        McwModel.unloadWar();
        ReplayModel.unloadWar();
        StageManager.closeAllPanels();
        Lobby.LobbyPanel.show();
        Lobby.LobbyTopPanel.show();
    }
    export async function gotoMultiCustomWar(data: Types.SerializedBwWar): Promise<void> {
        ReplayModel.unloadWar();
        await McwModel.loadWar(data);
        StageManager.closeAllPanels();
        MultiCustomWar.McwBackgroundPanel.show();
        MultiCustomWar.McwTopPanel.show();
        MultiCustomWar.McwWarPanel.show();
        MultiCustomWar.McwTileBriefPanel.show();
        MultiCustomWar.McwUnitBriefPanel.show();
    }
    export async function gotoReplay(warData: Uint8Array, nicknames: string[]): Promise<void> {
        McwModel.unloadWar();
        await ReplayModel.loadWar(warData, nicknames);
        StageManager.closeAllPanels();
        Replay.ReplayBackgroundPanel.show();
        Replay.ReplayTopPanel.show();
        Replay.ReplayWarPanel.show();
        Replay.ReplayTileBriefPanel.show();
        Replay.ReplayUnitBriefPanel.show();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Callbacks.
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    function _onNotifyNetworkConnected(e: egret.Event): void {
        const account   = UserModel.getSelfAccount();
        const password  = UserModel.getSelfPassword();
        if ((!UserModel.checkIsLoggedIn()) && (account != null) && (password != null)) {
            Login.LoginProxy.reqLogin(account, password, true);
        }
    }

    function _onNetSServerDisconnect(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_ServerDisconnect;

        _hasOnceWentToLobby = false;
        UserModel.clearLoginInfo();
        FlowManager.gotoLogin();

        Common.AlertPanel.show({
            title   : Lang.getText(Lang.Type.B0025),
            content : Lang.getText(Lang.Type.A0020),
        });
    }

    function _onNotifyConfigLoaded(e: egret.Event): void {
        (_checkCanFirstGoToLobby()) && (gotoLobby());
    }

    function _onNotifySLogin(e: egret.Event): void {
        if (_checkCanFirstGoToLobby()) {
            gotoLobby();
        } else {
            const mcwWar = McwModel.getWar();
            if (mcwWar) {
                McwProxy.reqMcwPlayerSyncWar(mcwWar, Types.SyncWarRequestType.ReconnectionRequest);
            }
        }
    }

    function _onNotifySLogout(e: egret.Event): void {
        _hasOnceWentToLobby = false;
        UserModel.clearLoginInfo();
        gotoLogin();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Other private functions.
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    function _checkCanFirstGoToLobby(): boolean {
        return (!_hasOnceWentToLobby)
            && (User.UserModel.checkIsLoggedIn())
            && (ResManager.checkIsLoadedMainResource())
            && (ConfigManager.checkIsConfigLoaded(ConfigManager.getNewestConfigVersion()))
    }

    function _removeLoadingDom(): void {
        const document = window.document;
        if (document) {
            const outLoadingLayer = document.getElementById("outLoadingLayer");
            (outLoadingLayer) && (document.body.removeChild(outLoadingLayer));
        }
    }
}
