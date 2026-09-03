export const V31_SCRIPT_4 = String.raw`
    renderEnterpriseVehiclesV27=function(){
      var enriched=enterpriseVehiclesV27.map(function(vehicle){var company=enterpriseCompanyV27(vehicle.enterpriseId);return Object.assign({},vehicle,{enterpriseName:company?company.name:'—',operator:company?company.operator:'—'})}),scoped=state.enterpriseScopeV28==='operator'?enriched.filter(function(vehicle){return vehicle.operator===state.currentOperatorV28}):enriched,records=scoped.filter(match);
      $('content').innerHTML='<section class="surface">'+querybar('搜索车牌号、VIN或司机')+toolbar('企业车辆管理',records.length,'<button class="btn btn-primary" data-action="enterprise-vehicle-new-v27">＋ 新增车辆</button><button class="btn" data-action="export">导出 Excel</button>')+renderTable(['车辆编号','所属运营商','关联企业','车牌号码','车辆 VIN','车辆类型','司机 / 负责人','联系电话','创建时间'],records,function(vehicle){return '<tr><td class="code">'+vehicle.id+'</td><td>'+esc(vehicle.operator)+'</td><td>'+esc(vehicle.enterpriseName)+'</td><td><strong>'+esc(vehicle.plate)+'</strong></td><td class="code">'+esc(vehicle.vin)+'</td><td><span class="vehicle-type-v27">'+esc(vehicle.vehicleType)+'</span></td><td>'+esc(vehicle.driver||'—')+'</td><td>'+esc(vehicle.phone||'—')+'</td><td>'+vehicle.created+'</td><td class="actions"><div class="vehicle-hover-v30"><button class="vehicle-hover-trigger-v30" aria-label="车辆操作" title="悬停查看操作">⋯</button><div class="vehicle-hover-menu-v30"><button data-action="enterprise-vehicle-detail-v30" data-id="'+vehicle.id+'">详情</button><button data-action="enterprise-vehicle-edit-v27" data-id="'+vehicle.id+'">编辑</button><button class="danger" data-action="enterprise-vehicle-delete-v27" data-id="'+vehicle.id+'">删除</button></div></div></td></tr>'})+'</section>';
    };

    openEnterpriseWalletRefundV28=function(company){
      var available=enterpriseAvailableBalanceV28(company),pending=enterprisePendingRefundV28(company);
      openModal('申请企业钱包退款','<div class="info-grid">'+info('企业名称',esc(company.name))+info('所属运营商',esc(company.operator))+info('钱包余额',money(company.balance)+' 元')+info('审批中冻结',money(pending)+' 元')+'</div><div class="form-section">退款信息</div><div class="form-grid"><div class="form-field"><label class="field-label">可退款金额</label><div class="input-unit"><input class="input readonly-money-v28" id="enterprise-refundable-v28" value="'+money(available)+'" disabled><span>元</span></div></div>'+formInput('enterprise-refund-amount-v28','申请退款金额 (元)','',true,'number')+formInput('enterprise-refund-destination-v28','退款账户','原对公付款账户',true,'text',true)+'</div><div class="form-section">申请原因</div><textarea class="textarea" id="enterprise-refund-reason-v28" placeholder="请填写企业余额退款原因"></textarea><div class="callout" style="margin-top:13px">提交后进入财务审批；审批期间冻结申请额度，审批通过后扣减企业钱包余额。</div>',[{label:'提交退款申请',action:'enterprise-wallet-refund-submit-v28',id:company.id,primary:true}]);
    };

    enterpriseRechargeForm=function(company){
      return '<div class="form-section">线下对公充值</div><div class="form-grid"><div class="form-field full"><label class="field-label required">企业名称</label><input class="input enterprise-name-disabled-v31" id="f-name" value="'+esc(company.name)+'" disabled></div>'+formInput('f-amount','充值金额 (元)','',true,'number')+formInput('f-bank','对公付款账户','',true)+formInput('f-time','到账时间','2026-08-25T15:30',true,'datetime-local')+formInput('f-voucher','银行流水号','',true)+'</div><div class="form-section">付款凭证</div><label class="upload"><input type="file" accept="image/*,.pdf" style="display:none">＋ 上传对公转账凭证</label>';
    };

    var menuActionsV31Base=menuActions;
    menuActions=function(kind){if(kind==='enterprise'){var company=enterpriseCompanyV27(state.menuRecordIdV27),items=[['详情','detail'],['车辆管理','enterprise-vehicles-v27']];if(company&&enterpriseCanRefundV28(company))items.push(['余额退款','enterprise-wallet-refund-v28']);items.push(['钱包充值','recharge']);return items}return menuActionsV31Base(kind)};


    render();
`;
