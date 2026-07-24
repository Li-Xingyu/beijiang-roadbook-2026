"use client";

import { useEffect, useMemo, useState } from "react";
import { hotelPriceCache, hotelPriceKey } from "./hotel-price-cache";
import { latestDays, latestHotelGroups } from "./trip-data";

type Stop = {
  id: string;
  time: string;
  name: string;
  place?: string;
  optional?: boolean;
  kind: "drive" | "view" | "food" | "stay" | "flight" | "check";
  note: string;
  ticket?: string;
  veteran?: string;
};

type DayPlan = {
  id: string;
  date: string;
  dow: string;
  title: string;
  route: string;
  drive: string;
  distance: string;
  weatherPlace: string;
  lat: number;
  lon: number;
  tone: string;
  alert?: string;
  stops: Stop[];
};

type Hotel = {
  name: string;
  area: string;
  level: "首选" | "省钱" | "舒适" | "景观" | "备选";
  price: string;
  why: string;
  ctripHotelId?: string;
  huazhu?: boolean;
  rating?: string;
  year?: string;
  confirmed?: boolean;
  dateWarning?: string;
};

type HotelGroup = {
  id: string;
  title: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  tip: string;
  hotels: Hotel[];
};


const days = latestDays as DayPlan[];
const hotelGroups = latestHotelGroups as HotelGroup[];
const routePoints = ["乌市", "奎屯", "独库", "唐布拉", "巩留", "喀拉峻", "八卦城", "昭苏", "夏塔", "伊宁", "国门", "赛湖", "机场"];

const dayReadiness: Record<string, { start: string; fuel: string; booking: string; cut: string; stopLoss: string }> = {
  "0731": { start: "15:00前离开乌市", fuel: "出城前补满油，买水和独库路餐", booking: "确认7月30日晚酒店已保留到凌晨入住", cut: "市区只保留和田二街/大巴扎/正飞鲜奶，不再加博物馆", stopLoss: "犯困就服务区休息，宁可晚到奎屯" },
  "0801": { start: "06:00前从奎屯出发", fuel: "奎屯/独山子加满；进独库后不要低于半箱", booking: "独库乌苏驿08:00–10:00预约必须截图保存", cut: "唐布拉低云或下雨：取消仙女湖骑马", stopLoss: "21:00后仍未到尼勒克就住尼勒克，不硬冲巩留" },
  "0802": { start: "08:00前离开巩留", fuel: "巩留出发前补油，特克斯前后视油量补一次", booking: "8月1日晚按天气买喀拉峻票；只买东西喀拉峻", cut: "喀拉峻撤出晚于17:00就跳过八卦城短逛", stopLoss: "19:30前离开特克斯去昭苏；太晚就直接酒店" },
  "0803": { start: "07:30前从昭苏出发", fuel: "昭苏县城补油补水，夏塔当天不赌景区内补给", booking: "夏塔门票+区间车提前买好，后段交通现场决定", cut: "夏塔深度徒步和玉湖只能二选一", stopLoss: "天气差就短徒步，玉湖无条件取消" },
  "0804": { start: "08:00前离开昭苏", fuel: "昭苏出发前补油，伊宁离城前买水和零食", booking: "伊昭只查路况不买票；霍尔果斯酒店晚到确认", cut: "伊昭耗时过长时，喀赞其和六星街只留一个", stopLoss: "18:30前离开伊宁去霍尔果斯，避免夜间赶路" },
  "0805": { start: "12:30前离开霍尔果斯", fuel: "霍尔果斯出发前加满油，进赛湖前买水和路餐", booking: "赛湖自驾票、城际车牌报备、二次入园规则要确认", cut: "国门只玩半天，不进合作中心深逛购物", stopLoss: "15:30仍未进湖就只抓东岸/北岸重点点位" },
  "0806": { start: "13:30必须离开赛湖", fuel: "返伊宁前确认油量；还车前加到租车约定油位", booking: "确认21:00航班、托运截止、租车还车点", cut: "不再完整环湖，只补拍晨光和少数点位", stopLoss: "18:00到伊宁机场还车是硬截止" },
};

const costGroups = [
  { title: "已定住宿", amount: "按订单为准", detail: "麗枫 / 奎屯华悦 / 温度湾S / 昭苏你好×2 / 霍尔果斯你好 / 赛里木湖城际。重点核对昭苏是否已补订第二晚。" },
  { title: "门票与区间车", amount: "约¥700–1100/2人", detail: "喀拉峻、夏塔、赛湖为主；退役军人免首道门票后，区间车、自驾服务、骑马另付。" },
  { title: "油费", amount: "约¥1200–1700", detail: "全程约1900km上下，SUV按7.5–10L/100km估算；山区/堵车会抬高油耗。" },
  { title: "骑马/观光车/停车", amount: "预留¥600–1000", detail: "仙女湖骑马、夏塔后段交通、景区停车和临时补给都放这里，不要和门票混算。" },
  { title: "租车与保障", amount: "按一嗨订单", detail: "重点看异地还车费、尊享保障、轮胎玻璃、救援范围和还车油位。" },
];

const roadSupport = [
  { day: "7月31日", route: "乌市 → 奎屯", fuel: "乌市出城前加满", supply: "正飞鲜奶后买水、防晒、雨衣、第二天路餐", parking: "大巴扎/和田二街贵重行李不要外露" },
  { day: "8月1日", route: "奎屯 → 独库 → 唐布拉 → 巩留", fuel: "奎屯或独山子满油进山", supply: "乔尔玛只做洗手间、热水、简餐", parking: "独库只进正规停车区；仙女湖先问马队总时长和总价" },
  { day: "8月2日", route: "巩留 → 喀拉峻 → 昭苏", fuel: "巩留出发前补油，特克斯视情况补一次", supply: "喀拉峻午餐提前准备，景区内不要指望快餐效率", parking: "特克斯只短停，别把车开进太拥挤小巷" },
  { day: "8月3日", route: "昭苏 → 夏塔 → 昭苏", fuel: "昭苏县城补满再去夏塔", supply: "早餐打包，带水和薄外套；夏塔天气变脸快", parking: "夏塔只按景区停车指引走，玉湖不赶末班入园" },
  { day: "8月4日", route: "昭苏 → 伊昭 → 伊宁 → 霍尔果斯", fuel: "昭苏出发前补油，伊宁离城前再看油量", supply: "伊宁午餐顺手买赛湖前路餐", parking: "伊宁街区不要钻小巷，宁可多走几分钟" },
  { day: "8月5日", route: "霍尔果斯 → 赛里木湖", fuel: "霍尔果斯加满后进湖", supply: "进湖前买水、零食、防风衣物", parking: "赛湖按光线取舍停车点，不为每个观景台下车" },
  { day: "8月6日", route: "赛湖 → 果子沟 → 伊宁机场", fuel: "离湖前看油量，还车前补到约定油位", supply: "退房前整理行李和证件，别把晚餐安排太远", parking: "果子沟错过入口不要倒车；机场还车全车拍视频" },
];

const prepGroups = [
  {
    title: "必须提前锁定",
    items: [
      "独库预约：8月1日乌苏驿入口，建议08:00–10:00（全程只需这一次）",
      "夏塔门票 + 区间车：智游昭苏，建议提前约3天；天气差也尽量选可退规则",
      "赛里木湖自驾名额：提前3–5天关注库存；同步向城际报备车牌/入住信息",
      "7月30日晚乌鲁木齐市区酒店：备注7月31日凌晨约03:00入住并电话保留房",
      "租车订单：02:00取车、伊宁异地还车、尊享保障、救援范围和轮胎玻璃责任确认",
    ],
  },
  {
    title: "出发前装包",
    items: [
      "身份证、退役军人优待证、驾驶证、租车合同原件/电子备份",
      "高德离线地图、Apple地图收藏、车充、数据线、移动电源、手机支架",
      "薄羽绒/冲锋衣、徒步鞋、墨镜、防晒、雨衣、保温杯、晕车药和常用药",
      "现金少量、垃圾袋、湿巾、纸巾、车载零食、水和独库/夏塔路餐",
    ],
  },
  {
    title: "每天出发前",
    items: [
      "拍车辆外观、轮胎、油表、里程；山区油量不低于半箱",
      "查天气、交警/景区公告和导航耗时；独库、伊昭、夏塔遇管制不硬闯",
      "当天只有一个主景点时不临时加点：8月1日唐布拉、8月3日夏塔、8月5日赛湖优先",
    ],
  },
];

const prepItems = prepGroups.flatMap((group) => group.items);

const reservationTimeline = [
  { date: "7月25–31日", title: "独库预约", detail: "锁8月1日乌苏驿入口08:00–10:00。独库公路预约制通行管理平台提前1–7天开放，社会车辆19:00后不能进入北段。" },
  { date: "7月31–8月2日", title: "夏塔购票", detail: "智游昭苏提前买夏塔门票+区间车；官方曾公布售票时间09:00–17:00，最终以小程序当日规则为准。" },
  { date: "8月1日晚", title: "喀拉峻按天气决策", detail: "只买东西喀拉峻门票+区间车；如果低云/持续雨，缩短为半日，不买阔克苏全套。" },
  { date: "8月2–4日", title: "赛里木湖自驾 + 城际", detail: "提前关注自驾库存；退役军人不要先买普通成人套票，核对免门票+自驾服务/车票；城际提前报备车牌。" },
  { date: "8月5日上午", title: "霍尔果斯国门", detail: "不是高风险预约项；现场/携程当天核价即可。带身份证，半天结束后直奔赛湖。" },
  { date: "每天清晨", title: "天气与路况复核", detail: "山区预报只看趋势；出发前看交警、景区公告和导航，遇封路直接启用备选路线。" },
];

const ticketCards = [
  { name: "独库北段预约 ×1", when: "8月1日", urgency: "提前1–7天", action: "预约乌苏驿入口08:00–10:00，车牌和入口不要填错。", cost: "道路免费；从独山子进、乔尔玛转唐布拉只需一次预约。", pitfall: "19:00后社会车辆不能进入北段；卡点进山不可行。", veteran: "退役军人驾驶普通社会车辆仍按预约规则通行。", channel: "游新疆一码游 / 新疆交警 / 新疆路网", phone: "12123", url: "https://gat.xinjiang.gov.cn/gat/tzgg/202606/d023345a75834189a9b99c11390698d9.shtml" },
  { name: "喀拉峻草原", when: "8月2日", urgency: "提前1天", action: "8月1日晚看天气后买东西喀拉峻，不要提前锁不可退全域套票。", cost: "参考：门票约¥80 + 区间车约¥90，实时以官方/平台为准。", pitfall: "不要买阔克苏全套；这天还要去特克斯、昭苏。", veteran: "退役军人免首道门票，区间车等其他项目无优惠或另付。", channel: "喀拉峻官方票务 / 携程", phone: "09997765111", url: "https://www.zgtks.gov.cn/zgtks/jrtks/202604/7ae627257e6f4059baa45deb1390f5ad.shtml" },
  { name: "夏塔", when: "8月3日", urgency: "提前约3天", action: "提前买门票+区间车，后段观光车/骑马到现场按体力决定。", cost: "参考：门票约¥40 + 区间车约¥40–60；后段交通/骑马另算。", pitfall: "不要为了玉湖压缩夏塔；15:00后再想去玉湖就直接放弃。", veteran: "免首道门票，区间车、观光车、骑马另付。", channel: "智游昭苏", phone: "09996267165", url: "https://www.xjyl.gov.cn/xjylz/c112876/202406/3cefa71406ef4ba7903e89327939f636.shtml" },
  { name: "霍尔果斯国门", when: "8月5日", urgency: "当天核价", action: "上午现场/携程二选一买票，控制2.5小时内结束。", cost: "门票价格按当天平台/现场为准；不作为提前锁票项。", pitfall: "中哈合作中心购物很容易拖时间，不放进主线。", veteran: "带身份证和优待证，现场问窗口是否有当日优惠。", channel: "景区现场 / 携程", phone: "09998795588" },
  { name: "赛里木湖自驾", when: "8月5–6日", urgency: "提前3–5天", action: "锁自驾名额，并向赛里木湖城际确认车牌、停车、二次入园和早餐时间。", cost: "参考：普通自驾套票约¥145–155/人；优待证应拆成免门票+自驾服务/车票核价。", pitfall: "两人不要都买普通成人套票；先问清免票如何绑定自驾车。", veteran: "免首道门票，自驾服务费/车票仍付。", channel: "赛里木湖旅游 / 一部手机游赛湖", phone: "09097659990", url: "https://wlmq.bendibao.com/xiuxian/202598/65955.shtm" },
];

const amap = (name: string) => `https://uri.amap.com/search?keyword=${encodeURIComponent(name)}&city=${encodeURIComponent("新疆")}&view=map&src=xinjiang-trip&callnative=1`;
const apple = (name: string) => `https://maps.apple.com/?daddr=${encodeURIComponent(name + ", 新疆")}&dirflg=d`;
const ctrip = (hotel: Hotel, group: HotelGroup) => {
  if (hotel.ctripHotelId && group.checkIn && group.checkOut) {
    const params = new URLSearchParams({
      checkIn: group.checkIn,
      checkOut: group.checkOut,
      crn: "1",
      adult: "2",
      children: "0",
    });
    return `https://hotels.ctrip.com/hotels/${hotel.ctripHotelId}.html?${params.toString()}`;
  }
  return `https://m.ctrip.com/webapp/hotel/?keyword=${encodeURIComponent(hotel.name)}`;
};

const checkedAtText = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

function weatherText(code: number) {
  if (code === 0) return "晴";
  if (code <= 3) return "多云";
  if (code <= 48) return "雾";
  if (code <= 67) return "有雨";
  if (code <= 77) return "雨雪";
  if (code <= 82) return "阵雨";
  if (code <= 86) return "阵雪";
  return "雷雨";
}

async function fetchWeatherWithTimeout(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`weather ${res.status}`);
    return await res.json();
  } finally {
    window.clearTimeout(timer);
  }
}

export default function Home() {
  const [tab, setTab] = useState<"today" | "route" | "stays" | "kit">("today");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [prep, setPrep] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [weather, setWeather] = useState<Record<string, { code: number; max: number; min: number; rain: number }>>({});
  const [weatherStatus, setWeatherStatus] = useState("尚未更新");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- restore client-only saved trip state after hydration */
  useEffect(() => {
    setMounted(true);
    try {
      const saved = JSON.parse(localStorage.getItem("xinjiang-trip-v1") || "{}");
      setDone(saved.done || {});
      setPrep(saved.prep || {});
      setNotes(saved.notes || {});
      const cached = JSON.parse(localStorage.getItem("xinjiang-weather-v1") || "{}");
      if (cached.data) setWeather(cached.data);
    } catch { /* keep clean defaults */ }
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(new URL("sw.js", window.location.href).toString()).catch(() => undefined);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("xinjiang-trip-v1", JSON.stringify({ done, prep, notes }));
  }, [done, prep, notes, mounted]);

  const allStops = useMemo(() => days.flatMap((day) => day.stops.filter((stop) => !stop.optional)), []);
  const doneCount = allStops.filter((stop) => done[stop.id]).length;
  const progress = Math.round((doneCount / allStops.length) * 100);

  const activeDay = useMemo(() => {
    const now = new Date();
    const key = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    return days.find((d) => d.id === key) || days.find((d) => d.stops.some((s) => !s.optional && !done[s.id])) || days[days.length - 1];
  }, [done]);

  const visibleHotelGroups = useMemo(() => hotelGroups
    .filter((group) => hotelFilter === "all" || hotelFilter === "huazhu" || hotelFilter === group.id)
    .map((group) => ({
      ...group,
      hotels: hotelFilter === "huazhu" ? group.hotels.filter((hotel) => hotel.huazhu) : group.hotels,
    }))
    .filter((group) => group.hotels.length > 0), [hotelFilter]);

  async function refreshWeather() {
    setWeatherStatus("正在更新…");
    const previous = weather;
    const results = await Promise.allSettled(days.map(async (day) => {
        const date = `2026-${day.id.slice(0, 2)}-${day.id.slice(2)}`;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${day.lat}&longitude=${day.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&start_date=${date}&end_date=${date}`;
        const json = await fetchWeatherWithTimeout(url);
        if (!json.daily?.weather_code?.length) throw new Error("weather empty");
        return [day.id, { code: json.daily.weather_code[0], max: Math.round(json.daily.temperature_2m_max[0]), min: Math.round(json.daily.temperature_2m_min[0]), rain: json.daily.precipitation_probability_max[0] }] as const;
      }));
    const success = results
      .filter((result): result is PromiseFulfilledResult<readonly [string, { code: number; max: number; min: number; rain: number }]> => result.status === "fulfilled")
      .map((result) => result.value);
    if (success.length > 0) {
      const next = { ...previous, ...Object.fromEntries(success) };
      setWeather(next);
      localStorage.setItem("xinjiang-weather-v1", JSON.stringify({ at: Date.now(), data: next }));
      const failed = results.length - success.length;
      const suffix = failed ? `，${failed}天保留旧值` : "";
      setWeatherStatus(`已更新${success.length}天 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}${suffix}`);
    } else {
      setWeatherStatus(Object.keys(previous).length ? "天气接口暂时不可用，已保留上次结果" : "天气接口暂时不可用，请稍后重试");
    }
  }

  async function backup() {
    const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), done, prep, notes }, null, 2);
    if (navigator.share) {
      try { await navigator.share({ title: "新疆行程进度备份", text: payload }); return; } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(payload);
    alert("进度备份已复制到剪贴板");
  }

  const currentWeather = weather[activeDay.id];
  const activeReadiness = dayReadiness[activeDay.id];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">2026 · 北疆单程自驾</p>
          <h1>乌鲁木齐 → 伊宁</h1>
        </div>
        <button className="progress-pill" onClick={() => setTab("route")} aria-label="查看行程进度">
          <span>{progress}%</span><small>{doneCount}/{allStops.length}</small>
        </button>
      </header>

      <section className="route-ribbon" aria-label="整段路线">
        {routePoints.map((p, i) => (
          <div className="route-node" key={p}><i className={i === 0 ? "start" : i === routePoints.length - 1 ? "end" : ""}>{i + 1}</i><span>{p}</span></div>
        ))}
      </section>

      {tab === "today" && (
        <div className="view-stack">
          <section className={`hero-card ${activeDay.tone}`}>
            <div className="hero-head">
              <div><span className="date-chip">下一程 · {activeDay.date}</span><h2>{activeDay.title}</h2></div>
              {currentWeather ? <div className="weather-mini"><strong>{currentWeather.max}°</strong><span>{weatherText(currentWeather.code)} · 降雨{currentWeather.rain}%</span></div> : <button className="text-button" onClick={refreshWeather}>更新天气</button>}
            </div>
            <p className="route-copy">{activeDay.route}</p>
            <div className="metric-row"><span>🚙 {activeDay.drive}</span><span>⌁ {activeDay.distance}</span><span>📍 {activeDay.weatherPlace}</span></div>
            {activeDay.alert && <div className="alert-box"><b>今天的硬约束</b><span>{activeDay.alert}</span></div>}
            <a className="primary-nav" href={amap(activeDay.stops.find(s => !s.optional && !done[s.id])?.place || activeDay.stops[0].place || activeDay.title)} target="_blank" rel="noreferrer">在高德打开下一站 <span>↗</span></a>
          </section>

          {activeReadiness && <section className="section-block readiness-card">
            <div className="section-title"><div><p className="eyebrow">出发前</p><h2>今天先确认这5件事</h2></div></div>
            <div className="readiness-grid">
              <div><span>最晚出发</span><strong>{activeReadiness.start}</strong></div>
              <div><span>油量/补给</span><strong>{activeReadiness.fuel}</strong></div>
              <div><span>预约/订单</span><strong>{activeReadiness.booking}</strong></div>
              <div><span>删点规则</span><strong>{activeReadiness.cut}</strong></div>
              <div><span>止损线</span><strong>{activeReadiness.stopLoss}</strong></div>
            </div>
          </section>}

          <section className="section-block">
            <div className="section-title"><div><p className="eyebrow">当前</p><h2>下一步做什么</h2></div><button className="text-button" onClick={() => setTab("route")}>完整日程</button></div>
            <div className="next-list">
              {activeDay.stops.map((stop) => (
                <article className={`next-item ${stop.optional ? "is-optional" : ""} ${done[stop.id] ? "is-done" : ""}`} key={stop.id}>
                  <button className="check-button" onClick={() => setDone(v => ({ ...v, [stop.id]: !v[stop.id] }))} aria-label={`${done[stop.id] ? "取消完成" : "标记完成"} ${stop.name}`}>{done[stop.id] ? "✓" : ""}</button>
                  <div className="next-time">{stop.time}</div>
                  <div className="next-main"><h3>{stop.name}{stop.optional && <span className="optional-badge">备选</span>}</h3><p>{stop.note}</p>
                    <div className="quick-actions">
                      {stop.place && <a href={amap(stop.place)} target="_blank" rel="noreferrer">高德</a>}
                      {stop.place && <a href={apple(stop.place)} target="_blank" rel="noreferrer">Apple地图</a>}
                      {stop.ticket && <span>{stop.ticket}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block compact-weather">
            <div className="section-title"><div><p className="eyebrow">天气</p><h2>沿途天气窗口</h2></div><button className="text-button" onClick={refreshWeather}>刷新</button></div>
            <p className="muted">{weatherStatus} · 山区天气只作趋势参考，出发前24小时再确认。</p>
            <div className="weather-strip">
              {days.map(day => <div className="weather-day" key={day.id}><span>{day.date.replace('月','/').replace('日','')}</span>{weather[day.id] ? <><strong>{weather[day.id].max}°</strong><small>{weatherText(weather[day.id].code)}</small><em>{weather[day.id].rain}%雨</em></> : <><strong>—</strong><small>{day.weatherPlace.split(' / ')[0]}</small></>}</div>)}
            </div>
          </section>
        </div>
      )}

      {tab === "route" && (
        <div className="view-stack">
          <section className="page-intro"><p className="eyebrow">行程</p><h2>7天完整行程</h2><p>路线按“乌鲁木齐进、伊宁出”重排。勾选和备注会保存在当前浏览器；每个地点都有双地图入口。</p></section>
          {days.map(day => {
            const requiredStops = day.stops.filter(s => !s.optional);
            const dayDone = requiredStops.filter(s => done[s.id]).length;
            return <section className={`day-card ${day.tone}`} key={day.id}>
              <div className="day-head"><div className="day-date"><strong>{day.date}</strong><span>{day.dow}</span></div><div className="day-name"><h2>{day.title}</h2><p>{day.route}</p></div><div className="day-count">{dayDone}/{requiredStops.length}</div></div>
              <div className="day-meta"><span>🚙 {day.drive}</span><span>⌁ {day.distance}</span>{weather[day.id] && <span>☁ {weatherText(weather[day.id].code)} {weather[day.id].min}–{weather[day.id].max}℃</span>}</div>
              {day.alert && <p className="day-alert">⚠ {day.alert}</p>}
              {dayReadiness[day.id] && <div className="day-readiness">
                <div><b>最晚出发</b><span>{dayReadiness[day.id].start}</span></div>
                <div><b>油量/补给</b><span>{dayReadiness[day.id].fuel}</span></div>
                <div><b>预约/订单</b><span>{dayReadiness[day.id].booking}</span></div>
                <div><b>删点规则</b><span>{dayReadiness[day.id].cut}</span></div>
                <div><b>止损线</b><span>{dayReadiness[day.id].stopLoss}</span></div>
              </div>}
              <div className="timeline">
                {day.stops.map(stop => <article className={`timeline-row ${stop.optional ? "is-optional" : ""} ${done[stop.id] ? "is-done" : ""}`} key={stop.id}>
                  <button className="check-button" onClick={() => setDone(v => ({ ...v, [stop.id]: !v[stop.id] }))}>{done[stop.id] ? "✓" : ""}</button>
                  <time>{stop.time}</time>
                  <div><h3>{stop.name}{stop.optional && <span className="optional-badge">备选，不计进度</span>}</h3><p>{stop.note}</p>{stop.ticket && <div className="info-chip">票务 · {stop.ticket}</div>}{stop.veteran && <div className="veteran-chip">优待证 · {stop.veteran}</div>}<div className="quick-actions">{stop.place && <a href={amap(stop.place)} target="_blank" rel="noreferrer">高德导航</a>}{stop.place && <a href={apple(stop.place)} target="_blank" rel="noreferrer">Apple地图</a>}</div></div>
                </article>)}
              </div>
              <label className="notes-box"><span>当天备注</span><textarea value={notes[day.id] || ""} onChange={e => setNotes(v => ({ ...v, [day.id]: e.target.value }))} placeholder="记录改线、费用、停车位置、房号……" /></label>
            </section>
          })}

          <section className="backup-card">
            <p className="eyebrow">备选路线</p><h2>独库关闭时怎么走</h2>
            <div className="backup-route">独山子 <b>→</b> G30 <b>→</b> 赛里木湖 <b>→</b> 清水河 <b>→</b> 伊宁 <b>→</b> 巩留 <b>→</b> 特克斯 / 喀拉峻 <b>→</b> 夏塔 <b>→</b> 昭苏 <b>→</b> 伊昭 <b>→</b> 伊宁</div>
            <p>放弃独库北段和唐布拉，把赛里木湖提前到前段；仍保留喀拉峻、夏塔和伊昭公路，不为补唐布拉走回头路。</p>
          </section>

          <section className="backup-card forest">
            <p className="eyebrow">天气取舍</p><h2>山区坏天气时做减法</h2>
            <p>8月1日唐布拉低云或下雨时，取消仙女湖骑马，百里画廊车览后提前到巩留；8月3日夏塔低云或持续降雨时缩短徒步并跳过玉湖。不要临时插入库尔德宁，否则会再次压缩后半程。</p>
          </section>
        </div>
      )}

      {tab === "stays" && (
        <div className="view-stack">
          <section className="page-intro"><p className="eyebrow">住宿</p><h2>沿途住宿备选</h2><p>每晚保留多档选择，并保证每个住宿站至少有一个华住会方案；优先桔子、全季、你好、星程，只有缺少中端华住的地方才保留汉庭兜底。价格是7月24日参考价，下单前仍以携程/华住App实时价为准。</p></section>
          <section className="stay-summary">
            <div><span>已确定优先</span><strong>3家</strong><small>奎屯 / 巩留 / 昭苏</small></div>
            <p>麗枫 → 奎屯华悦 → 温度湾S → 昭苏你好×2 → 霍尔果斯你好 → 赛里木湖城际</p>
            <p className="stay-summary-note">已确定：7月31日奎屯华悦、8月1日巩留温度湾S、8月2日昭苏你好酒店、8月4日霍尔果斯你好、8月5日赛里木湖城际。当前主线不住八卦城；昭苏建议同店连住到8月4日。</p>
          </section>
          <div className="filter-scroll"><button className={hotelFilter === "all" ? "active" : ""} onClick={() => setHotelFilter("all")}>全部</button><button className={hotelFilter === "huazhu" ? "active" : ""} onClick={() => setHotelFilter("huazhu")}>只看华住会</button>{hotelGroups.map(g => <button key={g.id} className={hotelFilter === g.id ? "active" : ""} onClick={() => setHotelFilter(g.id)}>{g.title}</button>)}</div>
          {visibleHotelGroups.map(group => <section className="hotel-group" key={group.id}>
            <div className="hotel-group-head"><div><span>{group.date}</span><h2>{group.title}</h2></div><p>{group.tip}</p></div>
            <div className="hotel-list">{group.hotels.map(h => {
              const cachedPrice = h.ctripHotelId && group.checkIn ? hotelPriceCache[hotelPriceKey(h.ctripHotelId, group.checkIn)] : undefined;
              return <article className="hotel-card" key={h.name}>
                <div className="hotel-top"><span className={`level ${h.level}`}>{h.level}</span><span className="price-level">{cachedPrice ? `¥${cachedPrice.amount}起` : h.price}</span></div>
                <div className="hotel-name-row"><h3>{h.name}</h3>{h.confirmed && <span className="confirmed-badge">已确定</span>}{h.huazhu && <span className="huazhu-badge">华住会</span>}</div><p className="hotel-area">📍 {h.area}</p>
                {(h.rating || h.year) && <div className="hotel-facts">{h.rating && <span>★ {h.rating}</span>}{h.year && <span>◷ {h.year}</span>}</div>}
                {h.dateWarning && <div className="hotel-alert">⚠ {h.dateWarning}</div>}
                <p>{h.why}</p>
                {cachedPrice
                  ? <div className="price-snapshot"><div><strong>携程参考价 ¥{cachedPrice.amount}</strong><span>{cachedPrice.rateNote}</span></div><small>{checkedAtText(cachedPrice.checkedAt)}查看 · {cachedPrice.occupancy} · 打开后以实时价为准</small></div>
                  : /^约?¥/.test(h.price)
                    ? <div className="price-snapshot is-empty"><strong>携程列表参考价 {h.price}</strong><small>7月24日对应入住日期查看 · 打开后以实时价为准</small></div>
                    : <div className="price-snapshot is-empty"><strong>暂无参考价</strong><small>打开携程后核对同名酒店和入住日期</small></div>}
                <div className="quick-actions"><a href={amap(h.name)} target="_blank" rel="noreferrer">高德</a><a href={apple(h.name)} target="_blank" rel="noreferrer">Apple地图</a><a href={ctrip(h, group)} target="_blank" rel="noreferrer">{h.ctripHotelId ? "携程打开对应日期" : "携程搜索酒店"}</a></div>
              </article>;
            })}</div>
          </section>)}
        </div>
      )}

      {tab === "kit" && (
        <div className="view-stack">
          <section className="page-intro"><p className="eyebrow">工具</p><h2>出发前先把这些搞定</h2><p>先处理预约、证件、租车和装备；路上每天早上只复核天气、路况和油量。优待证持有人不要先买普通成人套票，能选“免门票+车票/自驾服务”就分开买。</p></section>

          <section className="section-block cost-overview">
            <div className="section-title"><div><p className="eyebrow">费用</p><h2>两人预算总览</h2></div></div>
            <div className="cost-grid">{costGroups.map(item => <article key={item.title} className="cost-card"><span>{item.title}</span><strong>{item.amount}</strong><p>{item.detail}</p></article>)}</div>
          </section>

          <section className="section-block support-section">
            <div className="section-title"><div><p className="eyebrow">补给</p><h2>加油、停车和路餐</h2></div></div>
            <div className="support-list">{roadSupport.map(item => <article key={item.day} className="support-row"><div><time>{item.day}</time><strong>{item.route}</strong></div><p><b>油：</b>{item.fuel}</p><p><b>补给：</b>{item.supply}</p><p><b>停车：</b>{item.parking}</p></article>)}</div>
          </section>

          <section className="section-block">
            <div className="section-title"><div><p className="eyebrow">预约</p><h2>先处理这几件事</h2></div></div>
            <div className="reservation-list">{reservationTimeline.map(item => <article key={`${item.date}-${item.title}`} className="reservation-row"><time>{item.date}</time><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}</div>
          </section>

          <section className="section-block">
            <div className="section-title"><div><p className="eyebrow">清单</p><h2>出发准备</h2></div><span className="counter">{Object.values(prep).filter(Boolean).length}/{prepItems.length}</span></div>
            <div className="prep-list">{prepGroups.map(group => <div className="prep-group" key={group.title}><h3>{group.title}</h3>{group.items.map((item) => { const i = prepItems.indexOf(item); return <label key={item} className={prep[i] ? "checked" : ""}><input type="checkbox" checked={!!prep[i]} onChange={() => setPrep(v => ({ ...v, [i]: !v[i] }))}/><span>{item}</span></label>; })}</div>)}</div>
          </section>

          <section className="section-block ticket-section">
            <div className="section-title"><div><p className="eyebrow">票务</p><h2>预约和买票避坑</h2></div></div>
            <div className="ticket-grid">{ticketCards.map(card => <article className="ticket-card" key={card.name}><div className="ticket-top"><span>{card.when}</span><b>{card.urgency}</b></div><h3>{card.name}</h3><div className="ticket-action">{card.action}</div><p>{card.cost}</p><div className="ticket-warning">避坑 · {card.pitfall}</div><div className="veteran-line">🎖 {card.veteran}</div><small>渠道：{card.channel}</small><div className="ticket-links"><a className="call-link" href={`tel:${card.phone}`}>电话咨询 {card.phone.replace(/(\d{4})(\d+)/, '$1-$2')}</a>{card.url && <a className="call-link source" href={card.url} target="_blank" rel="noreferrer">购票说明</a>}</div></article>)}</div>
          </section>

          <section className="section-block veteran-panel">
            <p className="eyebrow">优待证</p><h2>预计节省约¥190</h2>
            <div className="saving-row"><span>喀拉峻约¥80</span><span>夏塔约¥40</span><span>赛湖约¥70</span></div>
            <p>携带身份证原件、全国统一退役军人优待证原件，退伍证作为备用。免首道门票不等于免区间车、自驾服务、索道或骑马；线上没有合适优惠票型时，优先电话确认或现场窗口处理。</p>
          </section>

          <section className="section-block">
            <p className="eyebrow">应急</p><h2>快捷联系</h2>
            <div className="emergency-grid"><a href="tel:12122"><b>12122</b><span>高速交警 / 救援</span></a><a href="tel:12328"><b>12328</b><span>交通运输服务</span></a><a href="tel:110"><b>110</b><span>报警求助</span></a><a href="tel:120"><b>120</b><span>医疗急救</span></a></div>
          </section>

          <section className="section-block data-tools">
            <p className="eyebrow">备份</p><h2>行程进度</h2><p>勾选和备注保存在当前浏览器。换手机或清理浏览器数据前，先复制一份备份。</p>
            <div className="tool-actions"><button onClick={backup}>分享 / 复制进度备份</button><button className="danger" onClick={() => { if (confirm("确定清空全部勾选与备注？")) { setDone({}); setPrep({}); setNotes({}); } }}>清空本机进度</button></div>
          </section>
        </div>
      )}

      <nav className="bottom-nav" aria-label="主要导航">
        <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}><span>⌂</span>今天</button>
        <button className={tab === "route" ? "active" : ""} onClick={() => setTab("route")}><span>≡</span>行程</button>
        <button className={tab === "stays" ? "active" : ""} onClick={() => setTab("stays")}><span>▰</span>住宿</button>
        <button className={tab === "kit" ? "active" : ""} onClick={() => setTab("kit")}><span>✦</span>工具</button>
      </nav>
    </main>
  );
}
