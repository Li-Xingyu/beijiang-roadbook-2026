"use client";

import { useEffect, useMemo, useState } from "react";

type Stop = {
  id: string;
  time: string;
  name: string;
  place?: string;
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
};

const days: DayPlan[] = [
  {
    id: "0731",
    date: "7月31日",
    dow: "周五",
    title: "落地休息 · 乌市烟火 · 奔赴独山子",
    route: "乌鲁木齐机场 → 市区 → 独山子",
    drive: "约3.5小时",
    distance: "约300km",
    weatherPlace: "乌鲁木齐 / 独山子",
    lat: 44.327,
    lon: 84.886,
    tone: "sand",
    alert: "凌晨到达后的睡眠是硬约束。7月30日晚的机场酒店要提前声明“7月31日03:00后入住并保留房间”。",
    stops: [
      { id: "pickup", time: "02:00", name: "机场取车", place: "乌鲁木齐天山国际机场", kind: "drive", note: "拍车身四面、轮胎、油表和里程；确认异地还车、保险、备用钥匙及24小时救援。" },
      { id: "sleep", time: "03:00–09:30", name: "补觉", place: "乌鲁木齐天山国际机场北京北路亚朵酒店", kind: "stay", note: "不要用咖啡替代睡眠。至少完整睡5–6小时，再开始当天驾驶。" },
      { id: "milk", time: "10:30", name: "正飞鲜奶", place: "正飞鲜奶 乌鲁木齐", kind: "food", note: "补给酸奶、奶制品；顺手在市区买水、防晒、雨衣和路餐。" },
      { id: "bazaar", time: "11:20–12:20", name: "国际大巴扎", place: "新疆国际大巴扎", kind: "view", note: "短停看建筑和街区即可；租车注意停车，贵重行李不要留在可见位置。", ticket: "街区免费，演出另付" },
      { id: "hetian", time: "12:30–14:30", name: "和田二街午餐", place: "和田二街", kind: "food", note: "优先：喀神一把抓烤包子、爱乐塔西无花果酸奶粽子、无花果抓饭、石榴籽馕房。两个人不要每家点满份。" },
      { id: "depart", time: "15:00", name: "出发去独山子", place: "独山子区", kind: "drive", note: "途中每2小时休息一次；如果犯困，立刻进服务区，不抢抵达时间。" },
      { id: "dushanzi", time: "19:00前后", name: "独山子入住", place: "独山子丽呈明宇酒店 时代广场店", kind: "stay", note: "晚餐后加满油，下载高德离线地图；向酒店确认次日独库实时通行情况。" },
    ],
  },
  {
    id: "0801",
    date: "8月1日",
    dow: "周六",
    title: "独库北段 · 唐布拉百里画廊",
    route: "独山子 → 独库公路北段 → 乔尔玛 → 唐布拉",
    drive: "约5–7小时",
    distance: "约250km",
    weatherPlace: "唐布拉 / 尼勒克",
    lat: 43.79,
    lon: 82.5,
    tone: "pine",
    alert: "独库开放不代表全天畅通。07:00查交警公告；遇管制就执行页面底部的“独库关闭备选线”。",
    stops: [
      { id: "roadcheck", time: "07:00", name: "查路况 + 加满油", place: "独库公路独山子起点", kind: "check", note: "检查胎压、玻璃水、油量和刹车；油量低于半箱就补。不要盲信导航的预计时间。" },
      { id: "duku", time: "08:00–14:30", name: "独库公路北段", place: "独库公路起点纪念碑", kind: "drive", note: "重点是沿途雪山峡谷和公路本身。停车只进正规停车区，弯道与隧道口不停车。", ticket: "免费，无需预约" },
      { id: "qiaoerma", time: "12:30左右", name: "乔尔玛休整", place: "乔尔玛革命烈士陵园", kind: "view", note: "补给、午餐、洗手间；控制在45分钟左右，下午给唐布拉留时间。" },
      { id: "gallery", time: "15:00–19:00", name: "唐布拉百里画廊", place: "唐布拉百里画廊", kind: "view", note: "沿喀什河随走随停，以车览和短步行为主。雨后注意路肩松软，不下非铺装支路。", ticket: "主线免费" },
      { id: "tangstay", time: "19:30", name: "唐布拉入住", place: "百里画廊唐布拉草原欢驿栖息馆", kind: "stay", note: "请民宿当晚确认仙女湖马队价格、出发点和天气；不向陌生个人账户支付高额定金。" },
    ],
  },
  {
    id: "0802",
    date: "8月2日",
    dow: "周日",
    title: "仙女湖条件游 · 那拉提自驾",
    route: "唐布拉 → 仙女湖（条件）→ 那拉提",
    drive: "约3–4小时",
    distance: "约170km",
    weatherPlace: "那拉提",
    lat: 43.24,
    lon: 84.03,
    tone: "meadow",
    alert: "硬截止：15:00前到那拉提游客中心。下雨、低云或仙女湖结束晚于11:00，直接跳过仙女湖。",
    stops: [
      { id: "fairy", time: "07:30–10:45", name: "仙女湖（天气条件项）", place: "唐布拉仙女湖", kind: "view", note: "骑马往返通常占半天。先确认总价、往返时长和是否一人一马；头盔优先。", ticket: "现场骑马/接驳，优待证通常不抵扣" },
      { id: "nldrive", time: "11:00–14:30", name: "前往那拉提", place: "那拉提旅游风景区游客中心", kind: "drive", note: "途中简单路餐，不安排正式午餐。若15:30仍未入园，不再硬挤当天项目。" },
      { id: "nalati", time: "14:30–18:30", name: "那拉提空中草原", place: "那拉提空中草原", kind: "view", note: "自驾只走空中草原核心环线：天界台—天牧台—游牧人家。不要为了“回本”再塞满河谷和盘龙谷。", ticket: "自驾票须提前预约；约¥200/人", veteran: "退役军人免首道门票约¥95，自驾服务费仍付；特殊证件按官方窗口流程办理。" },
      { id: "nalatistay", time: "19:00", name: "那拉提入住", place: "新疆文旅那拉提度假酒店 游客中心店", kind: "stay", note: "第二天路程长，晚饭后加油、整理行李，07:30前出发。" },
    ],
  },
  {
    id: "0803",
    date: "8月3日",
    dow: "周一",
    title: "长途转场 · 喀拉峻立体草原",
    route: "那拉提 → 巩留 → 特克斯 → 喀拉峻",
    drive: "约4.5小时",
    distance: "约250km",
    weatherPlace: "特克斯 / 喀拉峻",
    lat: 43.21,
    lon: 81.84,
    tone: "grass",
    alert: "晴天保留喀拉峻；持续阴雨、雪山完全不可见时，可改走库尔德宁森林线，二选一，不叠加。",
    stops: [
      { id: "transfer", time: "07:30–12:00", name: "那拉提到喀拉峻", place: "喀拉峻国际生态旅游区", kind: "drive", note: "途中只做短休息。不要临时把库尔德宁再塞进来，否则喀拉峻和夏塔都会被压缩。" },
      { id: "kalajun", time: "12:30–18:30", name: "东西喀拉峻", place: "喀拉峻大草原", kind: "view", note: "只做草原线，重点鲜花台、猎鹰台和立体草原；不叠加阔克苏大峡谷全套。", ticket: "建议提前1天买门票+区间车", veteran: "退役军人免门票约¥80，区间车约¥90照付。" },
      { id: "tekes", time: "19:20–21:00", name: "特克斯八卦城", place: "特克斯八卦城太极坛", kind: "view", note: "晚餐、太极坛和夜景轻逛；当天驾驶量大，不安排深夜活动。", ticket: "城区免费" },
      { id: "tekesstay", time: "21:00", name: "特克斯入住", place: "全季酒店 特克斯八卦城太极坛店", kind: "stay", note: "连锁优先首选。前台询问次日去夏塔的道路与排队情况。" },
    ],
  },
  {
    id: "0804",
    date: "8月4日",
    dow: "周二",
    title: "夏塔雪山古道 · 住昭苏",
    route: "特克斯 → 夏塔 → 昭苏",
    drive: "约4小时",
    distance: "约220km",
    weatherPlace: "夏塔 / 昭苏",
    lat: 42.48,
    lon: 80.76,
    tone: "ice",
    alert: "夏塔是全程最怕天气与客流的项目。提前购票、尽量早到；出现暴雨、山洪或景区关闭，不进沟冒险。",
    stops: [
      { id: "xiataway", time: "07:00–09:30", name: "前往夏塔", place: "夏塔旅游区游客中心", kind: "drive", note: "早餐打包，争取成为上午第一批。玉湖不放主线，避免把夏塔压缩成打卡。" },
      { id: "xiata", time: "09:30–17:00", name: "夏塔景区", place: "夏塔旅游区", kind: "view", note: "区间车到温泉酒店后，根据体力徒步。16:00前开始返程，不追赶冰川近距离。", ticket: "旺季限量，建议提前约3天", veteran: "免首道门票约¥40；区间车约¥60及后段交通/骑马另付。" },
      { id: "zhaosu", time: "17:00–19:00", name: "前往昭苏县城", place: "昭苏县", kind: "drive", note: "若天气好且体力充足，可在县城周边看落日；不再折返玉湖。" },
      { id: "zhaosustay", time: "19:30", name: "昭苏入住", place: "汉庭酒店 昭苏天马湖公园店", kind: "stay", note: "相比夏塔门口民宿，县城连锁卫生、洗衣和第二天伊昭出发更稳。想早入夏塔可反选景区门口民宿。" },
    ],
  },
  {
    id: "0805",
    date: "8月5日",
    dow: "周三",
    title: "伊昭公路 · 伊宁人文 · 赛湖日落",
    route: "昭苏 → 伊昭公路 → 伊宁 → 赛里木湖 / 清水河",
    drive: "约5小时",
    distance: "约330km",
    weatherPlace: "赛里木湖",
    lat: 44.6,
    lon: 81.14,
    tone: "lake",
    alert: "这是转场最长的一天。伊宁只做核心街区和午餐，15:00左右必须西行，给赛湖日落留时间。",
    stops: [
      { id: "yizhao", time: "07:30–10:30", name: "伊昭公路", place: "伊昭公路白石峰", kind: "drive", note: "弯多、落石风险高；遇管制按导航经特克斯绕行，不走非正规近路。", ticket: "免费，无需预约" },
      { id: "kazanchi", time: "11:00–12:30", name: "喀赞其", place: "伊宁市喀赞其民俗旅游区", kind: "view", note: "看蓝色院落与街巷，控制在90分钟；家访、马车按兴趣选择。", ticket: "街区免费" },
      { id: "liuxing", time: "12:40–14:30", name: "六星街 + 午餐", place: "伊宁六星街", kind: "food", note: "步行逛核心放射街区，午餐就近解决。若出发晚，喀赞其和六星街只保留一个。", ticket: "街区免费" },
      { id: "sairamdrive", time: "15:00–17:30", name: "前往赛里木湖", place: "赛里木湖景区东门", kind: "drive", note: "进入景区前补油、买水和第二天路餐。自驾票提前锁定，不依赖现场余票。" },
      { id: "sunset", time: "17:30–21:00", name: "赛里木湖西岸日落", place: "赛里木湖亲水滩", kind: "view", note: "第一晚重点西海草原、亲水滩、克勒涌珠一带；风大，备羽绒/冲锋衣。", ticket: "自驾票提前3–5天关注库存", veteran: "免首道门票约¥70，自驾服务费仍付；两人不要都买普通成人套票。" },
      { id: "sairamstay", time: "21:30", name: "清水河 / 赛湖住宿", place: "汉庭酒店 霍城清水河店", kind: "stay", note: "性价比首选清水河。若住景区内，务必核实住宿订单是否真的含自驾入园资格。" },
    ],
  },
  {
    id: "0806",
    date: "8月6日",
    dow: "周四",
    title: "赛湖晨光 · 果子沟 · 伊宁返程",
    route: "清水河 → 赛里木湖 → 果子沟 → 伊宁机场",
    drive: "约4小时",
    distance: "约260km",
    weatherPlace: "赛里木湖 / 伊宁",
    lat: 43.91,
    lon: 81.32,
    tone: "sky",
    alert: "21:00航班：18:00到机场还车是硬截止。14:00必须离开赛湖，任何临时项目都不能侵占返程缓冲。",
    stops: [
      { id: "morninglake", time: "07:30–13:30", name: "赛里木湖晨光环湖", place: "赛里木湖月亮湾", kind: "view", note: "东岸月亮湾—松树头—S弯按光线选点，不追求每个停车场都下车。" },
      { id: "guozigou", time: "14:00–15:00", name: "果子沟观景", place: "果子沟大桥观景台", kind: "view", note: "只在正规观景区短停；错过入口不要倒车或路边停车。" },
      { id: "return", time: "15:00–17:40", name: "返回伊宁", place: "伊宁机场", kind: "drive", note: "途中至少留一次服务区休息；加油至租车约定油位，保留加油小票。" },
      { id: "dropoff", time: "18:00", name: "机场还车", place: "伊宁机场租车还车点", kind: "check", note: "拍全车视频、油表、里程和还车位置；让门店确认无新增损伤及异地还车结清。" },
      { id: "flight", time: "21:00", name: "伊宁起飞", place: "伊宁机场", kind: "flight", note: "托运行李最晚办理时间以航司为准；不要把晚餐安排在安检前的远处餐厅。" },
    ],
  },
];

const hotelGroups: { id: string; title: string; date: string; tip: string; hotels: Hotel[] }[] = [
  {
    id: "airport", title: "乌鲁木齐机场", date: "7月30日晚（31日凌晨入住）", tip: "必须提前电话保留凌晨房。机场接送不重要，因为你们先取车；免费停车和24小时前台更重要。",
    hotels: [
      { name: "全季酒店（乌鲁木齐天山国际机场空港店）", area: "机场周边", level: "首选", price: "¥¥", why: "华住体系、标准稳定，适合只睡5–6小时。" },
      { name: "乌鲁木齐国际机场北京北路亚朵酒店", area: "北京北路", level: "舒适", price: "¥¥¥", why: "床品与隔音更稳，凌晨落地后恢复体力优先。" },
      { name: "乌鲁木齐天缘酒店", area: "南航站区", level: "备选", price: "¥¥", why: "传统机场酒店，选前先确认到T4取车点的实际车程。" },
    ],
  },
  {
    id: "dushanzi", title: "独山子", date: "7月31日晚", tip: "选择市区、有正规停车场和早餐早开的酒店；不要为了住景区边缘增加第二天取补给的时间。",
    hotels: [
      { name: "独山子丽呈明宇酒店（时代广场店）", area: "市中心", level: "首选", price: "¥¥", why: "此前查价约¥271，位置和综合品质比较均衡。" },
      { name: "克拉玛依独山子慧洋万达锦华酒店", area: "独库东一路", level: "舒适", price: "¥¥¥", why: "新、停车方便，预算允许时省心。" },
      { name: "独山子大酒店", area: "市区", level: "省钱", price: "¥", why: "传统酒店，价格合适时作为功能型过夜。" },
    ],
  },
  {
    id: "tangbula", title: "唐布拉百里画廊", date: "8月1日晚", tip: "这里没有真正可比的全国连锁。优先独立卫浴、供暖、停车和真实近30天评价，不为帐篷景观支付过高溢价。",
    hotels: [
      { name: "百里画廊唐布拉草原欢驿栖息馆", area: "种蜂场", level: "首选", price: "¥¥", why: "位置实用、24小时前台；方便联系仙女湖马队。" },
      { name: "画廊别苑民宿（孟克特景区店）", area: "唐布拉草原", level: "舒适", price: "¥¥", why: "近期评价提到可协助确认景区开放和骑马。" },
      { name: "尼勒克古道山前民宿（唐布拉孟克特景区店）", area: "乔尔玛镇", level: "省钱", price: "¥", why: "自驾落脚实用，适合把住宿当睡觉点。" },
      { name: "唐布拉百里画廊松果野奢营地", area: "百里画廊", level: "景观", price: "¥¥¥", why: "景观体验好，但雷雨、隔音和价格波动需要接受。" },
    ],
  },
  {
    id: "nalati", title: "那拉提", date: "8月2日晚", tip: "你们只住一晚且第二天早走，景区游客中心附近比“住得漂亮”更重要。",
    hotels: [
      { name: "新疆文旅那拉提度假酒店（游客中心店）", area: "游客中心旁", level: "首选", price: "¥¥", why: "此前查价约¥488，位置优势明显、正规度高。" },
      { name: "新疆华美胜地那拉提智选假日酒店", area: "那拉提东街", level: "舒适", price: "¥¥¥", why: "IHG连锁，硬件新；暑期价格高时性价比会下降。" },
      { name: "那拉提金陵山庄", area: "景区方向", level: "景观", price: "¥¥¥", why: "预算充足、想看晨昏景观时选；只过夜不划算。" },
    ],
  },
  {
    id: "tekes", title: "特克斯八卦城", date: "8月3日晚", tip: "这里连锁选择最好。优先华住，哪家含双早且可取消就选哪家，不必执着太极坛最近。",
    hotels: [
      { name: "全季酒店（特克斯八卦城太极坛店）", area: "太极坛附近", level: "首选", price: "¥¥", why: "新、位置好、品牌稳定，当前最符合你的偏好。" },
      { name: "全季酒店（特克斯九宫新城店）", area: "九宫新城", level: "备选", price: "¥¥", why: "同品牌比价备选，停车和房型更重要。" },
      { name: "特克斯H+酒店（八卦城中心太极坛店）", area: "中心区域", level: "省钱", price: "¥", why: "停车和步行便利，价格明显低于全季时更划算。" },
      { name: "特克斯亨通国际酒店", area: "八卦城", level: "舒适", price: "¥¥¥", why: "想升级房间和服务时考虑，不作为默认。" },
    ],
  },
  {
    id: "zhaosu", title: "昭苏 / 夏塔", date: "8月4日晚", tip: "主方案住昭苏县城，换取连锁卫生与洗衣；若想早入夏塔，则改住景区门口民宿，两种方案不要混搭。",
    hotels: [
      { name: "汉庭酒店（昭苏天马湖公园店）", area: "昭苏县城", level: "首选", price: "¥¥", why: "2026年新开、停车方便，路线与品牌最均衡。" },
      { name: "全季酒店（昭苏天马国际广场店）", area: "昭苏县城", level: "舒适", price: "¥¥¥", why: "华住优先，暑期价格过高时改汉庭。" },
      { name: "夕夏里民宿（夏塔景区店）", area: "夏塔门口", level: "景观", price: "¥¥", why: "近景区、有接送评价；适合把夏塔调整到第二天早上。" },
      { name: "漫唐居民宿（夏塔景区店）", area: "夏塔门口", level: "备选", price: "¥¥", why: "近景区、露台，作为民宿比价对象。" },
    ],
  },
  {
    id: "sairam", title: "清水河 / 赛里木湖", date: "8月5日晚", tip: "性价比首选清水河，住宿便宜且补给完整；城际酒店只有价格回落或明确含餐/入园权益时才升级。",
    hotels: [
      { name: "汉庭酒店（霍城清水河店）", area: "清水河镇", level: "首选", price: "¥¥", why: "2026年新开；此前查价约¥283起，华住且停车方便。" },
      { name: "霍城初喜酒店（清水河店）", area: "清水河镇", level: "舒适", price: "¥¥", why: "近期评价稳定，汉庭涨价时重点比价。" },
      { name: "霍城京基大酒店（清水河店）", area: "清水河镇", level: "省钱", price: "¥", why: "功能型住宿，安静与卫生评价相对稳。" },
      { name: "赛里木湖城际酒店", area: "赛湖景区", level: "景观", price: "¥¥¥", why: "只在含三餐、位置权益明确且总价能接受时选。" },
    ],
  },
  {
    id: "yining", title: "伊宁应急住宿", date: "误机 / 行程调整备用", tip: "正常行程无需住伊宁；如果天气导致改线或航班变化，优先住机场与六星街之间。",
    hotels: [
      { name: "全季酒店（伊宁国际机场六星街景区店）", area: "机场 / 六星街", level: "首选", price: "¥¥", why: "机场和六星街兼顾，华住体系。" },
      { name: "桔子酒店（伊宁六星街景区店）", area: "解放西路", level: "舒适", price: "¥¥", why: "有停车场，步行可达六星街周边。" },
      { name: "伊宁市上海城解放西路亚朵酒店", area: "解放西路", level: "舒适", price: "¥¥¥", why: "床品和路早服务适合航班调整。" },
    ],
  },
];

const prepItems = [
  "那拉提自驾票（智游那拉提，开放未来7日库存时抢）",
  "夏塔门票 + 区间车（智游昭苏，建议提前3天）",
  "赛里木湖自驾名额（官方渠道提前3–5天关注）",
  "喀拉峻门票 + 区间车（前一晚根据天气购买）",
  "7月30日晚机场酒店：备注7月31日凌晨入住并保留房",
  "租车订单：02:00取车、伊宁异地还车、保险与救援确认",
  "身份证、优待证、驾驶证、租车合同原件/电子备份",
  "离线地图、充电线、车充、移动电源、墨镜、防晒、雨衣",
  "薄羽绒/冲锋衣、徒步鞋、保温杯、晕车药和常用药",
  "每天出发前拍车辆外观和仪表；山区油量不低于半箱",
];

const ticketCards = [
  { name: "那拉提自驾", when: "8月2日", urgency: "最优先", cost: "常规¥200/人", veteran: "你免首道门票约¥95，仍付自驾服务费", channel: "智游那拉提", phone: "09995291888" },
  { name: "喀拉峻草原", when: "8月3日", urgency: "提前1天", cost: "门票约¥80 + 区间车约¥90", veteran: "门票免，区间车原价", channel: "喀拉峻官方票务", phone: "09997765111" },
  { name: "夏塔", when: "8月4日", urgency: "提前约3天", cost: "门票约¥40 + 区间车约¥60", veteran: "门票免，区间车/骑马另付", channel: "智游昭苏", phone: "09996267165" },
  { name: "赛里木湖自驾", when: "8月5–6日", urgency: "提前3–5天", cost: "24小时套票约¥145–155/人", veteran: "门票约¥70免，自驾服务费仍付", channel: "赛里木湖旅游 / 一部手机游赛湖", phone: "09097659990" },
];

const amap = (name: string) => `https://uri.amap.com/search?keyword=${encodeURIComponent(name)}&city=${encodeURIComponent("新疆")}&view=map&src=xinjiang-trip&callnative=1`;
const apple = (name: string) => `https://maps.apple.com/?daddr=${encodeURIComponent(name + ", 新疆")}&dirflg=d`;
const ctrip = (name: string) => `https://m.ctrip.com/webapp/hotel/?keyword=${encodeURIComponent(name)}`;

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

export default function Home() {
  const [tab, setTab] = useState<"today" | "route" | "stays" | "kit">("today");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [prep, setPrep] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [weather, setWeather] = useState<Record<string, { code: number; max: number; min: number; rain: number }>>({});
  const [weatherStatus, setWeatherStatus] = useState("尚未更新");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

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
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("xinjiang-trip-v1", JSON.stringify({ done, prep, notes }));
  }, [done, prep, notes, mounted]);

  const allStops = useMemo(() => days.flatMap((day) => day.stops), []);
  const doneCount = allStops.filter((stop) => done[stop.id]).length;
  const progress = Math.round((doneCount / allStops.length) * 100);

  const activeDay = useMemo(() => {
    const now = new Date();
    const key = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    return days.find((d) => d.id === key) || days.find((d) => d.stops.some((s) => !done[s.id])) || days[days.length - 1];
  }, [done]);

  async function refreshWeather() {
    setWeatherStatus("正在更新…");
    try {
      const results = await Promise.all(days.map(async (day) => {
        const date = `2026-${day.id.slice(0, 2)}-${day.id.slice(2)}`;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${day.lat}&longitude=${day.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&start_date=${date}&end_date=${date}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("weather unavailable");
        const json = await res.json();
        return [day.id, { code: json.daily.weather_code[0], max: Math.round(json.daily.temperature_2m_max[0]), min: Math.round(json.daily.temperature_2m_min[0]), rain: json.daily.precipitation_probability_max[0] }] as const;
      }));
      const next = Object.fromEntries(results);
      setWeather(next);
      localStorage.setItem("xinjiang-weather-v1", JSON.stringify({ at: Date.now(), data: next }));
      setWeatherStatus(`已更新 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
    } catch {
      setWeatherStatus("暂时无法更新，保留上次结果");
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
        {['乌市','独山子','唐布拉','那拉提','喀拉峻','夏塔','伊宁','赛湖','机场'].map((p, i) => (
          <div className="route-node" key={p}><i className={i === 0 ? "start" : i === 8 ? "end" : ""}>{i + 1}</i><span>{p}</span></div>
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
            <a className="primary-nav" href={amap(activeDay.stops.find(s => !done[s.id])?.place || activeDay.stops[0].place || activeDay.title)} target="_blank" rel="noreferrer">在高德打开下一站 <span>↗</span></a>
          </section>

          <section className="section-block">
            <div className="section-title"><div><p className="eyebrow">NOW</p><h2>下一步做什么</h2></div><button className="text-button" onClick={() => setTab("route")}>完整日程</button></div>
            <div className="next-list">
              {activeDay.stops.map((stop) => (
                <article className={`next-item ${done[stop.id] ? "is-done" : ""}`} key={stop.id}>
                  <button className="check-button" onClick={() => setDone(v => ({ ...v, [stop.id]: !v[stop.id] }))} aria-label={`${done[stop.id] ? "取消完成" : "标记完成"} ${stop.name}`}>{done[stop.id] ? "✓" : ""}</button>
                  <div className="next-time">{stop.time}</div>
                  <div className="next-main"><h3>{stop.name}</h3><p>{stop.note}</p>
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
            <div className="section-title"><div><p className="eyebrow">FORECAST</p><h2>沿途天气窗口</h2></div><button className="text-button" onClick={refreshWeather}>刷新</button></div>
            <p className="muted">{weatherStatus} · 山区天气只作趋势参考，出发前24小时再确认。</p>
            <div className="weather-strip">
              {days.map(day => <div className="weather-day" key={day.id}><span>{day.date.replace('月','/').replace('日','')}</span>{weather[day.id] ? <><strong>{weather[day.id].max}°</strong><small>{weatherText(weather[day.id].code)}</small><em>{weather[day.id].rain}%雨</em></> : <><strong>—</strong><small>{day.weatherPlace.split(' / ')[0]}</small></>}</div>)}
            </div>
          </section>
        </div>
      )}

      {tab === "route" && (
        <div className="view-stack">
          <section className="page-intro"><p className="eyebrow">ITINERARY</p><h2>7天完整行程</h2><p>路线按“乌鲁木齐进、伊宁出”重排。勾选会自动保存在本机；每个地点都有双地图入口。</p></section>
          {days.map(day => {
            const dayDone = day.stops.filter(s => done[s.id]).length;
            return <section className={`day-card ${day.tone}`} key={day.id}>
              <div className="day-head"><div className="day-date"><strong>{day.date}</strong><span>{day.dow}</span></div><div className="day-name"><h2>{day.title}</h2><p>{day.route}</p></div><div className="day-count">{dayDone}/{day.stops.length}</div></div>
              <div className="day-meta"><span>🚙 {day.drive}</span><span>⌁ {day.distance}</span>{weather[day.id] && <span>☁ {weatherText(weather[day.id].code)} {weather[day.id].min}–{weather[day.id].max}℃</span>}</div>
              {day.alert && <p className="day-alert">⚠ {day.alert}</p>}
              <div className="timeline">
                {day.stops.map(stop => <article className={`timeline-row ${done[stop.id] ? "is-done" : ""}`} key={stop.id}>
                  <button className="check-button" onClick={() => setDone(v => ({ ...v, [stop.id]: !v[stop.id] }))}>{done[stop.id] ? "✓" : ""}</button>
                  <time>{stop.time}</time>
                  <div><h3>{stop.name}</h3><p>{stop.note}</p>{stop.ticket && <div className="info-chip">票务 · {stop.ticket}</div>}{stop.veteran && <div className="veteran-chip">优待证 · {stop.veteran}</div>}<div className="quick-actions">{stop.place && <a href={amap(stop.place)} target="_blank" rel="noreferrer">高德导航</a>}{stop.place && <a href={apple(stop.place)} target="_blank" rel="noreferrer">Apple地图</a>}</div></div>
                </article>)}
              </div>
              <label className="notes-box"><span>当天备注</span><textarea value={notes[day.id] || ""} onChange={e => setNotes(v => ({ ...v, [day.id]: e.target.value }))} placeholder="记录改线、费用、停车位置、房号……" /></label>
            </section>
          })}

          <section className="backup-card">
            <p className="eyebrow">PLAN B</p><h2>独库关闭时的正确备选</h2>
            <div className="backup-route">独山子 <b>→</b> G30 <b>→</b> 赛里木湖 <b>→</b> 清水河 <b>→</b> 伊宁 <b>→</b> 伊昭 <b>→</b> 夏塔 <b>→</b> 特克斯 / 喀拉峻 <b>→</b> 那拉提 <b>→</b> 伊宁</div>
            <p>放弃独库北段和唐布拉，不要从独山子硬绕那拉提。赛湖提前到前段，最后一天改为伊宁机动日。</p>
          </section>

          <section className="backup-card forest">
            <p className="eyebrow">WEATHER SWAP</p><h2>库尔德宁只做天气替补</h2>
            <p>8月3日晴：保留喀拉峻。持续阴雨、低云遮雪山：改为“那拉提 → 库尔德宁 → 特克斯”，不要两个都去。库尔德宁的云杉森林在阴雨天更稳。</p>
            <div className="quick-actions"><a href={amap("库尔德宁景区")} target="_blank" rel="noreferrer">高德查看库尔德宁</a><a href={apple("库尔德宁景区")} target="_blank" rel="noreferrer">Apple地图</a></div>
          </section>
        </div>
      )}

      {tab === "stays" && (
        <div className="view-stack">
          <section className="page-intro"><p className="eyebrow">STAYS</p><h2>沿途住宿备选</h2><p>连锁优先，唐布拉和夏塔门口才接受民宿。¥为相对档位，不是实时房价；最终比较含早、取消政策和停车。</p></section>
          <div className="filter-scroll"><button className={hotelFilter === "all" ? "active" : ""} onClick={() => setHotelFilter("all")}>全部</button>{hotelGroups.map(g => <button key={g.id} className={hotelFilter === g.id ? "active" : ""} onClick={() => setHotelFilter(g.id)}>{g.title}</button>)}</div>
          {hotelGroups.filter(g => hotelFilter === "all" || hotelFilter === g.id).map(group => <section className="hotel-group" key={group.id}>
            <div className="hotel-group-head"><div><span>{group.date}</span><h2>{group.title}</h2></div><p>{group.tip}</p></div>
            <div className="hotel-list">{group.hotels.map(h => <article className="hotel-card" key={h.name}><div className="hotel-top"><span className={`level ${h.level}`}>{h.level}</span><span className="price-level">{h.price}</span></div><h3>{h.name}</h3><p className="hotel-area">📍 {h.area}</p><p>{h.why}</p><div className="quick-actions"><a href={amap(h.name)} target="_blank" rel="noreferrer">高德</a><a href={apple(h.name)} target="_blank" rel="noreferrer">Apple地图</a><a href={ctrip(h.name)} target="_blank" rel="noreferrer">携程比价</a></div></article>)}</div>
          </section>)}
        </div>
      )}

      {tab === "kit" && (
        <div className="view-stack">
          <section className="page-intro"><p className="eyebrow">TRIP KIT</p><h2>票务、证件与应急</h2><p>最容易损失钱的是给优待证持有人买了普通成人套票。能选“免门票+车票/自驾服务”就不要先买全价再赌退款。</p></section>

          <section className="section-block">
            <div className="section-title"><div><p className="eyebrow">BEFORE GO</p><h2>出发准备</h2></div><span className="counter">{Object.values(prep).filter(Boolean).length}/{prepItems.length}</span></div>
            <div className="prep-list">{prepItems.map((item, i) => <label key={item} className={prep[i] ? "checked" : ""}><input type="checkbox" checked={!!prep[i]} onChange={() => setPrep(v => ({ ...v, [i]: !v[i] }))}/><span>{item}</span></label>)}</div>
          </section>

          <section className="ticket-grid">{ticketCards.map(card => <article className="ticket-card" key={card.name}><div className="ticket-top"><span>{card.when}</span><b>{card.urgency}</b></div><h3>{card.name}</h3><p>{card.cost}</p><div className="veteran-line">🎖 {card.veteran}</div><small>官方渠道：{card.channel}</small><a className="call-link" href={`tel:${card.phone}`}>电话咨询 {card.phone.replace(/(\d{4})(\d+)/, '$1-$2')}</a></article>)}</section>

          <section className="section-block veteran-panel">
            <p className="eyebrow">VETERAN PASS</p><h2>优待证预计节省约¥285</h2>
            <div className="saving-row"><span>那拉提 ¥95</span><span>喀拉峻 ¥80</span><span>夏塔 ¥40</span><span>赛湖 ¥70</span></div>
            <p>携带身份证原件、全国统一退役军人优待证原件，退伍证作为备用。免首道门票不等于免区间车、自驾服务、索道或骑马。</p>
          </section>

          <section className="section-block">
            <p className="eyebrow">EMERGENCY</p><h2>快捷联系</h2>
            <div className="emergency-grid"><a href="tel:12122"><b>12122</b><span>高速交警 / 救援</span></a><a href="tel:12328"><b>12328</b><span>交通运输服务</span></a><a href="tel:110"><b>110</b><span>报警求助</span></a><a href="tel:120"><b>120</b><span>医疗急救</span></a></div>
          </section>

          <section className="section-block data-tools">
            <p className="eyebrow">LOCAL DATA</p><h2>本机进度管理</h2><p>行程勾选和备注只保存在当前浏览器，不上传账号。换手机或清理浏览器数据前先备份。</p>
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
