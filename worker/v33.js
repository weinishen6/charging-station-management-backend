export const V33_SCRIPT = String.raw`
    /* V33 screenshot corrections: single refund amount, enterprise usage tab, campaign bearer */
    campaigns.forEach(function(item,index){if(!item.costBearer)item.costBearer=index%3===1?'运营商承担':index%3===2?'双方承担':'平台承担'});

    refundForm=function(order){
      var available=refundableAmountV23(order),refunded=refunds.filter(function(item){return item.orderId===order.id&&item.status==='已退款'}).reduce(function(sum,item){return sum+Number(item.amount||0)},0);
      return '<div class="refund-balance-v23"><article><span>订单实付金额</span><strong>'+money(order.paid)+' 元</strong></article><article><span>已退款金额</span><strong>'+money(refunded)+' 元</strong></article></div><div class="form-grid"><div class="form-field full"><label class="field-label">可退款金额</label><div class="input-unit"><input class="input" id="f-refundable-v23" value="'+money(available)+'" disabled><span>元</span></div></div><div class="form-field full"><label class="field-label required">退款金额 (元)</label><div class="input-unit"><input class="input" id="f-refund-amount-v33" type="number" min="0.01" max="'+available+'" step="0.01" placeholder="请输入退款金额"><span>元</span></div></div></div><div class="callout" style="margin:12px 0 16px">可退款金额按订单实付金额扣除已退款及审批中金额后计算；再次申请时，系统自动以剩余金额为上限。</div><div class="form-section">申请说明</div>'+formSelect('f-reason-type','退款原因',['设备上报金额异常','服务费争议','电费争议','用户投诉'],order.abnormal?'设备上报金额异常':'用户投诉',true,true)+'<textarea class="textarea" id="f-reason" placeholder="说明具体时段、费用差异及退款依据"></textarea>';
    };

    var campaignFormV33Base=campaignForm;
    campaignForm=function(record){
      var item=record||{},defaultBearer=state.enterpriseScopeV28==='operator'?'运营商承担':'平台承担',selected=item.costBearer||defaultBearer,html=campaignFormV33Base(record),field='<div class="form-grid campaign-cost-bearer-v33">'+formSelect('f-cost-bearer-v33','金额承担方',['平台承担','运营商承担','双方承担'],selected,true)+'</div>';
      return html.replace('<div class="campaign-subtitle">优惠规则</div>',field+'<div class="campaign-subtitle">优惠规则</div>');
    };

    var campaignDetailBodyV33Base=campaignDetailBodyV13;
    campaignDetailBodyV13=function(item){
      var html=campaignDetailBodyV33Base(item);if(state.detailTab!=='活动信息')return html;var marker=info('优惠类型',esc(item.benefitType||'—'));return html.replace(marker,marker+info('金额承担方',esc(item.costBearer||'平台承担')));
    };

    var campaignMenuItemsV33Base=campaignMenuItemsV17;
    campaignMenuItemsV17=function(id){return campaignMenuItemsV33Base(id).map(function(item){return item[1]==='campaign-approval'?['审批任务（仅对应运营商可见）',item[1],item[2]]:item})};

    approvalModalV17=function(id){
      var item=campaigns.find(function(record){return record.id===id});if(!item)return;
      openModal('审批任务','<div class="approval-modal-status"><strong>'+esc(item.name)+'</strong><span>当前状态：'+esc(item.taskStatus||'待审批')+' · 审批人员：'+esc(item.approver||'—')+'</span></div><div class="info-grid" style="margin-bottom:14px">'+info('金额承担方',esc(item.costBearer||'平台承担'))+info('审批范围','仅对应运营商可见')+'</div><div class="form-field"><label class="field-label required">审批结果</label><div class="choices"><label class="choice"><input type="radio" name="campaign-approval-result-v17" value="通过" checked> 通过</label><label class="choice"><input type="radio" name="campaign-approval-result-v17" value="不通过"> 不通过</label></div></div><div class="form-field"><label class="field-label">审批备注</label><textarea class="input" id="campaign-approval-remark-v17" rows="3" placeholder="请输入审批备注"></textarea></div>',[{label:'取消',action:'close-modal'},{label:'提交审批',action:'campaign-approval-submit-v17',id:id,primary:true}]);
    };
    approvalDetailModalV17=function(id){
      var item=campaigns.find(function(record){return record.id===id});if(!item)return;var rows=(item.approvalRecords||[]).map(function(record){return [record.status||'—',record.approver||item.approver||'—',record.time||'—',esc(record.remark||'—')]});openModal('审批流程详情','<div class="approval-modal-status"><strong>'+esc(item.name)+'</strong><span>当前结果：'+esc(item.taskStatus||'审批完成')+'</span></div><div class="info-grid" style="margin-bottom:14px">'+info('金额承担方',esc(item.costBearer||'平台承担'))+info('审批范围','仅对应运营商可见')+'</div>'+simpleTable(['审批状态','审批人员','处理时间','备注'],rows),[{label:'关闭',action:'close-modal'}]);
    };

    var saveDrawerV33Base=saveDrawer;
    saveDrawer=function(){
      if(state.drawer&&state.drawer.kind==='refund-request'){
        var order=state.drawer.record,available=refundableAmountV23(order),amount=Number(getValue('f-refund-amount-v33'));if(!amount||amount<=0||amount>available){showToast('请填写有效退款金额，且不能超过可退款金额');return}refunds.unshift({id:'TK20260903'+String(100+refunds.length),orderId:order.id,stationId:order.stationId,amount:Number(amount.toFixed(2)),source:'订单退款',items:[{source:'订单退款',amount:Number(amount.toFixed(2)),period:'整单'}],reason:getValue('f-reason')||getValue('f-reason-type'),status:'待审批',applicant:'蒙奇奇 · 运营',reviewer:'—',time:'2026-09-03 09:40'});order.refundStatus='待审批';state.refundDraftV23=null;closeDrawer();render();showToast('退款申请已提交财务审批');return;
      }
      if(state.drawer&&state.drawer.kind==='campaign'){
        var activeDrawer=state.drawer,record=activeDrawer.record,bearer=getValue('f-cost-bearer-v33')||(state.enterpriseScopeV28==='operator'?'运营商承担':'平台承担');saveDrawerV33Base();if(state.drawer===activeDrawer)return;var target=record||campaigns[0];if(target){target.costBearer=bearer;render()}return;
      }
      saveDrawerV33Base();
    };

    var renderDetailV33Base=renderDetail;
    renderDetail=function(){
      if(state.detail&&state.detail.kind==='enterprise'){
        var company=enterpriseCompanyV27(state.detail.id),tabs=['企业资料','账户与充值','使用明细','退款明细'];if(tabs.indexOf(state.detailTab)===-1)state.detailTab=tabs[0];var body;if(state.detailTab==='企业资料')body='<div class="info-grid">'+info('企业编号',company.id)+info('企业名称',esc(company.name))+info('所属运营商',esc(company.operator))+info('联系人',esc(company.contact))+info('联系电话',esc(company.phone))+info('账户状态',badge(company.status))+info('创建时间',company.created)+info('钱包余额',money(company.balance)+' 元')+info('已使用额度',money(enterpriseUsedAmountV27(company))+' 元')+info('余额预警阈值',money(company.threshold)+' 元')+info('单次充电限额',money(company.limit)+' 元')+info('即插即充',badge(company.plugEnabled?'启用':'停用'))+'</div>';else if(state.detailTab==='账户与充值')body=enterpriseAccountOverviewV29(company);else if(state.detailTab==='使用明细')body=enterpriseUsageBodyV29(company);else body=enterpriseRefundBodyV29(company);$('content').innerHTML='<div class="detail-top"><div class="detail-ident"><button class="btn" data-action="back">‹ 返回</button><h2>'+esc(company.name)+'</h2><span class="code">'+company.id+'</span></div><button class="btn" data-action="drawer" data-kind="enterprise" data-id="'+company.id+'">编辑企业</button></div><section class="surface">'+tabsMarkup(tabs)+'<div class="detail-content">'+body+'</div></section>';return;
      }
      renderDetailV33Base();
    };

    render();
`;
