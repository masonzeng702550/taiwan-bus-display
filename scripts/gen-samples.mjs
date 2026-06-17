// Generates sample route JSON files under src/data/samples/ from stop lists
// sourced from official Taiwan bus data (pda5284.gov.taipei / ebus / taiwanhelper).
// Chinese names are authoritative; Japanese is the kanji passthrough (refine in
// the editor); English is included where the source provided it.
//
// Run:  node scripts/gen-samples.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "samples");

const THEMES = {
  "tpe-union": { id: "tpe-union", name: "台北聯營 / 大都會客運", primary: "#9b30ff", headerGradient: ["#7b1fa2", "#b14aff"], accent: "#ff8c00", textColor: "#ffffff", bgColor: "#000000", dividerColor: "#9b30ff" },
  kingbus: { id: "kingbus", name: "桃園 / 國光客運（長途）", primary: "#c8102e", headerGradient: ["#9e0b22", "#e2243d"], accent: "#ffd200", textColor: "#ffffff", bgColor: "#000000", dividerColor: "#c8102e" },
  teal: { id: "teal", name: "通用 · 青綠", primary: "#008c8c", headerGradient: ["#00696e", "#00b3a6"], accent: "#ffd200", textColor: "#ffffff", bgColor: "#000000", dividerColor: "#008c8c" },
};

const OPERATORS = {
  tpebus: { id: "tpe-union", name: { zh: "臺北客運", en: "Taipei Bus", ja: "台北客運" }, theme: "tpe-union" },
  sanchong: { id: "tpe-union", name: { zh: "三重客運", en: "Sanchong Bus", ja: "三重客運" }, theme: "tpe-union" },
  dayou: { id: "teal", name: { zh: "大有巴士", en: "Da-You Bus", ja: "大有バス" }, theme: "teal" },
  kuokuang: { id: "kingbus", name: "kk", theme: "kingbus" },
};
OPERATORS.kuokuang.name = { zh: "國光客運", en: "Kuo-Kuang Bus", ja: "国光客運" };

// Build a stop. Auto-adds an MRT transfer when the stop is a 捷運 station.
function makeStop(seq, zh, en) {
  const stop = { seq, name: { zh, en: en || "", ja: zh }, fare: { adult: 15, child: 8 } };
  if (zh.includes("捷運") && zh.includes("站")) {
    const station = zh.replace("捷運", "").replace(/\(.*\)/, "").trim();
    stop.transfers = [
      { type: "metro", operator: { zh: "台北捷運", en: "Taipei Metro", ja: "台北メトロ" }, station: { zh: station, en: "", ja: station } },
    ];
  }
  return stop;
}

function buildRoute({ number, routeName, operatorKey, direction, stopsZh, stopsEn, showFare = true, city = "新北市" }) {
  const op = OPERATORS[operatorKey];
  const stops = stopsZh.map((zh, i) => makeStop(i + 1, zh, stopsEn ? stopsEn[i] : ""));
  stops[stops.length - 1].isTerminal = true;
  const destZh = stopsZh[stopsZh.length - 1];
  const destEn = stopsEn ? stopsEn[stopsEn.length - 1] : "";
  return {
    schemaVersion: 1,
    region: { country: "台灣", city },
    locale: "zh",
    operator: { id: op.id, name: op.name, themeId: op.theme },
    theme: THEMES[op.theme],
    route: {
      id: number,
      number,
      name: routeName,
      direction,
      destination: { zh: destZh, en: destEn || "", ja: destZh },
    },
    settings: {
      cycleSeconds: { nextStop: 6, stopList: 6, transfer: 6 },
      languages: ["zh", "en", "ja"],
      ttsRate: 1,
      showFare,
      stopListCount: 4,
      voices: { zh: "美佳", en: "Samantha", ja: "O-Ren" },
    },
    stops,
  };
}

// ---- Stop data (Chinese authoritative; English where sources provided it) ----

const R245_OUT = ["四海站","少年觀護所","清化里","宏國德霖科技大學","清和里","檳榔科","清水派出所","清水","臺灣新北地方法院(青雲)","土城看守所","看守所","四汴頭","益華紡織","信義路","板橋後站","重慶國小","五權街口","壽德新村","重慶國中","重慶忠孝路口","忠孝路","中興醫院","福星里","鄉雲里","後站商圈","介壽公園","民權路口","新北市政府(新府路)","新北板橋公車站","板橋車站(文化路)","中山國中","致理科技大學","捷運新埔站(文化路)","新北市議會","江翠國中","捷運江子翠站","華江橋","中國時報","捷運龍山寺站","龍山國中","小南門","捷運西門站","寶慶路","博愛路","重慶南路一段","博物館(襄陽)","捷運台大醫院站"];
const R245_IN = ["一女中(貴陽)","東吳大學城中校區","小南門","龍山國中","捷運龍山寺站","中國時報","華江橋","江翠國小(文化路)","捷運江子翠站","江翠國中","捷運新埔站(文化路)","致理科技大學","中山國中","新民里","新北板橋公車站","新北市政府(新府路)","民權路口","板橋外站","後站商圈","鄉雲里","福星里","中興醫院","忠孝路","重慶忠孝路口","重慶國中","五權街口","重慶國小","板橋後站","益華紡織","四汴頭","看守所","土城看守所","臺灣新北地方法院(青雲)","清水","清水派出所","檳榔科","清和里","宏國德霖科技大學","清化里","少年觀護所","四海站"];

const R667_OUT = ["干城路口","廣福公園","五權公園","壽德街口","華安街口","自強國小","國光派出所","莒光路","德光路口","德光路","民德路","福德里","後埔國小","實踐成都街口","介壽公園","民權路口","新北市政府(新府路)","新北板橋公車站","中山國中(縣民大道)","華翠大橋","太和街口","雙玉里","海山天下社區","雙十路口","雙園街口","時報大樓","萬華車站","艋舺大道","聯合醫院和平院區","捷運西門站","中華路北站","臺北車站(重慶)","臺北郵局(撫臺街洋樓)"];
const R667_IN = ["中華路北站","捷運西門站","小南門","聯合醫院和平院區","艋舺大道","萬華車站","時報大樓","雙園街口","雙十路口","富山街口","埤墘里","華翠大橋","中山國中(縣民大道)","新北板橋公車站","新北市政府(新府路)","民權路口","板橋外站","後站商圈","介壽公園(館前東路)","實踐成都街口","後埔國小","福德里","民德路","德光路","德光路口","莒光路","國光派出所","自強國小","華安街口","壽德街口","五權公園","廣福公園","干城路口","板橋後站"];

const R265_OUT = ["壽德新村","重慶忠孝路口","中興醫院","鄉雲里","後站商圈","民族區運路口","電信訓練所","國泰街口","瑞穗里","海山高中","漢生路","中山漢生路口","西安里","中山民生路口","埔墘國小","埔墘(中山路)","埔墘派出所","光復橋","西園路二段","華江高中(西園)","西園29服飾基地","大理服飾","捷運龍山寺站","龍山國中","小南門","捷運西門站","中華路北站","臺北車站(忠孝)","捷運善導寺站","成功中學(林森)","立法院"];
const R265_IN = ["臺北車站(忠孝)","中華路北站","捷運西門站","小南門","桂林昆明街口","桂林路","龍山寺(西園)","大理服飾","西園29服飾基地","華江高中(西園)","西園路二段","光復橋","埔墘派出所","埔墘(中山路)","埔墘國小","中山民生路口","西安里","中山漢生路口","漢生路","海山高中","海山國小","瑞穗里","國泰街口","電信訓練所","民族區運路口","板橋外站","後站商圈","鄉雲里","福星里","中興醫院","忠孝路","重慶忠孝路口","重慶國中(國慶路)"];

const R1962_OUT_ZH = ["板橋客運站","板橋外站","鄉雲里","仁愛新村","亞東科技大學","貨饒里","日新里","大同莊園","員林里","土城農會","捷運永寧站","桃園機場第二航廈","桃園機場第一航廈"];
const R1962_OUT_EN = ["Banqiao Bus Station","Banqiao Outer Station","Xiangyun Village","Ren'ai New Village","Asia Eastern Univ. of Sci. and Tech.","Huorao Village","Rixing Village","Datong Manor","Yuanlin Village","Tucheng Farmers' Association","MRT Yongning Station","Taoyuan Airport Terminal 2","Taoyuan Airport Terminal 1"];
const R1962_IN_ZH = ["桃園機場第一航廈","桃園機場第二航廈","捷運永寧站","土城農會","員林里","大同莊園","日新里","貨饒里","亞東科技大學","仁愛新村","鄉雲里","民權路口","板橋客運站"];
const R1962_IN_EN = ["Taoyuan Airport Terminal 1","Taoyuan Airport Terminal 2","MRT Yongning Station","Tucheng Farmers' Association","Yuanlin Village","Datong Manor","Rixing Village","Huorao Village","Asia Eastern Univ. of Sci. and Tech.","Ren'ai New Village","Xiangyun Village","Minquan Road Intersection","Banqiao Bus Station"];

const R1813_OUT_ZH = ["臺北車站(東三門)","基隆轉運站"];
const R1813_OUT_EN = ["Taipei Station (East Gate)","Keelung Transit Station"];
const R1813_IN_ZH = ["基隆轉運站","臺北科技大學(忠孝)","華山文創園區","臺北車站(東三門)"];
const R1813_IN_EN = ["Keelung Transit Station","National Taipei Univ. of Technology","Huashan 1914 Creative Park","Taipei Station (East Gate)"];

const routes = [
  buildRoute({ number: "245", routeName: { zh: "245 路", en: "Route 245", ja: "245系統" }, operatorKey: "tpebus", direction: "outbound", stopsZh: R245_OUT }),
  buildRoute({ number: "245", routeName: { zh: "245 路", en: "Route 245", ja: "245系統" }, operatorKey: "tpebus", direction: "inbound", stopsZh: R245_IN }),
  buildRoute({ number: "667", routeName: { zh: "667 路", en: "Route 667", ja: "667系統" }, operatorKey: "tpebus", direction: "outbound", stopsZh: R667_OUT }),
  buildRoute({ number: "667", routeName: { zh: "667 路", en: "Route 667", ja: "667系統" }, operatorKey: "tpebus", direction: "inbound", stopsZh: R667_IN }),
  buildRoute({ number: "265區", routeName: { zh: "265 區間車", en: "Route 265 (Zone)", ja: "265系統 区間" }, operatorKey: "sanchong", direction: "outbound", stopsZh: R265_OUT }),
  buildRoute({ number: "265區", routeName: { zh: "265 區間車", en: "Route 265 (Zone)", ja: "265系統 区間" }, operatorKey: "sanchong", direction: "inbound", stopsZh: R265_IN }),
  buildRoute({ number: "1962", routeName: { zh: "1962", en: "Route 1962", ja: "1962系統" }, operatorKey: "dayou", direction: "outbound", stopsZh: R1962_OUT_ZH, stopsEn: R1962_OUT_EN, showFare: false }),
  buildRoute({ number: "1962", routeName: { zh: "1962", en: "Route 1962", ja: "1962系統" }, operatorKey: "dayou", direction: "inbound", stopsZh: R1962_IN_ZH, stopsEn: R1962_IN_EN, showFare: false }),
  buildRoute({ number: "1813", routeName: { zh: "1813", en: "Route 1813", ja: "1813系統" }, operatorKey: "kuokuang", direction: "outbound", stopsZh: R1813_OUT_ZH, stopsEn: R1813_OUT_EN, showFare: false, city: "台北市" }),
  buildRoute({ number: "1813", routeName: { zh: "1813", en: "Route 1813", ja: "1813系統" }, operatorKey: "kuokuang", direction: "inbound", stopsZh: R1813_IN_ZH, stopsEn: R1813_IN_EN, showFare: false, city: "台北市" }),
];

for (const r of routes) {
  const fname = `route-${r.route.number.replace(/[^0-9A-Za-z]/g, "")}-${r.route.direction}.json`;
  writeFileSync(join(outDir, fname), JSON.stringify(r, null, 2) + "\n");
  console.log("wrote", fname, `(${r.stops.length} stops)`);
}
