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
const context = vm.createContext({
  document,
  window,
  console,
  setTimeout,
  clearTimeout,
  Event: class Event {},
});
vm.runInContext(match[1], context);

function assertIncludes(value, expected, label) {
  if (!value.includes(expected)) throw new Error(`${label}: missing ${expected}`);
}

context.state.page = "活动管理";
context.state.detail = null;
context.render();
assertIncludes(elements.get("content").innerHTML, "activity-launch-grid", "活动管理");
assertIncludes(elements.get("content").innerHTML, "campaign-stations-v6", "参与场站明细入口");
assertIncludes(elements.get("content").innerHTML, "campaign-participants-v6", "参与人员明细入口");
if (elements.get("content").innerHTML.includes(`${context.campaigns[0].id} · ${context.campaigns[0].title}`)) {
  throw new Error("活动名称下仍展示编号或标题小字");
}
const campaignForm = context.campaignFormV6(null);
assertIncludes(campaignForm, "活动信息", "活动配置");
assertIncludes(campaignForm, "活动配置", "活动配置");
assertIncludes(campaignForm, "人员维度", "活动对象");
assertIncludes(campaignForm, "场站维度", "活动对象");
assertIncludes(campaignForm, "运营商维度", "活动对象");
assertIncludes(campaignForm, "campaign-target-dimension", "活动对象维度单选");
if (campaignForm.includes("campaign-person-scope") || campaignForm.includes("campaign-station-scope")) {
  throw new Error("活动对象仍同时展示三个维度的范围配置");
}
if (campaignForm.includes("活动预算") || campaignForm.includes("预览效果") || campaignForm.includes("活动介绍与图片")) {
  throw new Error("活动配置仍包含已删除字段");
}

context.state.detail = { kind: "campaign", id: context.campaigns[0].id, title: context.campaigns[0].name };
context.state.detailTab = "活动对象";
context.render();
assertIncludes(elements.get("content").innerHTML, "campaign-target-summary-card", "活动对象详情层级");
assertIncludes(elements.get("content").innerHTML, "campaign-detail-section-title", "活动对象详情标题");
context.state.detailTab = "效果数据";
context.render();
assertIncludes(elements.get("content").innerHTML, "campaignEffectStart", "效果数据日期筛选");
assertIncludes(elements.get("content").innerHTML, "2026-08-26", "效果数据默认当天");
assertIncludes(elements.get("content").innerHTML, "订单原价", "效果数据明细");
context.state.detail = null;

context.state.page = "用户管理";
context.state.userManagementTab = "用户分组";
context.render();
assertIncludes(elements.get("content").innerHTML, "新建用户分组", "用户分组");
assertIncludes(elements.get("content").innerHTML, "动态规则", "用户分组");

context.state.page = "会员卡管理";
context.state.memberTab = "会员卡产品";
context.render();
assertIncludes(elements.get("content").innerHTML, "持卡会员", "会员卡管理");
assertIncludes(elements.get("content").innerHTML, "member-product-stations-v7", "会员站明细入口");
if (elements.get("content").innerHTML.includes("member-code") || elements.get("content").innerHTML.includes(context.memberships[0].id + " ·")) {
  throw new Error("会员卡产品卡片仍展示会员卡编号");
}
const membershipForm = context.membershipFormV8(null);
assertIncludes(membershipForm, "启用状态", "会员卡启停配置");
if (membershipForm.includes("使用限制") || membershipForm.includes("f-limit")) {
  throw new Error("会员卡产品仍包含使用限制字段");
}
if (membershipForm.includes("参与会员站") || membershipForm.includes("activity-station-list")) {
  throw new Error("新建会员卡仍包含参与会员站配置");
}
context.state.memberTab = "持卡会员";
context.render();
assertIncludes(elements.get("content").innerHTML, "member-holder-menu-v8", "持卡会员更多操作");
if (elements.get("content").innerHTML.includes("****")) {
  throw new Error("持卡会员手机号仍使用星号脱敏");
}
if (elements.get("content").innerHTML.includes("查看期限、剩余天数")) {
  throw new Error("持卡会员页仍展示重复标题说明");
}
context.openMemberUsageV7(context.memberHolders[0].id);
assertIncludes(elements.get("modalBody").innerHTML, "<table", "会员卡使用记录表格");
assertIncludes(elements.get("modalBody").innerHTML, "优惠后服务费", "会员卡使用记录字段");
context.state.memberTab = "会员站";
context.render();
assertIncludes(elements.get("content").innerHTML, "配置会员站", "会员站配置入口");
assertIncludes(elements.get("content").innerHTML, "移除会员站", "移除会员站入口");
if (elements.get("content").innerHTML.includes("已参与") || elements.get("content").innerHTML.includes("暂未配置会员卡产品")) {
  throw new Error("会员站列表仍展示冗余参与标识或未配置状态");
}
if (elements.get("content").innerHTML.includes("批量配置")) {
  throw new Error("会员站页仍展示批量配置按钮");
}
const stationDrawer = context.memberStationConfigBodyV8();
assertIncludes(stationDrawer, "全选场站", "会员站全选");
assertIncludes(stationDrawer, "member-product-rail-v8", "会员卡产品滚动区域");
if (context.memberships.length < 10) {
  throw new Error("会员站配置未呈现 10 个会员卡产品");
}
context.state.memberTab = "会员订单";
context.render();
assertIncludes(elements.get("content").innerHTML, "会员折扣", "会员订单");
assertIncludes(elements.get("content").innerHTML, "应付金额", "会员订单应付金额");
assertIncludes(elements.get("content").innerHTML, "用户名称 / 订单编号", "会员订单查询");
assertIncludes(elements.get("content").innerHTML, "会员卡类型", "会员订单筛选");
if (elements.get("content").innerHTML.includes("充电订单的会员优惠视图")) {
  throw new Error("会员订单页仍展示重复标题说明");
}

context.state.page = "充电桩管理";
context.state.pileView = "cards";
context.render();
const pileCards = elements.get("content").innerHTML;
if (pileCards.includes("pile-select")) throw new Error("充电桩卡片模式仍包含选择框");
if (pileCards.includes("批量操作")) throw new Error("充电桩卡片模式仍包含批量操作");

context.state.page = "充电桩日志";
context.render();
assertIncludes(elements.get("content").innerHTML, "按老平台进行迁移", "充电桩日志");
context.state.page = "发票管理";
context.render();
assertIncludes(elements.get("content").innerHTML, "按老平台进行迁移", "发票管理");

context.state.page = "场站管理";
context.state.detail = null;
const stationForm = context.stationFormV9(context.stations[0]);
assertIncludes(stationForm, "联系方式", "场站联系方式");
assertIncludes(stationForm, 'type="time"', "营业时间选择器");
assertIncludes(stationForm, 'class="field-label required" for="f-plan">收费方案', "收费方案必填");
const stationActions = context.menuActions("station").map((item) => item[0]);
if (stationActions.includes("设备监控") || stationActions.includes("查看订单")) {
  throw new Error("场站列表操作栏仍包含设备监控或查看订单");
}
const stationMenuButton = new StubElement();
stationMenuButton.dataset = { kind: "station", id: context.stations[0].id };
context.showMenu(stationMenuButton);
assertIncludes(elements.get("actionMenu").innerHTML, "查看详情", "场站更多菜单");
assertIncludes(elements.get("actionMenu").innerHTML, "编辑场站", "场站更多菜单");
assertIncludes(elements.get("actionMenu").innerHTML, "删除场站", "场站更多菜单");
if (elements.get("actionMenu").innerHTML.includes("设备监控") || elements.get("actionMenu").innerHTML.includes("查看订单")) {
  throw new Error("实际渲染的场站更多菜单仍包含旧入口");
}
context.state.detail = { kind: "station", id: context.stations[0].id, title: context.stations[0].name };
context.state.detailTab = "基础信息";
context.render();
assertIncludes(elements.get("content").innerHTML, "station-photo-carousel", "场站图片轮播");
assertIncludes(elements.get("content").innerHTML, "联系方式", "场站详情联系方式");
if (elements.get("content").innerHTML.includes('data-kind="station" data-id="' + context.stations[0].id + '">编辑')) {
  throw new Error("场站详情仍展示编辑入口");
}
context.state.detailTab = "收费方案";
context.render();
assertIncludes(elements.get("content").innerHTML, "station-month-dot", "月度收费方案切换");
context.state.detailTab = "充电订单";
context.render();
assertIncludes(elements.get("content").innerHTML, "商户订单号", "场站订单商户号");
assertIncludes(elements.get("content").innerHTML, "手续费 (元)", "场站订单手续费");

const pricingForm = context.planFormV9(null);
assertIncludes(pricingForm, "深谷", "深谷价格类别");
if (pricingForm.includes("配置名称")) throw new Error("收费方案仍包含配置名称字段");
assertIncludes(context.periodTableV9(context.plans[0].periods), "电费", "收费详情价格拼接示例");

console.log("Inline script and key route render checks passed");
