import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the North Xinjiang roadbook", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /北疆在路上 · 乌鲁木齐到伊宁自驾助手/);
  assert.match(html, /2026 · 北疆单程自驾/);
  assert.match(html, /乌鲁木齐 → 伊宁/);
  assert.match(html, /在高德打开下一站/);
  assert.match(html, /0<!-- -->\/<!-- -->37/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Codex is working/i);
});

test("keeps Yuhu optional and records the single Duku reservation", async () => {
  const [page, tripData, css, manifest, staticEntry, staticConfig] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/trip-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../static-site/main.tsx", import.meta.url), "utf8"),
    readFile(new URL("../vite.static.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /optional\?: boolean/);
  assert.match(tripData, /id: "yuhu"[\s\S]*optional: true/);
  assert.match(page, /filter\(\(stop\) => !stop\.optional\)/);
  assert.match(page, /备选，不计进度/);
  assert.match(page, /独库预约：8月1日乌苏驿入口/);
  assert.match(page, /独库北段预约 ×1/);
  assert.match(page, /出发前先把这些搞定/);
  assert.match(page, /先处理这几件事/);
  assert.match(page, /8月1日乌苏驿入口08:00–10:00/);
  assert.match(page, /独库公路预约制通行管理平台/);
  assert.match(page, /不要买阔克苏全套/);
  assert.match(page, /城际报备车牌/);
  assert.match(page, /智游昭苏/);
  assert.match(page, /ticket-warning/);
  assert.match(page, /reservationTimeline/);
  assert.match(page, /dayReadiness/);
  assert.match(page, /今天先确认这5件事/);
  assert.match(page, /最晚出发/);
  assert.match(page, /删点规则/);
  assert.match(page, /止损线/);
  assert.match(page, /两人预算总览/);
  assert.match(page, /加油、停车和路餐/);
  assert.match(page, /roadSupport/);
  assert.match(page, /costGroups/);
  assert.doesNotMatch(page, /HOW TO READ|工具页提醒|行程页执行|写进行程页|放在工具页|怎么分类|TRIP KIT|TIMELINE|BEFORE GO|LOCAL DATA|PLAN B/);
  assert.doesNotMatch(page, /legacyDays|legacyHotelGroups|智游那拉提|独库北段预约 ×2|乔尔玛入口12:00|那拉提空中草原/);
  assert.doesNotMatch(tripData, /name: "(?:那拉提|库尔德宁)/);
  assert.match(css, /\.optional-badge/);
  assert.match(css, /\.timeline-row\.is-optional/);
  assert.match(css, /\.reservation-row/);
  assert.match(css, /\.readiness-grid/);
  assert.match(css, /\.cost-card/);
  assert.match(css, /\.support-row/);

  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.start_url, "./");
  assert.equal(parsedManifest.scope, "./");
  assert.match(staticEntry, /createRoot/);
  assert.match(staticConfig, /\/beijiang-roadbook-2026\//);
});

test("uses exact Ctrip hotel links and clearly labels the refreshed hotel shortlist", async () => {
  const [page, tripData, cache, css, serviceWorker] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/trip-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/hotel-price-cache.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
  ]);

  assert.match(page, /hotels\.ctrip\.com\/hotels\/\$\{hotel\.ctripHotelId\}\.html/);
  assert.match(page, /checkIn: group\.checkIn/);
  assert.match(page, /checkOut: group\.checkOut/);
  assert.match(page, /adult: "2"/);
  assert.match(page, /携程打开对应日期/);
  assert.match(page, /暂无参考价/);
  assert.match(page, /携程列表参考价/);
  assert.match(page, /打开后以实时价为准/);
  assert.doesNotMatch(page, /核验/);
  assert.doesNotMatch(cache, /核验/);
  assert.match(page, /只看华住会/);
  assert.match(page, /confirmed\?: boolean/);
  assert.match(page, /dateWarning\?: string/);
  assert.match(page, /confirmed-badge/);
  assert.match(page, /hotel-alert/);
  assert.match(page, /hotelPriceKey\(h\.ctripHotelId, group\.checkIn\)/);
  assert.match(page, /fetchWeatherWithTimeout/);
  assert.match(page, /Promise\.allSettled/);
  assert.match(page, /天气接口暂时不可用/);
  assert.match(tripData, /麗枫酒店（乌鲁木齐国际商贸城和田二街店）/);
  assert.match(tripData, /乌鲁木齐机场宾馆/);
  assert.match(tripData, /奎屯华悦酒店/);
  assert.match(tripData, /134644558/);
  assert.match(tripData, /奎屯出发务必别晚于06:00/);
  assert.match(tripData, /全季酒店（独山子东湖公园店）/);
  assert.match(tripData, /巩留温度湾S酒店/);
  assert.match(tripData, /confirmed: true/);
  assert.match(tripData, /你好酒店（昭苏天马湖公园店）/);
  assert.match(tripData, /2026-08-02入住/);
  assert.match(tripData, /若只订一晚，请补订\/改成2026-08-04退房/);
  assert.match(tripData, /今晚不住八卦城/);
  assert.match(tripData, /zhaosustay0802/);
  assert.doesNotMatch(tripData, /特克斯新悦酒店/);
  assert.match(tripData, /天悦国际酒店（昭苏人民政府天马美食街店）/);
  assert.match(tripData, /霍尔果斯国门/);
  assert.match(tripData, /你好酒店（霍尔果斯国门店）/);
  assert.match(tripData, /130978699/);
  assert.match(tripData, /比桔子便宜约150元/);
  assert.match(tripData, /桔子酒店（霍尔果斯国门景区店）/);
  assert.match(tripData, /赛里木湖城际已确定/);
  assert.match(tripData, /不再考虑清水河住宿/);
  assert.match(tripData, /赛湖景区内入住/);
  assert.match(tripData, /城际出发 · 赛湖晨光补拍/);
  assert.match(tripData, /观疆也民宿（赛里木湖东门游客中心店）/);
  assert.match(tripData, /赛里木湖城际酒店/);
  assert.match(tripData, /丽呈花盛酒店（霍城清水河店）/);
  assert.equal((tripData.match(/huazhu: true/g) ?? []).length, 8);
  assert.equal((tripData.match(/confirmed: true/g) ?? []).length, 5);
  assert.equal((tripData.match(/tip: "共8家/g) ?? []).length, 4);
  assert.equal((tripData.match(/tip: "共9家/g) ?? []).length, 1);
  assert.equal((tripData.match(/tip: "共12家/g) ?? []).length, 1);
  assert.match(tripData, /name: "汉庭[\s\S]{0,180}level: "备选"/);
  assert.match(cache, /"56112221\|2026-07-30"[\s\S]*amount: 294/);
  assert.match(cache, /"123022820\|2026-07-31"[\s\S]*amount: 238/);
  assert.match(cache, /"120456260\|2026-08-01"[\s\S]*amount: 301/);
  assert.match(cache, /"133572067\|2026-08-03"[\s\S]*amount: 428/);
  assert.match(cache, /"130978699\|2026-08-04"[\s\S]*amount: 279/);
  assert.match(cache, /"130851270\|2026-08-04"[\s\S]*amount: 435/);
  assert.match(cache, /"109844452\|2026-08-04"[\s\S]*amount: 400/);
  assert.match(cache, /"109870366\|2026-08-05"[\s\S]*amount: 287/);
  assert.match(cache, /"121134061\|2026-07-31"[\s\S]*amount: 522/);
  assert.match(cache, /"130201459\|2026-08-03"[\s\S]*amount: 393/);
  assert.match(css, /\.price-snapshot/);
  assert.match(css, /\.huazhu-badge/);
  assert.match(css, /\.confirmed-badge/);
  assert.match(css, /\.hotel-alert/);
  assert.match(css, /\.hotel-facts/);
  assert.match(css, /\.stay-summary/);
  assert.match(serviceWorker, /xinjiang-trip-v5/);
  assert.match(serviceWorker, /origin !== self\.location\.origin/);
});
