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
for (const label of ["订单状态", "充电规模", "收入概览", "风险待办", "双枪协同", "商户订单号", "应付 / 优惠 / 实收", "重卡"]) {
  includes(list, label, "订单列表");
}
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

console.log("Charging order route and detail checks passed");
