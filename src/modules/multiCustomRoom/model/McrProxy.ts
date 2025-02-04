
namespace TinyWars.MultiCustomRoom.McrProxy {
    import NetManager = Network.Manager;
    import ActionCode = Network.Codes;
    import Helpers    = Utility.Helpers;
    import ProtoTypes = Utility.ProtoTypes;
    import Notify     = Utility.Notify;

    export function init(): void {
        NetManager.addListeners([
            { msgCode: ActionCode.S_McrCreateWar,                callback: _onSMcrCreateWar },
            { msgCode: ActionCode.S_McrGetUnjoinedWaitingInfos,  callback: _onSMcrGetUnjoinedWaitingInfos, },
            { msgCode: ActionCode.S_McrJoinWar,                  callback: _onSMcrJoinWar, },
            { msgCode: ActionCode.S_McrGetJoinedWaitingInfos,    callback: _onSMcrGetJoinedWaitingInfos, },
            { msgCode: ActionCode.S_McrExitWar,                  callback: _onSMcrExitWar, },
            { msgCode: ActionCode.S_McrGetJoinedOngoingInfos,    callback: _onSMcrGetJoinedOngoingInfos, },
            { msgCode: ActionCode.S_McrContinueWar,              callback: _onSMcrContinueWar, },
            { msgCode: ActionCode.S_McrGetReplayInfos,           callback: _onSMcrGetReplayInfos, },
            { msgCode: ActionCode.S_McrGetReplayData,            callback: _onSMcrGetReplayData, },
        ], McrProxy);
    }

    export function reqCreate(param: DataForCreateWar): void {
        NetManager.send({
            C_McrCreateWar: param,
        });
    }
    function _onSMcrCreateWar(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrCreateWar;
        if (!data.errorCode) {
            Notify.dispatch(Notify.Type.SMcrCreateWar, data);
        }
    }

    export function reqUnjoinedWarInfos(): void {
        NetManager.send({
            C_McrGetUnjoinedWaitingInfos: {
            },
        });
    }
    function _onSMcrGetUnjoinedWaitingInfos(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrGetUnjoinedWaitingInfos;
        if (!data.errorCode) {
            McrModel.setUnjoinedWaitingInfos(data.warInfos);
            Notify.dispatch(Notify.Type.SMcrGetUnjoinedWaitingInfos, data);
        }
    }

    export function reqJoin(data: DataForJoinWar): void {
        NetManager.send({
            C_McrJoinWar: data,
        });
    }
    function _onSMcrJoinWar(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrJoinWar;
        if (!data.errorCode) {
            Notify.dispatch(Notify.Type.SMcrJoinWar, data);
        }
    }

    export function reqJoinedWaitingCustomOnlineWarInfos(): void {
        NetManager.send({
            C_McrGetJoinedWaitingInfos: {
            },
        });
    }
    function _onSMcrGetJoinedWaitingInfos(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrGetJoinedWaitingInfos;
        if (!data.errorCode) {
            McrModel.setJoinedWaitingInfos(data.warInfos);
            Notify.dispatch(Notify.Type.SMcrGetJoinedWaitingInfos, data);
        }
    }

    export function reqExitCustomOnlineWar(waitingWarId: number): void {
        NetManager.send({
            C_McrExitWar: {
                infoId    : waitingWarId,
            },
        });
    }
    function _onSMcrExitWar(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrExitWar;
        if (!data.errorCode) {
            Notify.dispatch(Notify.Type.SMcrExitWar, data);
        }
    }

    export function reqGetJoinedOngoingInfos(): void {
        NetManager.send({
            C_McrGetJoinedOngoingInfos: {},
        });
    }
    function _onSMcrGetJoinedOngoingInfos(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrGetJoinedOngoingInfos;
        McrModel.setJoinedOngoingInfos(data.infos);
        Notify.dispatch(Notify.Type.SMcrGetJoinedOngoingInfos, data);
    }

    export function reqContinueWar(warId: number): void {
        NetManager.send({
            C_McrContinueWar: {
                warId: warId,
            },
        });
    }
    function _onSMcrContinueWar(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrContinueWar;
        if (data.errorCode) {
            Notify.dispatch(Notify.Type.SMcrContinueWarFailed, data);
        } else {
            Notify.dispatch(Notify.Type.SMcrContinueWar, data);
        }
    }

    export function reqReplayInfos(replayId?: number): void {
        NetManager.send({
            C_McrGetReplayInfos: {
                replayId,
            },
        });
    }
    function _onSMcrGetReplayInfos(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrGetReplayInfos;
        if (!data.errorCode) {
            McrModel.setReplayInfos(data.infos);
            Notify.dispatch(Notify.Type.SMcrGetReplayInfos);
        }
    }

    export function reqReplayData(replayId: number): void {
        NetManager.send({
            C_McrGetReplayData: {
                replayId,
            },
        });
    }
    function _onSMcrGetReplayData(e: egret.Event): void {
        const data = e.data as ProtoTypes.IS_McrGetReplayData;
        if (data.errorCode) {
            Notify.dispatch(Notify.Type.SMcrGetReplayDataFailed);
        } else {
            McrModel.setReplayData(data as ProtoTypes.S_McrGetReplayData);
            Notify.dispatch(Notify.Type.SMcrGetReplayData);
        }
    }
}
