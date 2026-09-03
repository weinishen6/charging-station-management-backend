export const V36_SCRIPT = String.raw`
/* V36 show the effective activity object in campaign approval */
    function campaignApprovalTargetV36(item){
      var effectiveStations=campaignEffectiveStationsV6(item),allStations=effectiveStations.length===stations.length;
      return allStations?'场站维度 · 全部场站':'场站维度 · 指定场站（'+effectiveStations.length+' 个）';
    }
    approvalModalV17=function(id){
      var item=campaigns.find(function(record){return record.id===id});if(!item)return;
      openModal('审批任务','<div class="approval-modal-status"><strong>'+esc(item.name)+'</strong><span>当前状态：'+esc(item.taskStatus||'待审批')+' · 审批人员：'+esc(item.approver||'—')+'</span></div><div class="info-grid" style="margin-bottom:14px">'+info('金额承担方',esc(item.costBearer||'平台承担'))+info('活动对象',esc(campaignApprovalTargetV36(item)))+'</div><div class="form-field"><label class="field-label required">审批结果</label><div class="choices"><label class="choice"><input type="radio" name="campaign-approval-result-v17" value="通过" checked> 通过</label><label class="choice"><input type="radio" name="campaign-approval-result-v17" value="不通过"> 不通过</label></div></div><div class="form-field"><label class="field-label">审批备注</label><textarea class="input" id="campaign-approval-remark-v17" rows="3" placeholder="请输入审批备注"></textarea></div>',[{label:'取消',action:'close-modal'},{label:'提交审批',action:'campaign-approval-submit-v17',id:id,primary:true}]);
    };
    approvalDetailModalV17=function(id){
      var item=campaigns.find(function(record){return record.id===id});if(!item)return;var rows=(item.approvalRecords||[]).map(function(record){return [record.status||'—',record.approver||item.approver||'—',record.time||'—',esc(record.remark||'—')]});openModal('审批流程详情','<div class="approval-modal-status"><strong>'+esc(item.name)+'</strong><span>当前结果：'+esc(item.taskStatus||'审批完成')+'</span></div><div class="info-grid" style="margin-bottom:14px">'+info('金额承担方',esc(item.costBearer||'平台承担'))+info('活动对象',esc(campaignApprovalTargetV36(item)))+'</div>'+simpleTable(['审批状态','审批人员','处理时间','备注'],rows),[{label:'关闭',action:'close-modal'}]);
    };
`;
