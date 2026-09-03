export const V32_SCRIPT = String.raw`
    /* V32 account detail and refund copy refinements */
    enterpriseAccountOverviewV29=function(company){
      var used=enterpriseUsedAmountV27(company),rechargeTotal=enterpriseRechargeAmountV27(company),available=enterpriseAvailableBalanceV28(company);
      return (available<company.threshold?'<div class="callout warning" style="margin-bottom:15px">企业钱包余额低于预警阈值。</div>':'')+'<div class="account-summary-v31"><article><span>累计充值</span><strong>'+money(rechargeTotal)+' 元</strong></article><article><span>已使用额度</span><strong>'+money(used)+' 元</strong></article><article><span>钱包余额</span><strong>'+money(company.balance)+' 元</strong></article></div><div class="detail-block-v27"><div class="detail-block-head-v27"><h3>充值明细</h3></div>'+enterpriseRechargeRowsV29(company)+'</div>';
    };

    var refundFormV32Base=refundForm;
    refundForm=function(order){
      return refundFormV32Base(order).replace('<div class="form-section">运营提交退费申请</div>','<div class="form-section">退款金额</div>');
    };

    render();
`;
