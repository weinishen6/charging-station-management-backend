export const V35_SCRIPT = String.raw`
    /* V35 campaign visibility rules and concise enterprise ownership copy */
    var enterpriseFormV35Base=enterpriseForm;
    enterpriseForm=function(record){return enterpriseFormV35Base(record).replace('运营商维护企业时，默认归属当前运营商且不可修改。','运营商创建企业时，默认当前运营商且不可修改。').replace('运营商账号新增企业时，默认归属当前运营商且不可修改。','运营商创建企业时，默认当前运营商且不可修改。')};

    var campaignObjectEditorV35Base=campaignObjectEditorV6;
    campaignObjectEditorV6=function(){
      if(state.enterpriseScopeV28!=='operator')return campaignObjectEditorV35Base();state.campaignTargetDimension='station';var html=campaignObjectEditorV35Base();return html.replace(/<label class="campaign-dimension-card"><input type="radio" name="campaign-target-dimension" value="person"[\\s\\S]*?<\\/label>/,'').replace(/<label class="campaign-dimension-card"><input type="radio" name="campaign-target-dimension" value="operator"[\\s\\S]*?<\\/label>/,'');
    };

    function campaignBearerOptionsV35(selected){return '<div class="form-grid campaign-cost-bearer-v33"><div class="form-field full"><label class="field-label required">金额承担方</label><div class="choices">'+['平台承担','运营商承担','双方承担'].map(function(value){return '<label class="choice"><input type="radio" name="campaign-cost-bearer-v35" value="'+value+'" '+(selected===value?'checked':'')+'> '+value+'</label>'}).join('')+'</div><input type="hidden" id="f-cost-bearer-v33" value="'+selected+'"></div></div>'}
    var campaignFormV35Base=campaignForm;
    campaignForm=function(record){
      var html=campaignFormV35Base(record),selected=record&&record.costBearer||(state.enterpriseScopeV28==='operator'?'运营商承担':'平台承担'),replacement=campaignBearerOptionsV35(selected);html=html.replace(/<div class="form-grid campaign-cost-bearer-v33">[\\s\\S]*?<\\/select><\\/div><\\/div>/,replacement);var approvalStart=html.indexOf('<div id="campaignApprovalV18">');if(approvalStart!==-1){var item=record||{approvalRequired:false,approvalOperator:operators[0],approver:''},visible=state.campaignTargetDimension==='operator'&&state.campaignTargetMode==='specified';html=html.slice(0,approvalStart)+'<div id="campaignApprovalV18">'+(visible?campaignApprovalBlockV13(item):'')+'</div>'}return html;
    };
    function syncCampaignApprovalV35(){var box=$('campaignApprovalV18');if(box)box.innerHTML=state.campaignTargetDimension==='operator'&&state.campaignTargetMode==='specified'?campaignApprovalBlockV13({approvalRequired:false,approvalOperator:operators[0],approver:''}):''}
    document.addEventListener('change',function(event){
      if(event.target.name==='campaign-cost-bearer-v35'){var hidden=$('f-cost-bearer-v33');if(hidden)hidden.value=event.target.value}
      if(event.target.name==='campaign-target-dimension'||event.target.name==='campaign-target-mode'||event.target.name==='campaign-person-target-type')syncCampaignApprovalV35();
    },true);

    render();
`;
