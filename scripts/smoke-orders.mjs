import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("YunSuChong_Interactive_Prototype.html", "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("Inline script missing");

class StubElement {
  constructor() {
    this.innerHTML = "";
    this.textContent = "";
    this.value = "";
    this.checked = false;
    this.style = {};
    this.dataset = {};
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  }
  addEventListener() {}
  getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 100, height: 100 }; }
}

const elements = new Map();
const document = {
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, new StubElement());
    return elements.get(id);
  },
  addEventListener() {},
  querySelectorAll() { return []; },
  querySelector() { return null; },
};
const window = { document, scrollTo() {}, innerWidth: 1440, innerHeight: 1000 };
const context = vm.createContext({ document, window, console, setTimeout, clearTimeout, Event: class Event {} });
vm.runInContext(match[1], context);

function includes(value, expected, label) {
  if (!value.includes(expected)) throw new Error(`${label}: missing ${expected}`);
}

context.state.page = "充电订单";
context.state.detail = null;
context.state.keyword = "";
context.state.filters = {};
context.state.orderRange = "今日";
context.render();
const list = elements.get("content").innerHTML;
for (const label of ["订单状态", "充电规模", "收入概览", "风险待办", "双枪协同", "商户单号", "应付 / 优惠 / 实收", "重卡", "已完成", "应收金额"]) {
  includes(list, label, "订单列表");
}
includes(list, "请输入订单编号/商户订单号/设备编号", "订单查询提示词");
includes(list, "所属场站 / 运营商", "订单归属字段");
if (list.includes("主订单口径") || list.includes("需运营处理") || list.includes("支付超时") || list.includes("商户：")) {
  throw new Error("订单列表仍包含已删除文案或风险指标");
}
if (list.includes("今日") || list.includes("昨日") || list.includes("自定义")) throw new Error("订单顶部仍包含独立统计周期按钮");
for (const method of ["预付费", "钱包支付", "即充即付"]) includes(context.filterConfig().map((item) => JSON.stringify(item)).join(""), method, "支付方式筛选");
if (context.state.filters.createdStart !== "2026-08-01" || context.state.filters.createdEnd !== "2026-08-31") {
  throw new Error("订单下单时间未默认当前数据月份");
}
context.state.orderOnlyAbnormal = true;
context.render();
const abnormalList = elements.get("content").innerHTML;
includes(abnormalList, "abnormal-selected-v20", "仅看异常订单选中状态");
if (!abnormalList.includes("✓ 仅看异常订单")) throw new Error("异常订单筛选未展示选中反馈");
context.state.orderOnlyAbnormal = false;
if (list.includes("总服务费") || list.includes("总手续费")) throw new Error("订单顶部仍平铺费用构成或结算成本");

const heavy = context.orders.find((order) => order.chargeMode === "双枪协同");
if (!heavy || heavy.gunSessions.length !== 2) throw new Error("双枪重卡订单模型不完整");

context.state.detail = { kind: "order", id: heavy.id, title: "充电订单详情" };
context.state.detailTab = "订单概览";
context.render();
const overview = elements.get("content").innerHTML;
for (const tab of ["订单概览", "充电枪明细", "费用与分账", "退款记录"]) includes(overview, `data-tab="${tab}"`, "订单详情页签");
for (const oldTab of ["分时计费", "优惠与支付", "手续费与分账"]) {
  if (overview.includes(`data-tab="${oldTab}"`)) throw new Error(`仍包含旧页签：${oldTab}`);
}
includes(overview, "充电品牌", "订单详情充电品牌");
for (const chart of ["枪线温度", "车辆 SOC", "输出电流", "输出功率"]) includes(overview, chart, "订单运行曲线");
includes(overview, "order-chart-scope-v20", "双枪曲线枪级切换");

context.state.detailTab = "充电枪明细";
context.render();
const guns = elements.get("content").innerHTML;
for (const label of ["主枪", "辅枪", "枪级计量汇总"]) includes(guns, label, "充电枪明细");

context.state.detailTab = "费用与分账";
context.render();
const fee = elements.get("content").innerHTML;
for (const label of ["分时计费明细", "优惠与支付", "参与方分账与净到账", "支付手续费", "分账手续费", "提现手续费", "运营商", "平台方"]) {
  includes(fee, label, "费用与分账");
}

context.state.detail = null;
context.state.orderExportPreview = true;
context.state.page = "充电订单";
context.render();
const exportPreview = elements.get("content").innerHTML;
for (const label of ["Excel 预览", "订单基础信息", "充电过程信息", "订单原价信息", "订单出账信息", "订单结算信息", "活动优惠信息", "渠道与平台抽减", "税费信息"]) {
  includes(exportPreview, label, "订单导出预览");
}
context.state.orderExportPreview = false;

const stationForm = context.stationForm(context.stations[0]);
includes(stationForm, "服务与支付设置", "场站服务设置");
includes(stationForm, "服务设施", "场站服务设施");
for (const method of ["预付费", "钱包支付", "即充即付"]) includes(stationForm, method, "场站支付方式");

context.state.detail = { kind: "station", id: context.stations[0].id, title: context.stations[0].name };
context.state.detailTab = "基础信息";
context.render();
includes(elements.get("content").innerHTML, "服务与支付设置", "场站详情服务支付回显");

context.state.detail = { kind: "user", id: context.users[0].id, title: context.users[0].nickname };
context.state.detailTab = "车辆与 VIN";
context.render();
includes(elements.get("content").innerHTML, "车辆类型", "用户车辆类型");
includes(elements.get("content").innerHTML, "重卡", "用户重卡车辆类型");

console.log("Charging order route and detail checks passed");
