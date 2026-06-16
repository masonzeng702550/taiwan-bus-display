import { DEFAULT_SETTINGS, type RouteFile } from "../types";
import { themeById } from "./themes";

// A short demo route so the editor and player have something to show on first
// load. Loosely modelled on a Taipei cross-town service.
export const SAMPLE_ROUTE: RouteFile = {
  schemaVersion: 1,
  operator: {
    id: "tpe-union",
    name: { zh: "台北聯營公車", en: "Taipei Joint Bus", ja: "台北連営バス" },
    themeId: "tpe-union",
  },
  theme: themeById("tpe-union"),
  route: {
    id: "307",
    number: "307",
    name: { zh: "307 路", en: "Route 307", ja: "307系統" },
    direction: "outbound",
    destination: { zh: "撫遠街", en: "Fuyuan St.", ja: "撫遠街" },
  },
  settings: { ...DEFAULT_SETTINGS },
  stops: [
    {
      seq: 1,
      name: { zh: "板橋", en: "Banqiao", ja: "板橋", jaReading: "バンチャオ" },
      fare: { adult: 15, child: 8 },
      transfers: [
        { type: "metro", operator: { zh: "台北捷運", en: "Taipei Metro", ja: "台北メトロ" }, station: { zh: "板橋站", en: "Banqiao Sta.", ja: "板橋駅" } },
        { type: "tra", operator: { zh: "台灣鐵路", en: "Taiwan Railway", ja: "台湾鉄路" }, station: { zh: "板橋站", en: "Banqiao Sta.", ja: "板橋駅" } },
      ],
      gps: { lat: 25.0143, lng: 121.4636, radius: 60 },
    },
    {
      seq: 2,
      name: { zh: "西門", en: "Ximen", ja: "西門", jaReading: "シーメン" },
      fare: { adult: 15, child: 8 },
      transfers: [{ type: "metro", operator: { zh: "台北捷運", en: "Taipei Metro", ja: "台北メトロ" }, station: { zh: "西門站", en: "Ximen Sta.", ja: "西門駅" } }],
      gps: { lat: 25.0421, lng: 121.508, radius: 60 },
    },
    {
      seq: 3,
      name: { zh: "台北車站", en: "Taipei Main Station", ja: "台北駅", jaReading: "タイペイえき" },
      fare: { adult: 15, child: 8 },
      transfers: [
        { type: "metro", operator: { zh: "台北捷運", en: "Taipei Metro", ja: "台北メトロ" }, station: { zh: "台北車站", en: "Taipei Main Sta.", ja: "台北駅" } },
        { type: "thsr", operator: { zh: "台灣高鐵", en: "Taiwan High Speed Rail", ja: "台湾高速鉄道" }, station: { zh: "台北站", en: "Taipei Sta.", ja: "台北駅" } },
      ],
      gps: { lat: 25.0478, lng: 121.517, radius: 60 },
    },
    {
      seq: 4,
      name: { zh: "行天宮", en: "Xingtian Temple", ja: "行天宮", jaReading: "シンティエンゴン" },
      fare: { adult: 15, child: 8 },
      transfers: [{ type: "metro", operator: { zh: "台北捷運", en: "Taipei Metro", ja: "台北メトロ" }, station: { zh: "行天宮站", en: "Xingtian Temple Sta.", ja: "行天宮駅" } }],
      gps: { lat: 25.0626, lng: 121.5337, radius: 60 },
    },
    {
      seq: 5,
      name: { zh: "撫遠街", en: "Fuyuan Street", ja: "撫遠街", jaReading: "フーユエンがい" },
      isTerminal: true,
      fare: { adult: 15, child: 8 },
      gps: { lat: 25.0606, lng: 121.5611, radius: 60 },
    },
  ],
};
