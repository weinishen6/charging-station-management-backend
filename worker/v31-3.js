export const V31_SCRIPT_3 = String.raw`
      return (available<company.threshold?'<div class="callout warning" style="margin-bottom:15px">企业钱包余额低于预警阈值。</div>':'')+'<div class="account-summary-v31"><article><span>累计充值</span><strong>'+money(rechargeTotal)+' 元</strong></article><article><span>已使用额度</span><strong>'+money(used)+' 元</strong></article><article><span>钱包余额</span><strong>'+money(company.balance)+' 元</strong></article></div><div class="detail-block-v27"><div class="detail-block-head-v27"><h3>充值明细</h3></div>'+enterpriseRechargeRowsV29(company)+'</div><div class="detail-block-v27"><div class="detail-block-head-v27"><h3>使用明细</h3></div>'+(owned.length?simpleTable(['订单编号','使用时间','车牌号码','所属场站','充电电量 (kWh)','使用金额 (元)','订单状态'],owned.map(function(order){return ['<button class="btn-link code complaint-order-link-v27" data-action="detail" data-kind="order" data-id="'+order.id+'">'+order.id+'</button>',order.created,esc(order.plate),esc(stationById(order.stationId).name),money(order.quantity),money(order.paid-order.refund),badge(order.status)]})):'<div class="placeholder">暂无使用明细</div>')+'</div>';
    };

    var renderDetailV31Base=renderDetail;
    renderDetail=function(){
      if(state.detail&&state.detail.kind==='enterprise'){
        var company=enterpriseCompanyV27(state.detail.id),tabs=['企业资料','账户与充值','退款明细'];if(tabs.indexOf(state.detailTab)===-1)state.detailTab=tabs[0];var body;
        if(state.detailTab==='企业资料')body='<div class="info-grid">'+info('企业编号',company.id)+info('企业名称',esc(company.name))+info('所属运营商',esc(company.operator))+info('联系人',esc(company.contact))+info('联系电话',esc(company.phone))+info('账户状态',badge(company.status))+info('创建时间',company.created)+info('钱包余额',money(company.balance)+' 元')+info('已使用额度',money(enterpriseUsedAmountV27(company))+' 元')+info('余额预警阈值',money(company.threshold)+' 元')+info('单次充电限额',money(company.limit)+' 元')+info('即插即充',badge(company.plugEnabled?'启用':'停用'))+'</div>';
        else if(state.detailTab==='账户与充值')body=enterpriseAccountOverviewV29(company);else body=enterpriseRefundBodyV29(company);
        $('content').innerHTML='<div class="detail-top"><div class="detail-ident"><button class="btn" data-action="back">‹ 返回</button><h2>'+esc(company.name)+'</h2><span class="code">'+company.id+'</span></div><button class="btn" data-action="drawer" data-kind="enterprise" data-id="'+company.id+'">编辑企业</button></div><section class="surface">'+tabsMarkup(tabs)+'<div class="detail-content">'+body+'</div></section>';return;
      }
      renderDetailV31Base();
    };

`;
