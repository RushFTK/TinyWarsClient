
namespace TinyWars.WarMap {
    import Types        = Utility.Types;
    import Helpers      = Utility.Helpers;
    import ProtoTypes   = Utility.ProtoTypes;
    import LocalStorage = Utility.LocalStorage;

    export namespace WarMapModel {
        const _allMapInfos = new Map<string, ProtoTypes.IMapDynamicInfo>();
        const _allMapDatas = new Map<string, Types.TemplateMap>();

        let _newestMapInfos: ProtoTypes.IS_GetNewestMapDynamicInfos;

        export function init(): void {
        }

        export function getMapData(key: Types.MapIndexKey): Promise<Types.TemplateMap | undefined> {
            const mapUrl    = Helpers.getMapUrl(key);
            const localData = getLocalMapData(mapUrl);
            if (localData) {
                return new Promise<Types.TemplateMap>((resolve, reject) => resolve(localData));
            } else {
                return new Promise<Types.TemplateMap | undefined>((resolve, reject) => {
                    RES.getResByUrl(
                        mapUrl,
                        (data: Types.TemplateMap, reqUrl: string) => {
                            if (reqUrl === mapUrl) {
                                if (!data) {
                                    reject(data);
                                } else {
                                    LocalStorage.setMapData(mapUrl, JSON.stringify(data));
                                    _allMapDatas.set(mapUrl, data);
                                    resolve(data);
                                }
                            }
                        },
                        undefined,
                        RES.ResourceItem.TYPE_JSON
                    );
                });
            }
        }

        export function setNewestMapInfos(infos: ProtoTypes.IS_GetNewestMapDynamicInfos): void {
            _newestMapInfos = infos;
            addMapInfos(infos.mapInfos);
        }
        export function getNewestMapInfos(): ProtoTypes.IS_GetNewestMapDynamicInfos {
            return _newestMapInfos;
        }

        export function addMapInfos(infos: ProtoTypes.IMapDynamicInfo[]): void {
            if (infos) {
                for (const info of infos) {
                    _allMapInfos.set(Helpers.getMapUrl(info as Types.MapIndexKey), info);
                }
            }
        }
        export function getMapInfo(keys: Types.MapIndexKey): ProtoTypes.IMapDynamicInfo | undefined {
            return _allMapInfos.get(Helpers.getMapUrl(keys));
        }

        function getLocalMapData(mapUrl: string): Types.TemplateMap | undefined {
            if (!_allMapDatas.has(mapUrl)) {
                const data = LocalStorage.getMapData(mapUrl);
                (data) && (_allMapDatas.set(mapUrl, JSON.parse(data)));
            }
            return _allMapDatas.get(mapUrl);
        }
    }
}
