
namespace TinyWars.Network {
export enum Codes {
C_Heartbeat = 1,
S_Heartbeat = 2,
C_Register = 3,
S_Register = 4,
C_Login = 5,
S_Login = 6,
C_Logout = 7,
S_Logout = 8,
S_Error = 10,
S_ServerDisconnect = 12,
S_NewestConfigVersion = 14,
C_GetUserPublicInfo = 21,
S_GetUserPublicInfo = 22,
C_UserChangeNickname = 23,
S_UserChangeNickname = 24,
C_UserChangeDiscordId = 25,
S_UserChangeDiscordId = 26,
C_UserGetOnlineUsers = 27,
S_UserGetOnlineUsers = 28,
C_GetMapMetaDataList = 41,
S_GetMapMetaDataList = 42,
C_GetMapRawData = 43,
S_GetMapRawData = 44,
C_GetMapStatisticsDataList = 45,
S_GetMapStatisticsDataList = 46,
C_MmChangeAvailability = 101,
S_MmChangeAvailability = 102,
C_McrCreateWar = 1001,
S_McrCreateWar = 1002,
C_McrExitWar = 1003,
S_McrExitWar = 1004,
C_McrGetJoinedWaitingInfos = 1005,
S_McrGetJoinedWaitingInfos = 1006,
C_McrGetUnjoinedWaitingInfos = 1007,
S_McrGetUnjoinedWaitingInfos = 1008,
C_McrJoinWar = 1009,
S_McrJoinWar = 1010,
C_McrGetJoinedOngoingInfos = 1011,
S_McrGetJoinedOngoingInfos = 1012,
C_McrContinueWar = 1013,
S_McrContinueWar = 1014,
C_McrGetReplayInfos = 1015,
S_McrGetReplayInfos = 1016,
C_McrGetReplayData = 1017,
S_McrGetReplayData = 1018,
C_McwPlayerBeginTurn = 1101,
S_McwPlayerBeginTurn = 1102,
C_McwPlayerEndTurn = 1103,
S_McwPlayerEndTurn = 1104,
C_McwPlayerSurrender = 1105,
S_McwPlayerSurrender = 1106,
C_McwPlayerProduceUnit = 1107,
S_McwPlayerProduceUnit = 1108,
C_McwPlayerDeleteUnit = 1109,
S_McwPlayerDeleteUnit = 1110,
C_McwPlayerVoteForDraw = 1111,
S_McwPlayerVoteForDraw = 1112,
C_McwPlayerSyncWar = 1113,
S_McwPlayerSyncWar = 1114,
C_McwUnitWait = 1151,
S_McwUnitWait = 1152,
C_McwUnitBeLoaded = 1153,
S_McwUnitBeLoaded = 1154,
C_McwUnitCaptureTile = 1155,
S_McwUnitCaptureTile = 1156,
C_McwUnitAttack = 1157,
S_McwUnitAttack = 1158,
C_McwUnitDrop = 1159,
S_McwUnitDrop = 1160,
C_McwUnitBuildTile = 1161,
S_McwUnitBuildTile = 1162,
C_McwUnitDive = 1163,
S_McwUnitDive = 1164,
C_McwUnitSurface = 1165,
S_McwUnitSurface = 1166,
C_McwUnitJoin = 1167,
S_McwUnitJoin = 1168,
C_McwUnitLaunchFlare = 1169,
S_McwUnitLaunchFlare = 1170,
C_McwUnitLaunchSilo = 1171,
S_McwUnitLaunchSilo = 1172,
C_McwUnitProduceUnit = 1173,
S_McwUnitProduceUnit = 1174,
C_McwUnitSupply = 1175,
S_McwUnitSupply = 1176,
C_McwUnitLoadCo = 1177,
S_McwUnitLoadCo = 1178,
C_McwUnitUseCoSkill = 1179,
S_McwUnitUseCoSkill = 1180,
}}
