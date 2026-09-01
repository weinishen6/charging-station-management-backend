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
for (const label of ["订单状态", "充电规模", "收入概览", "风险待办", "双枪协同", "商户单号", "重卡", "已完成", "应收金额"]) {
  includes(list, label, "订单列表");
}
includes(list, 'title="包括营销活动、优惠券和会员卡折扣等优惠"', "优惠金额悬停提示");
if (list.includes('class="order-kpi-note-v21"')) throw new Error("收入概览仍展示优惠说明文字");
for (const label of ["充电时间", "持续时间", "订单原价", "优惠抵扣", "结算金额", "订单金额", "电费原价", "服务费原价", "优惠金额", "折扣金额", "手续费金额", "实收金额", "服务费金额", "退款金额"]) {
  includes(list, label, "订单分组表头");
}
for (const label of ["完整金额", "关键字段"]) includes(list, label, "订单字段视图");
includes(list, "免费订单", "免费订单标识");
includes(list, "请输入订单编号/商户订单号/设备编号", "订单查询提示词");
includes(list, "所属场站 / 运营商", "订单归属字段");
if (list.includes("主订单口径") || list.includes("需运营处理") || list.includes("支付超时") || list.includes("商户：")) {
  throw new Error("订单列表仍包含已删除文案或风险指标");
}
if (list.includes("今日") || list.includes("昨日") || list.includes("自定义")) throw new Error("订单顶部仍包含独立统计周期按钮");
for (const method of ["预付费", "钱包支付", "即充即付"]) includes(context.filterConfig().map((item) => JSON.stringify(item)).join(""), method, "支付方式筛选");
includes(JSON.stringify(context.filterConfig()), "订单类型", "免费订单筛选");
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
const groups = context.navigation.map((group) => group.group);
if (groups.at(-1) !== "用户管理" || groups.at(-2) !== "企业管理") throw new Error("菜单顺序未调整为企业管理在前、用户管理置底");

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
includes(overview, "充电枪编号", "订单详情充电枪编号");
for (const chart of ["枪线温度", "车辆 SOC", "输出电流", "输出功率"]) includes(overview, chart, "订单运行曲线");
includes(overview, "order-chart-scope-v20", "双枪曲线枪级切换");

context.state.detailTab = "充电枪明细";
context.render();
const guns = elements.get("content").innerHTML;
for (const label of ["主枪", "辅枪", "枪级计量汇总"]) includes(guns, label, "充电枪明细");
if (guns.includes("同一充电桩的主枪、辅枪服务同一辆重卡")) throw new Error("枪明细仍包含已删除说明文案");

context.state.detailTab = "费用与分账";
context.render();
const fee = elements.get("content").innerHTML;
for (const label of ["平台分时计费明细", "设备上报分时计费明细", "设备侧尖峰平谷原始计量数据", "价格类别", "尖", "峰", "平", "总计", "对账结果", "优惠与支付", "参与方分账与到账", "支付手续费", "分账手续费", "提现手续费", "运营商", "平台方"]) {
  includes(fee, label, "费用与分账");
}
if ((fee.match(/<strong>总计<\/strong>/g) || []).length !== 2) throw new Error("两张计费表未各自保留一条总计");
if ((fee.match(/对账结果：/g) || []).length !== 2) throw new Error("两张计费表总计行未展示对账结果");
if (fee.includes("billing-reconcile-v22")) throw new Error("计费表下方仍展示重复汇总卡");
if (fee.includes("＋") || fee.includes("−") || fee.includes("＝") || fee.includes("净到账 =")) throw new Error("费用与分账仍包含已删除的算式符号或说明");
if (fee.includes(">电费明细<") || fee.includes("服务费时段明细") || fee.includes("仅平台计算")) throw new Error("费用与分账仍包含重复计费明细模块");
for (const duplicate of ["商户订单号", "设备上报金额", "金额差异"]) {
  const paymentStart = fee.indexOf("优惠与支付");
  const settlementStart = fee.indexOf("参与方分账与到账");
  if (fee.slice(paymentStart, settlementStart).includes(duplicate)) throw new Error(`优惠与支付仍包含重复字段：${duplicate}`);
}

const firstOrder = context.orders[0];
if (firstOrder.status !== "已完成" || firstOrder.refundStatus !== "已退款") throw new Error("首条订单未形成已退款示例");
context.state.detail = { kind: "order", id: firstOrder.id, title: "充电订单详情" };
context.state.detailTab = "退款记录";
context.render();
const refund = elements.get("content").innerHTML;
for (const label of ["退款状态", "累计退款金额", "退款后实收", "充电中断补偿", "已退款"]) includes(refund, label, "首条订单退款记录");

context.state.detail = null;
context.state.orderExportPreview = true;
context.state.page = "充电订单";
context.render();
const exportPreview = elements.get("content").innerHTML;
for (const label of ["Excel 预览", "订单基础信息", "充电过程信息", "订单原价信息", "订单出账信息", "订单结算信息", "活动优惠信息", "平台分佣", "商户单号", "持续时间（分钟）", "会员折扣金额", "手续费金额", "平台分佣金额", "平台分佣比例（%）"]) {
  includes(exportPreview, label, "订单导出预览");
}
for (const removed of ["业务订单号", "设备类型", "分账类型", "税费信息", "渠道与平台抽减", "渠道抽减", "订单抽减金额", "卡券抽减金额", "抽减比例 (%)"]) {
  if (exportPreview.includes(removed)) throw new Error(`订单导出仍包含已删除字段：${removed}`);
}
const exportRow = context.exportOrderRowV20(context.orders[0]);
for (const index of [7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26]) {
  if (!/^\d+\.\d{2}$/.test(String(exportRow[index]))) throw new Error(`导出字段未保留两位小数：${index}`);
}
context.state.orderExportPreview = false;

const refundForm = context.refundForm(context.orders[0]);
for (const label of ["可退款金额", "disabled", "退款费用 1", "费用承担方", "添加退款费用", "同一申请可同时包含平台费用和运营商费用", "再次申请时，系统自动以剩余金额为上限"]) includes(refundForm, label, "多费用退费申请");

const orderNav = context.navigation.find((group) => group.group === "订单管理").items.flat();
const userNav = context.navigation.find((group) => group.group === "用户管理").items.flat();
if (orderNav.includes("免费充电") || userNav.includes("免费用户配置")) throw new Error("免费订单或免费用户仍保留独立菜单");

context.state.page = "用户管理";
context.state.detail = null;
context.state.userManagementTab = "免费用户";
context.state.keyword = "";
context.state.filters = {};
context.render();
const freeUsers = elements.get("content").innerHTML;
for (const label of ["用户列表", "用户分组", "免费用户", "请输入用户昵称或手机号", "运营商维度", "场站维度", "免费额度"]) includes(freeUsers, label, "免费用户页签");
if (freeUsers.includes("规则编号") || freeUsers.includes("单次额度")) throw new Error("免费用户列表仍包含已删除字段");
const freeForm = context.freeUserForm(null);
for (const label of ["搜索用户昵称或手机号", "元/月", "配置维度", "范围方式", "运营商维度", "场站维度", "全部", "指定"]) includes(freeForm, label, "免费用户配置");
if (freeForm.includes("f-limit") || freeForm.includes("单次额度")) throw new Error("免费用户表单仍包含单次额度");

context.state.page = "充电投诉";
context.state.filters = {};
const complaintFilters = JSON.stringify(context.filterConfig());
includes(complaintFilters, "处理状态", "充电投诉筛选");
for (const label of ["投诉类型", "所属运营商", "所属场站", "提交时间", "dateRange"]) includes(complaintFilters, label, "充电投诉筛选");
if (complaintFilters.includes("业务状态")) throw new Error("充电投诉仍使用业务状态筛选名称");
if (complaintFilters.includes("责任归属")) throw new Error("充电投诉仍包含责任归属筛选");
const complaintActions = context.menuActions("complaint").flat();
if (complaintActions.includes("编辑投诉") || complaintActions.includes("edit")) throw new Error("充电投诉仍包含编辑入口");
for (const action of ["查看详情", "处理投诉", "提交退费申请"]) includes(complaintActions.join("/"), action, "充电投诉操作");
context.state.detail = null;
context.state.keyword = "";
context.render();
const complaintList = elements.get("content").innerHTML;
for (const label of ["投诉总数", "待处理", "处理中", "退费处理中", "已完结", "投诉单号", "提交时间", "订单号 / 商户单号", "用户信息", "所属场站 / 运营商", "投诉类型 / 内容", "处理状态", "退款情况", "处理意见"]) includes(complaintList, label, "充电投诉列表");
includes(complaintList, 'data-kind="order"', "投诉订单跳转");
if (complaintList.includes("新增投诉") || complaintList.includes("逾期未处理") || complaintList.includes("责任归属") || complaintList.includes("处理时效")) throw new Error("充电投诉仍包含已删除入口或字段");
const pendingComplaint = context.complaints.find((item) => item.status !== "已完结");
context.openComplaintProcessV24(pendingComplaint);
for (const label of ["处理意见", "暂存", "提交并完结"]) includes(elements.get("modalBody").innerHTML + elements.get("modalActions").innerHTML, label, "投诉处理弹窗");
context.openDetail("complaint", pendingComplaint.id);
let complaintDetail = elements.get("content").innerHTML;
for (const tab of ["投诉信息", "处理记录", "关联订单", "退款记录"]) includes(complaintDetail, `data-tab="${tab}"`, "投诉详情页签");
includes(complaintDetail, "处理投诉", "投诉详情处理入口");
context.state.detailTab = "处理记录";
context.render();
complaintDetail = elements.get("content").innerHTML;
for (const label of ["记录时间", "处理动作", "处理人", "处理意见", "处理状态"]) includes(complaintDetail, label, "投诉处理记录");
context.state.detailTab = "关联订单";
context.render();
complaintDetail = elements.get("content").innerHTML;
for (const label of ["平台订单号", "商户单号", "订单金额", "充电枪编号"]) includes(complaintDetail, label, "投诉关联订单");

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
