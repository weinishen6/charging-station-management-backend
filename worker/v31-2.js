export const V31_SCRIPT_2 = String.raw`
      $('content').innerHTML=metricsV27([{label:'合作企业',value:scoped.length,icon:'▦'},{label:'累计充值额度',value:money(rechargeTotal),unit:'元',icon:'＋'},{label:'企业钱包余额',value:money(scoped.reduce(function(sum,item){return sum+item.balance},0)),unit:'元',icon:'¥'},{label:'已使用额度',value:money(usedTotal),unit:'元',icon:'↗'},{label:'余额预警',value:scoped.filter(function(item){return item.status==='余额预警'}).length,icon:'△',className:'metric-warning'}],'enterprise-metrics-v31')+'<section class="surface">'+querybar('搜索企业名称、联系人或联系电话')+toolbar('企业管理',records.length,actions)+renderTable(['企业编号','企业名称','所属运营商','联系人','联系电话','钱包余额 (元)','已使用额度 (元)','企业车辆','即插即充','账户状态','创建时间'],records,function(item){return '<tr><td class="code">'+item.id+'</td><td><strong>'+esc(item.name)+'</strong></td><td>'+esc(item.operator)+'</td><td>'+esc(item.contact)+'</td><td>'+esc(item.phone)+'</td><td><strong>'+money(item.balance)+'</strong></td><td>'+money(enterpriseUsedAmountV27(item))+'</td><td>'+enterpriseVehicleCountV27(item)+'</td><td>'+badge(item.plugEnabled?'启用':'停用')+'</td><td>'+badge(item.status)+'</td><td>'+item.created+'</td><td class="actions">'+actionButton('enterprise',item.id)+'</td></tr>'})+'</section>';
    };

    enterpriseRechargeRowsV29=function(company){
      var rows=recharges.filter(function(item){return item.owner===company.name});
      return rows.length?simpleTable(['充值编号','充值金额 (元)','银行流水号','付款凭证','操作时间'],rows.map(function(item){return [item.id,money(item.amount),esc(item.bankSerial||'—'),item.voucher?'<span class="recharge-voucher-v29">▤ '+esc(item.voucher)+'</span>':'—',item.time]})):'<div class="placeholder">暂无充值明细</div>';
    };
    enterpriseAccountOverviewV29=function(company){
      var used=enterpriseUsedAmountV27(company),rechargeTotal=enterpriseRechargeAmountV27(company),available=enterpriseAvailableBalanceV28(company),owned=enterpriseOrdersV27(company);
`;
