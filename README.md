# 充电桩运营管理后台交互原型

这是一个可直接运行的充电桩运营管理后台前端原型，采用原生 HTML、CSS 和 JavaScript 实现，页面由 ESM Worker 返回，无第三方运行时依赖。

## 已覆盖模块

- 资产运营：站点管理、充电桩管理、充电枪管理、计费管理与调价策略
- 交易中心：充电订单、退款记录、占位订单、免费充电
- 营销中心：活动投放、用户分组
- 财务管理：财务报表、账单对账、退款审核、发票管理、自定义报表
- 客户管理：用户管理、免费用户配置

原型包含列表、统一筛选弹窗、字段设置、分页、操作菜单、详情页、表单抽屉、确认弹窗、设备二维码、计费明细、分账与对账等交互状态。

## 项目结构

```text
.
├── worker/index.js              # 前端页面、样式、模拟数据和交互逻辑
├── scripts/build.sh             # 构建脚本
├── scripts/validate-artifact.mjs# 构建产物校验
├── .openai/hosting.json         # 部署配置
└── package.json
```

## 构建与校验

需要 Node.js 18 或更高版本。

```bash
npm run build
npm run validate
```

构建结果位于 `dist/`：

```text
dist/
├── .openai/hosting.json
└── server/index.js
```

`dist/server/index.js` 导出标准的 `default.fetch(request, env, ctx)`，可运行在兼容 Web Fetch API 的 Worker 环境中。

## 开发说明

页面功能统一维护在 `worker/index.js`，请不要直接修改 `dist/` 下的构建结果。原型数据均为前端模拟数据，适合产品评审、交互演示和后续前后端接口联调。
