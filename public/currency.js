'use strict';
(()=>{
  const config=JSON.parse(document.getElementById('currency-config')?.textContent||'{}');
  if(!config.currencies)return;
  const key='travora-display-currency-v1';
  let selected=config.defaultCurrency;
  try{const saved=localStorage.getItem(key);if(config.currencies[saved])selected=saved;}catch{}
  const format=(amount,code=selected)=>{const c=config.currencies[code]||config.currencies[config.defaultCurrency];return new Intl.NumberFormat(c.locale,{style:'currency',currency:code,currencyDisplay:'code',minimumFractionDigits:0,maximumFractionDigits:0}).format(Number(amount)*c.rate);};
  const convert=(amount,code=selected)=>Number(amount)*(config.currencies[code]?.rate||1);
  function refresh(root=document){
    const items=[...(root.matches?.('[data-money]')?[root]:[]),...root.querySelectorAll('[data-money]')];
    for(const el of items){const amount=Number(el.dataset.money);if(!Number.isFinite(amount))continue;const value=(el.dataset.moneyPrefix||'')+format(amount)+(el.dataset.moneySuffix||'');if(el.textContent!==value)el.textContent=value;}
    document.querySelectorAll('[data-currency-select]').forEach(s=>{if(s.value!==selected)s.value=selected;});
    document.querySelectorAll('[data-currency-code]').forEach(el=>el.textContent=selected);
    document.documentElement.dataset.currency=selected;
  }
  function set(code){if(!config.currencies[code])return;selected=code;try{localStorage.setItem(key,code);}catch{}refresh();document.dispatchEvent(new CustomEvent('travora:currency-change',{detail:{currency:code,baseCurrency:config.baseCurrency}}));}
  window.TravoraCurrency={format,convert,code:()=>selected,refresh,set,config};
  document.querySelectorAll('[data-currency-select]').forEach(s=>s.addEventListener('change',()=>set(s.value)));
  window.addEventListener('storage',e=>{if(e.key===key&&config.currencies[e.newValue]){selected=e.newValue;refresh();document.dispatchEvent(new CustomEvent('travora:currency-change',{detail:{currency:selected}}));}});
  refresh();
  new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1)refresh(node);}).observe(document.body,{childList:true,subtree:true});
})();
