export const V31_SCRIPT_1 = String.raw`
    /* V31 screenshot-note refinements for enterprise management */
    var styleV31=document.createElement('style');
    styleV31.textContent='.enterprise-metrics-v31{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:18px}.enterprise-metrics-v31 .metrics{display:contents}.account-summary-v31{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:18px}.account-summary-v31 article{border:1px solid var(--line);border-radius:10px;padding:14px;background:#f8fafc}.account-summary-v31 span{display:block;color:var(--muted);font-size:12px;margin-bottom:7px}.account-summary-v31 strong{font-size:20px}.enterprise-name-disabled-v31{background:#f2f4f7!important;color:#667085!important;cursor:not-allowed!important}@media(max-width:1100px){.enterprise-metrics-v31{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.enterprise-metrics-v31,.account-summary-v31{grid-template-columns:1fr}}';
    document.head.appendChild(styleV31);

    var enterpriseCreatedTimesV31=['09:15:26','10:32:08','16:48:51'];
    enterprises.forEach(function(company,index){if(/^\d{4}-\d{2}-\d{2}$/.test(company.created))company.created+=' '+enterpriseCreatedTimesV31[index%enterpriseCreatedTimesV31.length]});

    renderEnterprises=function(){
      syncEnterpriseVehiclesV27();enterprises.forEach(function(company){company.status=enterpriseAvailableBalanceV28(company)<company.threshold?'余额预警':'正常'});
      var scoped=enterpriseScopeRecordsV28(),records=scoped.filter(match),rechargeTotal=scoped.reduce(function(sum,company){return sum+enterpriseRechargeAmountV27(company)},0),usedTotal=scoped.reduce(function(sum,company){return sum+enterpriseUsedAmountV27(company)},0),actions='<button class="btn btn-primary" data-action="drawer" data-kind="enterprise">＋ 新增企业</button><button class="btn" data-action="export">导出 Excel</button>';
`;
