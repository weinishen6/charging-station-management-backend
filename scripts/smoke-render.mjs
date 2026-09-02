import fs from "node:fs";
import vm from "node:vm";

const htmlPath = process.argv[2] || "YunSuChong_Interactive_Prototype.html";
const html = fs.readFileSync(htmlPath, "utf8");
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
assertIncludes(pileCards, "批量导入", "充电桩批量导入入口");
assertIncludes(pileCards, "设备类型", "充电桩统计新维度");
if (pileCards.includes("连接状态")) throw new Error("充电桩顶部仍包含重复的连接状态统计");
const pileForm = context.pileForm(context.piles[0]);
if (pileForm.includes("充电枪配置") || pileForm.includes("f-gun-type")) {
  throw new Error("充电桩表单仍包含充电枪配置区域");
}
if (pileForm.includes("充电枪由设备协议自动上报，请在")) {
  throw new Error("充电桩表单仍包含已删除的自动上报提示文案");
}
context.openPileImportV11();
assertIncludes(elements.get("modalBody").innerHTML, "下载导入模板", "充电桩导入模板入口");
assertIncludes(elements.get("modalBody").innerHTML, "pileImportFile", "充电桩上传文件入口");
if (elements.get("modalBody").innerHTML.includes(".csv") || elements.get("modalBody").innerHTML.includes("导入前将校验设备编码唯一性")) {
  throw new Error("批量导入弹窗仍包含 CSV 格式或已删除的校验说明");
}
context.state.pileView = "list";
context.state.selectedPiles = [context.piles[0].id];
context.render();
const pileListV12 = elements.get("content").innerHTML;
assertIncludes(pileListV12, "批量导出二维码", "充电桩批量二维码导出");
assertIncludes(pileListV12, "批量固件升级", "充电桩批量固件升级入口");
assertIncludes(pileListV12, "批量重启", "充电桩批量重启入口");
assertIncludes(pileListV12, "批量设备对时", "充电桩批量设备对时入口");
if (!pileListV12.includes("disabled")) throw new Error("充电桩暂未开放的批量操作未禁用");
const pileActionsV12 = context.menuActions("pile");
for (const label of ["重启设备", "设备对时", "固件升级"]) {
  const item = pileActionsV12.find((action) => action[0] === label);
  if (!item || !item[2] || !item[2].disabled) throw new Error(`${label} 未显示为禁用操作`);
}
context.confirmDelete("station", context.stations[0].id);
assertIncludes(elements.get("modalBody").innerHTML, "已绑定设备存在进行中订单时将禁止删除", "删除提示文案");
if (elements.get("modalBody").innerHTML.includes("关联业务记录")) throw new Error("删除提示仍包含关联业务记录");
context.state.detail = { kind: "pile", id: context.piles[0].id, title: context.piles[0].name };
context.state.detailTab = "设备信息";
context.render();
assertIncludes(elements.get("content").innerHTML, 'data-tab="充电枪"', "充电桩详情充电枪页签");
context.state.detailTab = "充电枪";
context.render();
assertIncludes(elements.get("content").innerHTML, "充电枪信息", "充电桩详情充电枪信息");
assertIncludes(elements.get("content").innerHTML, "在线状态", "充电桩详情充电枪在线状态");
context.state.detail = null;

context.state.page = "活动管理";
context.render();
assertIncludes(elements.get("content").innerHTML, "任务状态", "活动列表任务状态");
const campaignApprovalForm = context.campaignForm(context.campaigns[0]);
assertIncludes(campaignApprovalForm, "是否需要审批", "活动审批配置");
assertIncludes(campaignApprovalForm, "审批运营商", "活动审批运营商");
assertIncludes(campaignApprovalForm, "审批人员", "活动审批人员");
context.state.detail = { kind: "campaign", id: context.campaigns[0].id, title: context.campaigns[0].name };
context.state.detailTab = "活动信息";
context.render();
assertIncludes(elements.get("content").innerHTML, "任务状态", "活动详情任务状态");
assertIncludes(elements.get("content").innerHTML, "是否需要审批", "活动详情审批方式");
context.state.detail = null;

context.state.page = "充电枪管理";
context.state.gunView = "list";
context.state.keyword = "";
context.state.filters = {};
context.render();
const gunList = elements.get("content").innerHTML;
assertIncludes(gunList, "充电状态", "充电枪充电状态维度");
assertIncludes(gunList, "插枪", "充电枪插枪统计");
assertIncludes(gunList, "在线状态", "充电枪在线状态维度");
assertIncludes(gunList, "离线", "充电枪离线统计");
assertIncludes(gunList, "故障状态", "充电枪故障独立维度");
assertIncludes(gunList, "树状列表", "充电枪视图切换");
assertIncludes(gunList, "gunSelectAll", "充电枪列表全选");
assertIncludes(gunList, "gun-export-v12", "充电枪列表导出");
if (gunList.includes("新增充电枪")) throw new Error("充电枪列表仍包含新增入口");
assertIncludes(gunList, "交流代表慢充", "枪类型悬停说明");
const gunForm = context.gunFormV11(context.guns[0]);
assertIncludes(gunForm, 'id="f-pile" disabled', "所属充电桩禁用");
assertIncludes(gunForm, 'id="f-type" disabled', "枪类型禁用");
context.state.gunView = "tree";
context.state.expandedGunPiles = [context.guns[0].pileId];
context.render();
const gunTree = elements.get("content").innerHTML;
assertIncludes(gunTree, "gun-tree-table", "充电枪树状列表");
assertIncludes(gunTree, context.guns[0].id, "树状列表展开充电枪");

context.state.page = "充电桩日志";
context.render();
assertIncludes(elements.get("content").innerHTML, "按老平台进行迁移", "充电桩日志");
context.state.page = "发票管理";
context.render();
assertIncludes(elements.get("content").innerHTML, "按老平台进行迁移", "发票管理");

context.state.page = "场站管理";
context.state.detail = null;
context.state.stationView = "list";
context.state.selectedStations = [context.stations[0].id, context.stations[1].id];
context.render();
const stationOverview = elements.get("content").innerHTML;
assertIncludes(stationOverview, "stationSelectAll", "场站列表全选");
assertIncludes(stationOverview, "station-export-v12", "场站列表导出");
assertIncludes(stationOverview, "导出 Excel（2）", "场站多选导出数量");
assertIncludes(stationOverview, "device-overview-separated", "场站设备统计维度拆分");
assertIncludes(stationOverview, "充电状态", "场站设备充电状态");
assertIncludes(stationOverview, "插枪", "场站设备插枪状态");
assertIncludes(stationOverview, "在线状态", "场站设备在线状态");
assertIncludes(stationOverview, "device-online-fault", "在线设备故障标记");
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

context.state.detail = null;
context.state.page = "用户管理";
context.state.userManagementTab = "用户列表";
context.state.keyword = "";
context.state.filters = {};
context.render();
const userListV14 = elements.get("content").innerHTML;
assertIncludes(userListV14, "启用状态", "用户列表启用状态");
assertIncludes(userListV14, "user-status-switch", "用户启停开关");
assertIncludes(userListV14, "车辆数量", "用户列表车辆数量");
if (!context.users.some((user) => user.vehicles.length > 1)) throw new Error("用户数据未体现多车辆与 VIN");
context.state.detail = { kind: "user", id: context.users[0].id, title: context.users[0].nickname };
context.state.detailTab = "车辆与 VIN";
context.render();
const userVehicleDetailV14 = elements.get("content").innerHTML;
assertIncludes(userVehicleDetailV14, "新增车辆", "用户详情新增车辆");
assertIncludes(userVehicleDetailV14, context.users[0].vehicles[1].vin, "用户详情多车辆 VIN");
for (const tab of ["钱包记录", "充电订单", "参与活动"]) {
  context.state.detailTab = tab;
  context.render();
  assertIncludes(elements.get("content").innerHTML, "user-detail-pager", `${tab}分页`);
  assertIncludes(elements.get("content").innerHTML, "共 ", `${tab}记录总数`);
}
context.state.detail = null;
const manualPanelV14 = context.groupManualPanelV14();
assertIncludes(manualPanelV14, "选择运营商", "手动名单运营商入口");
assertIncludes(manualPanelV14, "选择场站", "手动名单场站入口");
assertIncludes(manualPanelV14, "选择用户", "手动名单用户入口");
assertIncludes(manualPanelV14, "已选择", "手动名单选择数量");
const dynamicPanelV14 = context.groupDynamicPanelV14(null);
assertIncludes(dynamicPanelV14, "浙江省", "地区规则省份选择");
assertIncludes(dynamicPanelV14, "杭州市", "地区规则城市选择");
assertIncludes(dynamicPanelV14, "group-district-v14", "地区规则多选区县");
assertIncludes(dynamicPanelV14, "全部满足", "分组规则全部满足");

context.state.detail = null;
context.state.page = "充电订单";
context.state.keyword = "";
context.state.filters = {};
context.state.orderRange = "今日";
context.render();
const orderListV19 = elements.get("content").innerHTML;
for (const label of ["订单状态", "充电规模", "收入概览", "风险待办"]) {
  assertIncludes(orderListV19, label, "订单顶部统计");
}
for (const label of ["双枪协同", "商户订单号", "应付 / 优惠 / 实收", "重卡"]) {
  assertIncludes(orderListV19, label, "订单列表关键字段");
}
if (orderListV19.includes("总服务费") || orderListV19.includes("总手续费")) {
  throw new Error("订单顶部仍平铺展示费用构成或结算成本");
}
const heavyOrderV19 = context.orders.find((order) => order.chargeMode === "双枪协同");
if (!heavyOrderV19 || heavyOrderV19.gunSessions.length !== 2) {
  throw new Error("重卡订单未按一个主单关联两条枪级明细建模");
}
context.state.detail = { kind: "order", id: heavyOrderV19.id, title: "充电订单详情" };
context.state.detailTab = "订单概览";
context.render();
const orderOverviewDetailV19 = elements.get("content").innerHTML;
for (const tab of ["订单概览", "充电枪明细", "费用与分账", "退款记录"]) {
  assertIncludes(orderOverviewDetailV19, `data-tab="${tab}"`, "订单详情页签");
}
for (const oldTab of ["分时计费", "优惠与支付", "手续费与分账"]) {
  if (orderOverviewDetailV19.includes(`data-tab="${oldTab}"`)) throw new Error(`订单详情仍保留旧页签：${oldTab}`);
}
context.state.detailTab = "充电枪明细";
context.render();
const orderGunDetailV19 = elements.get("content").innerHTML;
assertIncludes(orderGunDetailV19, "主枪", "重卡主枪明细");
assertIncludes(orderGunDetailV19, "辅枪", "重卡辅枪明细");
assertIncludes(orderGunDetailV19, "枪级计量汇总", "枪级计量汇总");
context.state.detailTab = "费用与分账";
context.render();
const orderFeeDetailV19 = elements.get("content").innerHTML;
for (const label of ["分时计费明细", "优惠与支付", "参与方分账与净到账", "支付手续费", "分账手续费", "提现手续费", "运营商", "平台方"]) {
  assertIncludes(orderFeeDetailV19, label, "订单费用与分账看板");
}

console.log("Inline script and key route render checks passed");
