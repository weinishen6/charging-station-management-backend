const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('/workspace/worker/index.js','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
let pass=0,fail=0;const test=(n,c)=>{if(c){pass++;console.log('PASS:',n)}else{fail++;console.log('FAIL:',n)}};
const s={};
const el=()=>({value:'',checked:false,textContent:'',innerHTML:'',style:{},dataset:{},classList:new Proxy({},{get:(t,k)=>({add(){},remove(){},toggle(){},contains(){return false}})}),closest(){return null},querySelector(){return null},querySelectorAll(){return[]},getBoundingClientRect(){return{top:0}}});
s.document={head:{insertAdjacentHTML(){},appendChild(){}},body:el(),addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(){return[]},getElementById(){return el()},createElement(){return el()},createTextNode(){return el()},appendChild(){},insertBefore(){},contains(){return false},getElementsByName(){return[]}};
s.window=s;s.console=console;s.setTimeout=f=>{try{f()}catch(e){}};s.clearTimeout=_=>{};
['Date','Math','JSON','Object','Array','Number','String','Boolean','parseInt','parseFloat','RegExp','Map','Set','NaN','Infinity','undefined','isNaN','isFinite','encodeURIComponent','decodeURIComponent','Promise','Symbol'].forEach(k=>s[k]=globalThis[k]);
s.showToast=_=>{};s.self=s;s.top=s;s.parent=s;s.location={href:'',hash:'',pathname:'/'};s.navigator={userAgent:'node'};s.history={replaceState(){},pushState(){}};
vm.createContext(s);vm.runInContext(src,s,{timeout:15000});

// ===== 1. 会员站 memberStationQueryV39：搜索框仅场站名称 =====
const qHtml=s.memberStationQueryV39();
test('1a. 会员站搜索 仅一个字段：场站名称 (label)', /<label>场站名称<\/label>/.test(qHtml) && qHtml.includes('placeholder="请输入场站名称"'));
test('1b. 会员站搜索 去除 场站信息/编号/地址', !qHtml.includes('场站信息') && !qHtml.includes('场站编号 / 名称 / 地址') && !qHtml.includes('场站编号') && !/所属运营商/.test(qHtml) && !/参与状态/.test(qHtml));
// ===== 2. 会员站筛选仅会员卡产品 =====
// popover 里只有一个 section: 会员卡产品
const popover = qHtml.slice(qHtml.indexOf('<div class="filter-title">筛选选项</div>'));
test('2a. 会员站筛选 含 会员卡产品 select', popover.includes('<label class="field-label">会员卡产品</label>'));
test('2b. 会员站筛选 无 其他筛选字段 (无运营商/参与状态/场站状态)', !/<label[^>]*>[^<]*(运营商|参与状态|场站状态)[^<]*<\/label>/.test(popover));

// ===== 3. 会员站卡片 无已参与/未参与 =====
const cardV39=s.memberStationCardV39(s.stations[0]);
test('3a. V39 卡片 无 已参与/未参与 徽标', !cardV39.includes('已参与') && !cardV39.includes('未参与'));
const cardV7=s.memberStationCardV7(s.stations[0]);
test('3b. V7 卡片 无 已参与/未参与 徽标', !cardV7.includes('已参与') && !cardV7.includes('未参与'));

// ===== 4. 会员管理 删除会员订单 Tab (V4/V7/V8) =====
function captureTabs(renderFn){
  let captured='';
  s.$=()=>{const o={};Object.defineProperty(o,'innerHTML',{set(v){captured=v},get(){return ''}});return o};
  try{renderFn()}catch(e){}
  const tbStart=captured.indexOf('<div class="member-tabs">');
  if(tbStart===-1)return null;
  const tbEnd=captured.indexOf('</div>',tbStart);
  return captured.slice(tbStart,tbEnd);
}
const tabsV4=captureTabs(s.renderMembershipsV4)||'';
const tabsV7=captureTabs(s.renderMembershipsV7)||'';
const tabsV8=captureTabs(s.renderMembershipsV8)||'';
test('4a. V4 Tab 列表 无 会员订单', !tabsV4.includes('>会员订单<'));
test('4b. V7 Tab 列表 无 会员订单', !tabsV7.includes('>会员订单<'));
test('4c. V8 Tab 列表 无 会员订单', !tabsV8.includes('>会员订单<'));
test('4d. Tab 列表仍保留 会员卡产品/持卡会员/会员站 (V8)', tabsV8.includes('>会员卡产品<') && tabsV8.includes('>持卡会员<') && tabsV8.includes('>会员站<'));
// 回落
s.state.memberTab='会员订单';s.renderMembershipsV8();
test('4e. 会员订单 state 回落到 会员卡产品', s.state.memberTab!=='会员订单');

// ===== 5. 充值管理 编辑界面仅名称和状态 =====
let mTitle='',mHtml='',mActs=[];
s.openModal=(title,html,acts)=>{mTitle=title;mHtml=html;mActs=acts||[]};
s.rechargePackageModalV25(s.rechargePackagesV25[0]); // 编辑
test('5a. 编辑模式 标题正确', mTitle==='编辑充值套餐');
test('5b. 编辑界面 仅有 套餐名称 (rechargePackageNameV25)', mHtml.includes('rechargePackageNameV25'));
test('5c. 编辑界面 仅有 启用状态 (rechargePackageStatusV25)', mHtml.includes('rechargePackageStatusV25'));
test('5d. 编辑界面 删除 充值金额/赠送金/有效期/生效 字段',
  !mHtml.includes('rechargePackagePayV25') && !mHtml.includes('充值金额 (元)') &&
  !mHtml.includes('rechargePackageGiftV25') && !mHtml.includes('赠送金') &&
  !mHtml.includes('有效期方式') && !mHtml.includes('rechargePackageEffectiveV25')
);
// 新建仍保留全部字段
s.rechargePackageModalV25(null);
test('5e. 新建模式 保留全部字段 (金额/赠送/有效期)',
  mHtml.includes('rechargePackagePayV25') && mHtml.includes('rechargePackageGiftV25') && mHtml.includes('rechargePackageEffectiveV25')
);

// ===== 6. 充值订单详情 不展示 银联交易流水号 =====
mHtml='';s.rechargeOrderDetailV25(s.rechargeOrdersV25[0]);
test('6a. 详情 无 银联交易流水号 label 或 unionTradeNo 展示',
  !/银联交易流水号/.test(mHtml) && !mHtml.includes('unionTradeNo'));
test('6b. 详情 保留 银联商户号 字段', mHtml.includes('银联商户号'));

// ===== 7. 充值退款申请 二级抽屉界面 (DRAWER 打开) =====
let drawerVisible=false,drawerTitle='',drawerBody='',drawerSave='';
s.$=function(id){
  const o={};
  Object.defineProperty(o,'textContent',{set(v){
    if(id==='drawerTitle')drawerTitle=v;
    if(id==='drawerSave')drawerSave=v;
  },get(){return ''}});
  Object.defineProperty(o,'innerHTML',{set(v){if(id==='drawerBody')drawerBody=v},get(){return ''}});
  o.classList={add(c){if(c==='hidden'&&id==='drawerOverlay')drawerVisible=false},remove(c){if(c==='hidden'&&id==='drawerOverlay')drawerVisible=true}};
  return o;
};
const refundable=s.rechargeOrdersV25.find(o=>o.refundStatus==='无退款'&&s.rechargeRefundableV25(o)>0);
drawerVisible=false;drawerTitle='';drawerBody='';
s.applyMenu('recharge-order-refund-v25','recharge-order-v25',refundable.id);
test('7a. 充值申请退款 打开抽屉 (drawerOverlay.hidden 被 remove → visible=true)', drawerVisible===true);
test('7b. 抽屉 title=充值订单退款', drawerTitle==='充值订单退款');
test('7c. state.drawer.kind=unified-refund-v39 且 refundType=recharge',
  s.state.drawer && s.state.drawer.kind==='unified-refund-v39' && s.state.drawer.refundType==='recharge');
test('7d. 抽屉 含 退款金额/退款原因/申请说明 三字段 (二级界面内容齐全)',
  drawerBody.includes('f-unified-refund-amount-v39') &&
  drawerBody.includes('f-unified-refund-reason-v39') &&
  drawerBody.includes('f-unified-refund-note-v39'));
test('7e. 抽屉 save 按钮文字=提交退款申请', drawerSave==='提交退款申请');
// 不再使用旧 modal 打开
test('7f. 打开抽屉后 drawerTitle/body 都非空（即 old openModal 未被调用）', drawerTitle.length>0 && drawerBody.length>0);

console.log('\n== PASS:',pass,' FAIL:',fail,' ==');
process.exit(fail?1:0);
