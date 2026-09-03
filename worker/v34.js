export const V34_SCRIPT = String.raw`
    /* V34 enterprise ownership help and vehicle Excel import */
    var enterpriseFormV34Base=enterpriseForm;
    enterpriseForm=function(record){
      var html=enterpriseFormV34Base(record);if(state.enterpriseScopeV28==='operator')return html;return html.replace('</select></div><div class="form-section">企业基础信息','</select><div class="field-help">运营商维护企业时，默认归属当前运营商且不可修改。</div></div><div class="form-section">企业基础信息');
    };

    renderEnterpriseVehiclesV27=function(){
      var enriched=enterpriseVehiclesV27.map(function(vehicle){var company=enterpriseCompanyV27(vehicle.enterpriseId);return Object.assign({},vehicle,{enterpriseName:company?company.name:'—',operator:company?company.operator:'—'})}),scoped=state.enterpriseScopeV28==='operator'?enriched.filter(function(vehicle){return vehicle.operator===state.currentOperatorV28}):enriched,records=scoped.filter(match);
      $('content').innerHTML='<section class="surface">'+querybar('搜索车牌号、VIN或司机')+toolbar('企业车辆管理',records.length,'<button class="btn btn-primary" data-action="enterprise-vehicle-new-v27">＋ 新增车辆</button><button class="btn" data-action="enterprise-vehicle-import-v34">导入 Excel</button><button class="btn" data-action="export">导出 Excel</button>')+renderTable(['车辆编号','所属运营商','关联企业','车牌号码','车辆 VIN','车辆类型','司机 / 负责人','联系电话','创建时间'],records,function(vehicle){return '<tr><td class="code">'+vehicle.id+'</td><td>'+esc(vehicle.operator)+'</td><td>'+esc(vehicle.enterpriseName)+'</td><td><strong>'+esc(vehicle.plate)+'</strong></td><td class="code">'+esc(vehicle.vin)+'</td><td><span class="vehicle-type-v27">'+esc(vehicle.vehicleType)+'</span></td><td>'+esc(vehicle.driver||'—')+'</td><td>'+esc(vehicle.phone||'—')+'</td><td>'+vehicle.created+'</td><td class="actions"><div class="vehicle-hover-v30"><button class="vehicle-hover-trigger-v30" aria-label="车辆操作" title="悬停查看操作">⋯</button><div class="vehicle-hover-menu-v30"><button data-action="enterprise-vehicle-detail-v30" data-id="'+vehicle.id+'">详情</button><button data-action="enterprise-vehicle-edit-v27" data-id="'+vehicle.id+'">编辑</button><button class="danger" data-action="enterprise-vehicle-delete-v27" data-id="'+vehicle.id+'">删除</button></div></div></td></tr>'})+'</section>';
    };

    function openEnterpriseVehicleImportV34(){
      openModal('导入企业车辆','<div class="callout" style="margin-bottom:16px">请先下载车辆导入模板，按模板填写企业、车牌号码、车辆 VIN、车辆类型及司机信息后上传。</div><button class="btn" data-action="enterprise-vehicle-template-v34">下载导入模板</button><div class="form-section">上传 Excel 文件</div><label class="upload"><input id="enterprise-vehicle-file-v34" type="file" accept=".xlsx,.xls" style="display:none">＋ 选择 Excel 文件</label><div class="field-help" style="margin-top:10px">支持 .xlsx、.xls 格式；系统将根据企业名称校验所属运营商及企业归属。</div>',[{label:'确认导入',action:'enterprise-vehicle-import-submit-v34',primary:true}]);
    }
    document.addEventListener('click',function(event){
      var button=event.target.closest('[data-action]');if(!button)return;var action=button.dataset.action;
      if(action==='enterprise-vehicle-import-v34'){event.preventDefault();event.stopImmediatePropagation();openEnterpriseVehicleImportV34();return}
      if(action==='enterprise-vehicle-template-v34'){event.preventDefault();event.stopImmediatePropagation();showToast('企业车辆导入模板已下载');return}
      if(action==='enterprise-vehicle-import-submit-v34'){event.preventDefault();event.stopImmediatePropagation();var input=$('enterprise-vehicle-file-v34');if(!input||!input.files||!input.files.length){showToast('请先选择需要导入的 Excel 文件');return}closeModal();render();showToast('车辆文件已提交，校验通过后将完成导入');return}
    },true);

    render();
`;
