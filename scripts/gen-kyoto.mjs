// Generates Kyoto City Bus sample routes (205, 206) into src/data/samples/.
// Stop data (kanji / kana / romaji) sourced from NAVITIME, Kyoto City Transport
// Bureau and kankou.kotomeguri. locale = "ja": Japanese name is primary, the
// hiragana reading goes on the right, English at the bottom.
//
// Run:  node scripts/gen-kyoto.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "samples");

const TEAL = { id: "teal", name: "通用 · 青綠", primary: "#008c8c", headerGradient: ["#00696e", "#00b3a6"], accent: "#ffd200", textColor: "#ffffff", bgColor: "#000000", dividerColor: "#008c8c" };

function makeStop(seq, [ja, kana, en]) {
  const stop = { seq, name: { zh: ja, en, ja, jaReading: kana }, fare: { adult: 230, child: 120 } };
  if (ja.includes("京阪")) stop.transfers = [{ type: "tra", operator: { zh: "京阪電車", en: "Keihan Railway", ja: "京阪電車" } }];
  else if (ja.includes("地下鉄")) stop.transfers = [{ type: "metro", operator: { zh: "京都市營地下鐵", en: "Kyoto Subway", ja: "京都市営地下鉄" } }];
  else if (ja.includes("ＪＲ") || ja.includes("JR")) stop.transfers = [{ type: "tra", operator: { zh: "JR西日本", en: "JR West", ja: "ＪＲ西日本" } }];
  return stop;
}

function buildJp(number, direction, triples) {
  const stops = triples.map((t, i) => makeStop(i + 1, t));
  stops[stops.length - 1].isTerminal = true;
  const dest = triples[triples.length - 1];
  return {
    schemaVersion: 1,
    region: { country: "日本", city: "京都市" },
    locale: "ja",
    operator: { id: "teal", name: { zh: "京都市公車", en: "Kyoto City Bus", ja: "京都市営バス" }, themeId: "teal" },
    theme: TEAL,
    route: {
      id: number,
      number,
      name: { zh: `${number}系統`, en: `Route ${number}`, ja: `${number}系統` },
      direction,
      destination: { zh: dest[0], en: dest[2], ja: dest[0], jaReading: dest[1] },
    },
    settings: {
      cycleSeconds: { nextStop: 6, stopList: 6, transfer: 6 },
      languages: ["ja", "en", "zh"],
      ttsRate: 1,
      showFare: true,
      stopListCount: 4,
      voices: { zh: "美佳", en: "Samantha", ja: "O-Ren" },
      chime: "dingdong",
    },
    stops,
  };
}

const R205_D1 = [
  ["九条車庫前","くじょうしゃこまえ","Kujo Shako-mae"],["東寺道","とうじみち","Toji-michi"],["下京区総合庁舎前","しもぎょうくそうごうちょうしゃまえ","Shimogyo-ku Sogo Chosha-mae"],["京都駅前","きょうとえきまえ","Kyoto Eki-mae"],["烏丸七条","からすまななじょう","Karasuma Shichijo"],["七条西洞院","しちじょうにしのとういん","Shichijo Nishinotoin"],["七条堀川","しちじょうほりかわ","Shichijo Horikawa"],["七条大宮・京都水族館前","しちじょうおおみや・きょうとすいぞくかんまえ","Shichijo Omiya / Kyoto Aquarium"],["七条壬生川","しちじょうみぶがわ","Shichijo Mibugawa"],["梅小路公園・ＪＲ梅小路京都西駅前","うめこうじこうえん・じぇいあーるうめこうじきょうとにしえきまえ","Umekoji Park / JR Umekoji-Kyotonishi Sta."],["七条千本","しちじょうせんぼん","Shichijo Senbon"],["七条御前通","しちじょうおんまえどおり","Shichijo Onmae-dori"],["西大路七条","にしおおじななじょう","Nishioji Shichijo"],["西大路花屋町","にしおおじはなやちょう","Nishioji Hanayacho"],["西大路五条","にしおおじごじょう","Nishioji Gojo"],["西大路松原","にしおおじまつばら","Nishioji Matsubara"],["西大路四条［阪急・嵐電西院駅］","にしおおじしじょう","Nishioji Shijo (Hankyu/Randen Saiin Sta.)"],["西大路三条","にしおおじさんじょう","Nishioji Sanjo"],["西大路御池","にしおおじおいけ","Nishioji Oike"],["太子道","たいしみち","Taishimichi"],["西ノ京円町［ＪＲ円町駅］","にしのきょうえんまち","Nishinokyo Enmachi (JR Enmachi Sta.)"],["北野中学前","きたのちゅうがくまえ","Kitano Chugaku-mae"],["大将軍","たいしょうぐん","Taishogun"],["北野白梅町","きたのはくばいちょう","Kitano Hakubaicho"],["衣笠校前","きぬがさこうまえ","Kinugasa-ko-mae"],["わら天神前","わらてんじんまえ","Waratenjin-mae"],["金閣寺道","きんかくじみち","Kinkakuji-michi"],["千本北大路","せんぼんきたおおじ","Senbon Kitaoji"],["船岡山","ふなおかやま","Funaokayama"],["建勲神社前","けんくんじんじゃまえ","Kenkun Jinja-mae"],["大徳寺前","だいとくじまえ","Daitokuji-mae"],["北大路堀川","きたおおじほりかわ","Kitaoji Horikawa"],["北大路新町","きたおおじしんまち","Kitaoji Shinmachi"],["北大路バスターミナル［地下鉄北大路駅］","きたおおじバスターミナル","Kitaoji Bus Terminal (Subway Kitaoji Sta.)"],["烏丸北大路〔北大路駅前〕","からすまきたおおじ","Karasuma Kitaoji"],
];
const R205_D2 = [
  ["九条車庫前","くじょうしゃこまえ","Kujo Shako-mae"],["東寺道","とうじみち","Toji-michi"],["下京区総合庁舎前","しもぎょうくそうごうちょうしゃまえ","Shimogyo-ku Sogo Chosha-mae"],["京都駅前","きょうとえきまえ","Kyoto Eki-mae"],["塩小路高倉・京都市立芸術大学前","しおこうじたかくら・きょうとしりつげいじゅつだいがくまえ","Shiokoji Takakura / Kyoto City Univ. of Arts"],["七条河原町","しちじょうかわらまち","Shichijo Kawaramachi"],["河原町正面","かわらまちしょうめん","Kawaramachi Shomen"],["河原町五条","かわらまちごじょう","Kawaramachi Gojo"],["河原町松原","かわらまちまつばら","Kawaramachi Matsubara"],["四条河原町","しじょうかわらまち","Shijo Kawaramachi"],["河原町三条","かわらまちさんじょう","Kawaramachi Sanjo"],["京都市役所前","きょうとしやくしょまえ","Kyoto Shiyakusho-mae"],["河原町丸太町","かわらまちまるたまち","Kawaramachi Marutamachi"],["荒神口","こうじんぐち","Kojinguchi"],["府立医大病院前","ふりついだいびょういんまえ","Furitsu Idai Byoin-mae"],["河原町今出川","かわらまちいまでがわ","Kawaramachi Imadegawa"],["葵橋西詰","あおいばしにしづめ","Aoibashi Nishizume"],["新葵橋","しんあおいばし","Shin-Aoibashi"],["糺ノ森","ただすのもり","Tadasu-no-mori"],["下鴨神社前","しもがもじんじゃまえ","Shimogamo Jinja-mae"],["一本松","いっぽんまつ","Ipponmatsu"],["洛北高校前","らくほくこうこうまえ","Rakuhoku Koko-mae"],["府立大学前","ふりつだいがくまえ","Furitsu Daigaku-mae"],["植物園前","しょくぶつえんまえ","Shokubutsuen-mae"],["烏丸北大路〔北大路駅前〕","からすまきたおおじ","Karasuma Kitaoji"],["北大路バスターミナル［地下鉄北大路駅］","きたおおじバスターミナル","Kitaoji Bus Terminal (Subway Kitaoji Sta.)"],
];

const R206_D1 = [
  ["北大路バスターミナル（地下鉄北大路駅）","きたおおじバスターミナル","Kitaoji Bus Terminal (Subway Kitaoji Sta.)"],["北大路新町","きたおおじしんまち","Kitaoji Shinmachi"],["北大路堀川","きたおおじほりかわ","Kitaoji Horikawa"],["大徳寺前","だいとくじまえ","Daitokuji-mae"],["建勲神社前","けんくんじんじゃまえ","Kenkun-jinja-mae"],["船岡山","ふなおかやま","Funaokayama"],["千本北大路","せんぼんきたおおじ","Senbon Kitaoji"],["ライトハウス前","ライトハウスまえ","Lighthouse-mae"],["千本鞍馬口","せんぼんくらまぐち","Senbon Kuramaguchi"],["乾隆校前","けんりゅうこうまえ","Kenryuko-mae"],["千本上立売","せんぼんかみだちうり","Senbon Kamidachiuri"],["千本今出川","せんぼんいまでがわ","Senbon Imadegawa"],["千本中立売","せんぼんなかだちうり","Senbon Nakadachiuri"],["千本出水","せんぼんでみず","Senbon Demizu"],["千本丸太町","せんぼんまるたまち","Senbon Marutamachi"],["千本旧二条","せんぼんきゅうにじょう","Senbon Kyu-Nijo"],["二条駅前","にじょうえきまえ","Nijo-eki-mae"],["千本三条・朱雀立命館前","せんぼんさんじょう・すざくりつめいかんまえ","Senbon Sanjo / Suzaku Ritsumeikan-mae"],["みぶ操車場前","みぶそうしゃじょうまえ","Mibu Soshajo-mae"],["四条大宮","しじょうおおみや","Shijo Omiya"],["大宮松原","おおみやまつばら","Omiya Matsubara"],["大宮五条","おおみやごじょう","Omiya Gojo"],["島原口","しまばらぐち","Shimabaraguchi"],["七条大宮・京都水族館前","しちじょうおおみや・きょうとすいぞくかんまえ","Shichijo Omiya / Kyoto Aquarium-mae"],["七条堀川","しちじょうほりかわ","Shichijo Horikawa"],["下京区総合庁舎前","しもぎょうくそうごうちょうしゃまえ","Shimogyo-ku Sogo Chosha-mae"],["京都駅前","きょうとえきまえ","Kyoto Station"],["烏丸七条","からすましちじょう","Karasuma Shichijo"],["七条河原町","しちじょうかわらまち","Shichijo Kawaramachi"],["七条京阪前","しちじょうけいはんまえ","Shichijo Keihan-mae"],["博物館三十三間堂前","はくぶつかんさんじゅうさんげんどうまえ","Hakubutsukan Sanjusangendo-mae"],["東山七条","ひがしやましちじょう","Higashiyama Shichijo"],["馬町","うままち","Umamachi"],["五条坂","ごじょうざか","Gojozaka"],["清水道","きよみずみち","Kiyomizu-michi"],["東山安井","ひがしやまやすい","Higashiyama Yasui"],["祇園","ぎおん","Gion"],["知恩院前","ちおんいんまえ","Chion-in-mae"],["東山三条（地下鉄東山駅）","ひがしやまさんじょう","Higashiyama Sanjo (Subway Higashiyama Sta.)"],["東山仁王門","ひがしやまにおうもん","Higashiyama Niomon"],["東山二条・岡崎公園口","ひがしやまにじょう・おかざきこうえんぐち","Higashiyama Nijo / Okazaki Koen-guchi"],["熊野神社前","くまのじんじゃまえ","Kumano-jinja-mae"],["京大病院前","きょうだいびょういんまえ","Kyodai Byoin-mae"],["近衛通","このえどおり","Konoe-dori"],["京大正門前","きょうだいせいもんまえ","Kyodai Seimon-mae"],["百万遍","ひゃくまんべん","Hyakumanben"],["飛鳥井町","あすかいちょう","Asukai-cho"],["叡電元田中","えいでんもとたなか","Eiden Mototanaka"],["田中大久保町","たなかおおくぼちょう","Tanaka Okubo-cho"],["高野","たかの","Takano"],["高野橋東詰","たかのばしひがしづめ","Takanobashi Higashizume"],["高木町","たかぎちょう","Takagi-cho"],["下鴨東本町","しもがもひがしほんまち","Shimogamo Higashi-Honmachi"],["洛北高校前","らくほくこうこうまえ","Rakuhoku Koko-mae"],["府立大学前","ふりつだいがくまえ","Furitsu Daigaku-mae"],["植物園前","しょくぶつえんまえ","Shokubutsuen-mae"],["烏丸北大路","からすまきたおおじ","Karasuma Kitaoji"],["北大路バスターミナル（地下鉄北大路駅）","きたおおじバスターミナル","Kitaoji Bus Terminal (Subway Kitaoji Sta.)"],
];
// 206 is a loop; the opposite direction is the same stops in reverse order.
const R206_D2 = [...R206_D1].reverse();

const routes = [
  buildJp("205", "outbound", R205_D1),
  buildJp("205", "inbound", R205_D2),
  buildJp("206", "outbound", R206_D1),
  buildJp("206", "inbound", R206_D2),
];

for (const r of routes) {
  const fname = `route-${r.route.number}-${r.route.direction}.json`;
  writeFileSync(join(outDir, fname), JSON.stringify(r, null, 2) + "\n");
  console.log("wrote", fname, `(${r.stops.length} stops)`);
}
