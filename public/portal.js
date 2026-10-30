'use strict';
(() => {
const $=(q,r=document)=>r.querySelector(q);const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key='travora-saved-v2';let saved=[];try{const data=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(data))saved=data.filter(x=>x&&typeof x.id==='string'&&typeof x.url==='string'&&x.url.startsWith('/')&&!x.url.startsWith('//')&&!x.url.includes('kashmir'));}catch{}
let toastTimer;function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3400);}
function persist(){try{localStorage.setItem(key,JSON.stringify(saved));return true;}catch{return false;}}
function savedState(){$$('[data-save-id]').forEach(b=>{const yes=saved.some(x=>x.id===b.dataset.saveId);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',(yes?'Remove saved ':'Save ')+(b.dataset.saveTitle||'trip'));});$$('.saved-count').forEach(c=>{c.textContent=saved.length;c.hidden=!saved.length;});}
function renderSaved(){const grid=$('#saved-items');if(!grid)return;$('#saved-empty').hidden=saved.length>0;grid.innerHTML=saved.map(x=>{const image=/^[\w.-]+$/.test(x.image||'')?x.image:'hero-bali.webp';return `<article class="travel-card saved-travel-card"><a class="travel-card-media" href="${esc(x.url)}"><img src="/assets/${image}" alt="${esc(x.title)}" width="900" height="600" loading="lazy"><span class="travel-card-badge">Saved for later</span></a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(x.subtitle||'A little inspiration')}</span><h3 class="travel-card-title"><a href="${esc(x.url)}">${esc(x.title)}</a></h3><div class="travel-card-footer"><button type="button" class="sp-saved-remove" data-remove-saved="${esc(x.id)}" aria-label="Remove ${esc(x.title)} from saved trips">Remove</button><a href="${esc(x.url)}" class="travel-card-action">Explore details <span aria-hidden="true">→</span></a></div></div></article>`;}).join('');}
function closeNav(){const n=$('#main-nav'),b=$('.nav-toggle');n?.classList.remove('open');b?.setAttribute('aria-expanded','false');b?.setAttribute('aria-label','Open navigation');}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;if(b.matches('.nav-toggle')){const open=$('#main-nav').classList.toggle('open');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'Close navigation':'Open navigation');return;}if(b.dataset.saveId){const index=saved.findIndex(x=>x.id===b.dataset.saveId);if(index>=0)saved.splice(index,1);else saved.push({id:b.dataset.saveId,title:b.dataset.saveTitle||'Saved escape',image:b.dataset.saveImage||'hero-bali.webp',url:b.dataset.saveUrl||'/tours/',subtitle:b.dataset.saveSubtitle||''});const ok=persist();savedState();toast(ok?(index>=0?'Removed from your saved trips.':'Added to your saved trips.'):'Saved for this visit. Browser storage is unavailable.');return;}if(b.dataset.removeSaved){saved=saved.filter(x=>x.id!==b.dataset.removeSaved);persist();savedState();renderSaved();toast('Removed from saved trips.');return;}if(!b.closest('.site-header'))closeNav();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav();});
const today=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;})();
$$('input[type=date]').forEach(i=>{if(!i.min)i.min=today;});
$$('[data-search-service]').forEach(form=>{const first=form.elements.depart,last=form.elements.return;function dates(){if(last&&first&&first.value){last.setCustomValidity('');last.min=first.value;if(form.dataset.searchService==='hotels'){const d=new Date(first.value+'T12:00:00');d.setDate(d.getDate()+1);last.min=d.toISOString().slice(0,10);}}}first?.addEventListener('change',dates);last?.addEventListener('change',()=>last.setCustomValidity(''));form.addEventListener('submit',e=>{if(first&&last&&!last.disabled&&first.value&&last.value&&(last.value<first.value||(form.dataset.searchService==='hotels'&&last.value===first.value))){e.preventDefault();last.setCustomValidity('Choose an end date after your departure or check-in.');last.reportValidity();}});});
const query=new URLSearchParams(location.search);
$$('[data-home-package]').forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.homePackage;$$('[data-home-package]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});$$('[data-home-package-card]').forEach(card=>card.hidden=value!=='all'&&card.dataset.homePackageCard!==value);}));
$$('[data-banner-search]').forEach(panel=>{
 const tabs=$$('[data-banner-tab]',panel);
 function selectTab(button,focus=false){
  const service=button.dataset.bannerTab;
  tabs.forEach(tab=>{const selected=tab===button;tab.classList.toggle('active',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
  $$('[data-banner-panel]',panel).forEach(content=>content.hidden=content.dataset.bannerPanel!==service);
  if(focus)button.focus();
 }
 tabs.forEach((button,index)=>{
  button.addEventListener('click',()=>selectTab(button));
  button.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight')next=(index+1)%tabs.length;
   else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
   else if(event.key==='Home')next=0;
   else if(event.key==='End')next=tabs.length-1;
   if(next!==undefined){event.preventDefault();selectTab(tabs[next],true);}
  });
 });
});
savedState();renderSaved();
})();

;
(() => {
  const params = new URLSearchParams(location.search);
  const normal = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const localDate = value => value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
  const today = localDate(new Date());
  const dateAfter = (date, days) => { const value = new Date(date + 'T12:00:00'); value.setDate(value.getDate() + days); return localDate(value); };
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && localDate(new Date(value + 'T12:00:00')) === value;
  const setControl = (control, value) => {
    if (!control || value === null || value === undefined) return;
    if (control.tagName === 'SELECT') {
      const option = [...control.options].find(item => item.value === value) || [...control.options].find(item => normal(item.textContent) === normal(value));
      if (option) control.value = option.value;
    } else if (control.type !== 'date' || validDate(value)) control.value = value;
  };

  document.querySelectorAll('[data-service-search]').forEach(form => {
    const service = form.dataset.serviceSearch;
    const controls = form.elements;
    const error = form.querySelector('[data-ts-error]');
    const clearError = () => { if (error) { error.hidden = true; error.textContent = ''; } };
    const showError = message => { if (error) { error.textContent = message; error.hidden = false; } };
    const keys = service === 'transportation' ? ['pickup', 'dropoff', 'date', 'time', 'passengers', 'ride'] : ['destination', 'country', 'depart', 'return', 'travellers', 'rooms'];
    for (const key of keys) {
      const value = params.get(key);
      if (key === 'ride') {
        if (['airport', 'private', 'intercity'].includes(value)) form.querySelectorAll('[name="ride"]').forEach(input => input.checked = input.value === value);
      } else setControl(controls[key], value);
    }
    if (controls.depart && !params.has('depart') && params.has('date')) setControl(controls.depart, params.get('date'));
    if (service === 'hotels' && params.get('travellers') === 'family') controls.travellers.value = '3';

    // Match legacy full-name destination queries to the structured catalogue options.
    if (service !== 'destinations' && controls.destination && !params.get('destination')) {
      const requested = params.get('city') || params.get('cityId') || params.get('country') || params.get('countryId') || params.get('q');
      if (requested) setControl(controls.destination, requested);
    }

    if (service === 'destinations') {
      const country = controls.country;
      const place = controls.destination;
      const placeLabel = form.querySelector('[data-ts-place-field] > span');
      const placeIcon = placeLabel?.querySelector('svg')?.cloneNode(true);
      const allPlaces = [...place.options].slice(1).map(option => option.cloneNode(true));
      const requested = params.get('destination') || params.get('q');
      const requestedPlace = allPlaces.find(option => normal(option.value) === normal(requested) || normal(option.textContent) === normal(requested));
      if (requestedPlace) country.value = requestedPlace.dataset.country;
      else if (requested) setControl(country, requested);
      function updatePlaces(preferred = '') {
        const activeCountry = country.value;
        const countryName = country.selectedOptions[0]?.textContent || '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = activeCountry ? 'Explore all of ' + countryName : 'Choose a country first';
        const options = allPlaces.filter(option => option.dataset.country === activeCountry).map(option => option.cloneNode(true));
        place.replaceChildren(placeholder, ...options);
        place.disabled = !activeCountry || !options.length;
        if (options.some(option => option.value === preferred)) place.value = preferred;
        else place.value = '';
        if (placeLabel) {
          placeLabel.replaceChildren();
          if (placeIcon) placeLabel.append(placeIcon.cloneNode(true));
          placeLabel.append(document.createTextNode(activeCountry === 'singapore' ? 'Area or place' : 'City or area'));
        }
      }
      updatePlaces(requestedPlace?.value || place.value);
      country.addEventListener('change', () => { clearError(); updatePlaces(); });
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const destination = place.value || country.value;
        if (!/^[a-z0-9-]+$/.test(destination)) { showError('Choose a country to explore.'); return; }
        location.assign('/destinations/' + encodeURIComponent(destination) + '/');
      });
      return;
    }

    const dates = [...form.querySelectorAll('input[type="date"]')];
    dates.forEach(input => { input.min = today; });
    if (service === 'hotels') {
      if (!controls.depart.value) controls.depart.value = dateAfter(today, 22);
      if (!controls.return.value) controls.return.value = dateAfter(controls.depart.value, 5);
    }
    if (service === 'transportation' && !controls.date.value) controls.date.value = dateAfter(today, 22);

    function validate() {
      clearError();
      const first = controls.depart, last = controls.return;
      if (last) {
        last.setCustomValidity('');
        last.min = first?.value ? dateAfter(first.value, service === 'hotels' ? 1 : 0) : today;
        if (first?.value && last.value && last.value < last.min) last.setCustomValidity(service === 'hotels' ? 'Choose a check-out date after check-in.' : 'Choose a return date on or after departure.');
        if (last.value && !first?.value) first.setCustomValidity('Choose a departure date for your travel dates.');
        else first?.setCustomValidity('');
      }
      if (service === 'hotels') controls.rooms.setCustomValidity(Number(controls.rooms.value) > Number(controls.travellers.value) ? 'Choose at least one guest for each room.' : '');
      if (service === 'transportation') {
        const samePlace = normal(controls.pickup.value) === normal(controls.dropoff.value);
        controls.dropoff.setCustomValidity(samePlace ? 'Choose a drop-off different from your pickup.' : '');
      }
      return form.checkValidity();
    }
    form.addEventListener('input', validate);
    form.addEventListener('change', validate);
    form.addEventListener('submit', event => {
      if (!validate()) { event.preventDefault(); showError('Please check the highlighted search details.'); form.reportValidity(); }
    });
    validate();
  });
})();

;

(() => {
  const params = new URLSearchParams(location.search);
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const format = n => window.TravoraCurrency.format(n);
  const normal = value => String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const setQuery = values => {const url=new URL(location.href);for(const [key,value] of Object.entries(values)){if(value===null||value===''||value===undefined)url.searchParams.delete(key);else url.searchParams.set(key,String(value));}history.replaceState(null,'',url.pathname+url.search+url.hash);};
  qa('.fh-stay-plan').forEach(form=>{
    for(const key of ['depart','return','travellers','rooms']){
      const value=params.get(key);const control=form.elements[key];if(!value||!control)continue;
      if(control.tagName==='SELECT'){if([...control.options].some(option=>option.value===value))control.value=value;}
      else if(/^\d{4}-\d{2}-\d{2}$/.test(value))control.value=value;
    }
  });
  const when=params.get('depart');
  if(when && /^\d{4}-\d{2}-\d{2}$/.test(when)){const d=new Date(when+'T12:00:00');if(!Number.isNaN(d.getTime()))qa('[data-fh-travel-date]').forEach(el=>el.textContent=d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}));}
  const hotelSearch=q('[data-service-search="hotels"]');
  const hotelPreferences=()=>{const form=hotelSearch||q('.fh-stay-plan');return {...Object.fromEntries(['depart','return','travellers','rooms'].map(key=>[key,form?.elements[key]?.value||params.get(key)||''])),destination:hotelSearch?.elements.destination?.value||q('[data-fh-city]')?.value||q('[data-fh-country]')?.value||params.get('destination')||form?.elements.destination?.value||''};};
  const carryHotelPreferences=link=>{const url=new URL(link.getAttribute('href'),location.origin);for(const [key,value] of Object.entries(hotelPreferences())){if(value)url.searchParams.set(key,value);}link.href=url.pathname+url.search;};
  const destinationName=value=>{const option=hotelSearch&&[...hotelSearch.elements.destination.options].find(option=>normal(option.value)===normal(value)||normal(option.textContent)===normal(value));return option?.dataset.placeName||option?.textContent||value||'';};
  const summaryHost=q('.fh-results-heading > div');
  if(summaryHost){
    const summary=document.createElement('p');summary.className='ts-stay-summary';summary.setAttribute('data-fh-search-summary','');summary.setAttribute('aria-live','polite');summaryHost.append(summary);
    const displayDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';const day=new Date(value+'T12:00:00');return Number.isNaN(day.getTime())?'':day.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};
    const updateSummary=()=>{const values=hotelPreferences();const start=displayDate(values.depart),end=displayDate(values.return);const rooms=Number(values.rooms)||1,guests=Number(values.travellers)||2;summary.replaceChildren();for(const text of [start&&end?start+' – '+end:'Choose your stay dates',rooms+' '+(rooms===1?'room':'rooms'),guests+' '+(guests===1?'guest':'guests')]){const span=document.createElement('span');span.textContent=text;summary.append(span);}};
    hotelSearch?.addEventListener('change',updateSummary);updateSummary();
  }
  qa('a[href="/hotels/results/"]').forEach(link=>{carryHotelPreferences(link);link.addEventListener('click',()=>carryHotelPreferences(link));});
  qa('[data-fh-hotel] a[href^="/hotels/"]').forEach(link=>{carryHotelPreferences(link);link.addEventListener('click',()=>carryHotelPreferences(link));});
  const hotelPanel=q('[data-fh-hotel-filters]');
  if(hotelPanel){
    const cards=qa('[data-fh-hotel]');const countrySelect=q('[data-fh-country]');const citySelect=q('[data-fh-city]');const budgetInput=hotelPanel.querySelector('[name="budget"]');const sortSelect=q('[data-fh-sort-hotels]');let destinationFilter=normal(params.get('destination')||params.get('q'));if(destinationFilter==='all')destinationFilter='';let currentPage=Math.max(1,Number.parseInt(params.get('page')||'1',10)||1);const perPage=6;
    const countryRaw=normal(params.get('country')||params.get('countryId'));const countryQuery=countryRaw==='all'?'':countryRaw;const cityRaw=normal(params.get('city')||params.get('cityId'));const cityQuery=cityRaw==='all'?'':cityRaw;const countryOption=[...countrySelect.options].find(o=>normal(o.value)===countryQuery||normal(o.textContent)===countryQuery);if(countryQuery&&countryOption)countrySelect.value=countryOption.value;const cityOption=[...citySelect.options].find(o=>normal(o.value)===cityQuery||normal(o.textContent)===cityQuery);if(cityQuery&&cityOption)citySelect.value=cityOption.value;if(hotelSearch?.elements.destination&&!params.has('destination')&&!params.has('q'))hotelSearch.elements.destination.value=citySelect.value||countrySelect.value||cityQuery||countryQuery||'';
    let unknownCountry=countryQuery&&!countryOption?countryQuery:'';let unknownCity=cityQuery&&!cityOption?cityQuery:'';
    const updateCities=()=>{for(const option of citySelect.options){if(!option.value)continue;option.disabled=!!countrySelect.value&&option.dataset.country!==countrySelect.value;option.hidden=option.disabled;}if(citySelect.selectedOptions[0]?.disabled)citySelect.value='';};updateCities();
    budgetInput.value=Math.min(45000,Math.max(5000,Number(params.get('budget'))||45000));const types=(params.get('type')||'').split(',');const amenities=(params.get('amenities')||'').split(',');hotelPanel.querySelectorAll('input[name="type"]').forEach(x=>x.checked=types.includes(x.value));hotelPanel.querySelectorAll('input[name="amenity"]').forEach(x=>x.checked=amenities.includes(x.value));if([...sortSelect.options].some(o=>o.value===params.get('sort')))sortSelect.value=params.get('sort');
    const apply=(persist=false)=>{const types=qa('[data-fh-hotel-filters] input[name="type"]:checked').map(x=>x.value);const amenities=qa('[data-fh-hotel-filters] input[name="amenity"]:checked').map(x=>x.value);const budget=Number(budgetInput.value);q('[data-fh-hotel-budget-label]').textContent=format(budget);budgetInput.setAttribute('aria-valuetext',format(budget));const visible=cards.filter(el=>(!destinationFilter||normal(el.dataset.search).includes(destinationFilter))&&(!countrySelect.value||el.dataset.country===countrySelect.value)&&(!citySelect.value||el.dataset.city===citySelect.value)&&(!unknownCountry||normal(el.dataset.search).includes(unknownCountry))&&(!unknownCity||normal(el.dataset.search).includes(unknownCity))&&(!types.length||types.includes(el.dataset.kind))&&amenities.every(a=>el.dataset.amenities.includes(a))&&Number(el.dataset.price)<=budget);const sort=sortSelect.value;visible.sort((a,b)=>sort==='price'?Number(a.dataset.price)-Number(b.dataset.price):sort==='price-desc'?Number(b.dataset.price)-Number(a.dataset.price):sort==='name'?a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent):cards.indexOf(a)-cards.indexOf(b));const pageCount=Math.max(1,Math.ceil(visible.length/perPage));currentPage=Math.min(currentPage,pageCount);const pageCards=visible.slice((currentPage-1)*perPage,currentPage*perPage);cards.forEach(el=>el.hidden=true);for(const el of visible)q('.fh-hotel-list').append(el);pageCards.forEach(el=>el.hidden=false);q('[data-fh-hotel-count]').textContent=visible.length;q('[data-fh-hotel-empty]').hidden=visible.length>0;q('[data-fh-hotel-range]').textContent=visible.length?'Showing '+((currentPage-1)*perPage+1)+'–'+Math.min(currentPage*perPage,visible.length)+' of '+visible.length+' stay concepts':'No stay concepts match';const where=citySelect.value?citySelect.selectedOptions[0].textContent:countrySelect.value?countrySelect.selectedOptions[0].textContent:destinationFilter?destinationName(params.get('destination')||params.get('q')):'';q('[data-fh-hotels-heading]').textContent=where?'Your kind of stay in '+where:'Find a stay that feels like you.';const nav=q('[data-fh-hotel-pagination]');nav.hidden=visible.length<=perPage;nav.innerHTML='<button type="button" data-fh-page="'+(currentPage-1)+'" '+(currentPage===1?'disabled':'')+' aria-label="Previous hotel results page">← Previous</button>'+Array.from({length:pageCount},(_,i)=>'<button type="button" data-fh-page="'+(i+1)+'" '+(currentPage===i+1?'aria-current="page"':'')+' aria-label="Hotel results page '+(i+1)+'">'+(i+1)+'</button>').join('')+'<button type="button" data-fh-page="'+(currentPage+1)+'" '+(currentPage===pageCount?'disabled':'')+' aria-label="Next hotel results page">Next →</button>';if(persist)setQuery({country:countrySelect.value||unknownCountry||null,city:citySelect.value||unknownCity||null,type:types.join(','),amenities:amenities.join(','),budget:budget<45000?budget:null,sort:sort==='recommended'?null:sort,page:currentPage>1?currentPage:null,destination:destinationFilter?params.get('destination'):null,q:destinationFilter?params.get('q'):null});};
    const change=event=>{currentPage=1;if(event.target===countrySelect){params.delete('destination');params.delete('q');unknownCountry='';unknownCity='';citySelect.value='';destinationFilter='';if(hotelSearch?.elements.destination)hotelSearch.elements.destination.value=countrySelect.value;updateCities();}if(event.target===citySelect){params.delete('destination');params.delete('q');unknownCity='';destinationFilter='';if(hotelSearch?.elements.destination)hotelSearch.elements.destination.value=citySelect.value||countrySelect.value;}apply(true);};hotelPanel.addEventListener('change',change);budgetInput.addEventListener('input',()=>{currentPage=1;apply(true);});sortSelect.addEventListener('change',()=>{currentPage=1;apply(true);});q('[data-fh-hotel-pagination]').addEventListener('click',event=>{const button=event.target.closest('[data-fh-page]');if(!button||button.disabled)return;currentPage=Number(button.dataset.fhPage);apply(true);q('.fh-results-heading').scrollIntoView({behavior:'smooth',block:'start'});});qa('[data-fh-reset-hotel]').forEach(b=>b.addEventListener('click',()=>{hotelPanel.querySelectorAll('input[type=checkbox]').forEach(x=>x.checked=false);budgetInput.value='45000';sortSelect.value='recommended';countrySelect.value='';citySelect.value='';unknownCountry='';unknownCity='';destinationFilter='';params.delete('destination');params.delete('q');if(hotelSearch?.elements.destination)hotelSearch.elements.destination.value='';currentPage=1;updateCities();apply(true);}));document.addEventListener('travora:currency-change',()=>apply());apply();
  }
  const carryRoomPreferences=link=>{const form=q('.fh-stay-plan');if(!form)return;const url=new URL(link.getAttribute('href'),location.origin);for(const key of ['depart','return','travellers','rooms','destination']){const value=form.elements[key]?.value;if(value)url.searchParams.set(key,value);}link.href=url.pathname+url.search;};
  qa('[data-fh-room-plan]').forEach(link=>{carryRoomPreferences(link);link.addEventListener('click',event=>{const form=q('.fh-stay-plan');if(form&&!form.reportValidity()){event.preventDefault();return;}carryRoomPreferences(link);});});
  q('.fh-stay-plan')?.addEventListener('change',()=>qa('[data-fh-room-plan]').forEach(carryRoomPreferences));
  qa('.fh-stay-plan').forEach(form=>{const update=()=>{const start=form.elements.depart;const end=form.elements.return;if(start.value){const next=new Date(start.value+'T12:00:00');next.setDate(next.getDate()+1);end.min=next.toISOString().slice(0,10);}end.setCustomValidity(end.value&&start.value&&end.value<=start.value?'Check-out must be after check-in.':'');if(form.elements.rooms)form.elements.rooms.setCustomValidity(Number(form.elements.rooms.value)>Number(form.elements.travellers.value)?'Choose at least one guest for each room.':'');};form.addEventListener('change',update);update();});
})();

;
/* Flights share the portal's configured base-currency pricing and enquiry flow. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const params=new URLSearchParams(location.search);
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const format=value=>window.TravoraCurrency?.format(Number(value))||new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',currencyDisplay:'code',maximumFractionDigits:0}).format(Number(value)*.012);
  const moneyHTML=value=>`<span data-money="${Number(value)}">${escape(format(value))}</span>`;
  const localDate=offset=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
  const nextWeek=value=>{const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+7);return d.toISOString().slice(0,10);};
  const readable=value=>validDate(value)?new Date(value+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Date to be confirmed';
  const code=value=>String(value||'').match(/\(([A-Za-z]{3})\)/)?.[1]?.toUpperCase()||(/^[A-Za-z]{3}$/.test(value||'')?value.toUpperCase():'');
  let catalogue=null;try{catalogue=JSON.parse($('#flight-catalogue')?.textContent||'null');}catch{}
  const routeFromQuery=catalogue?.routes.find(r=>r.id===params.get('route'));
  const supportedCabins=['economy','premium-economy','business','first'];
  const seedForm=$('[data-flight-search]');
  const seededDeparture=seedForm?.elements.namedItem('depart').value;
  const depart=validDate(params.get('depart'))&&params.get('depart')>=localDate(0)?params.get('depart'):(validDate(seededDeparture)&&seededDeparture>=localDate(0)?seededDeparture:localDate(22));
  const returnDate=validDate(params.get('return'))&&params.get('return')>=depart?params.get('return'):nextWeek(depart);
  const datesAdjusted=(params.has('depart')&&params.get('depart')!==depart)||(params.get('tripType')!=='oneway'&&params.has('return')&&params.get('return')!==returnDate);
  const adjustmentNote=()=>{const note=document.createElement('p');note.className='tf-date-adjustment';note.setAttribute('role','status');note.textContent='Please review your updated travel dates. Dates from this link were adjusted to a valid future travel range.';return note;};
  $$('[data-flight-search]').forEach(form=>{
    for(const name of ['from','to']){
      const field=form.elements.namedItem(name), raw=params.get(name), preset=routeFromQuery?.[name==='from'?'fromCode':'toCode'];
      const value=raw?code(raw):preset;
      if(value&&[...field.options].some(o=>o.value===value))field.value=value;
      else if(raw){const blank=new Option('Choose an airport','',true,true);field.prepend(blank);}
    }
    const departure=form.elements.namedItem('depart'), end=form.elements.namedItem('return');
    departure.min=localDate(0);departure.value=depart;end.value=returnDate;
    if(datesAdjusted)form.append(adjustmentNote());
    if(/^[1-9]$/.test(params.get('travellers')||''))form.elements.namedItem('travellers').value=params.get('travellers');
    if(supportedCabins.includes(params.get('cabin')))form.elements.namedItem('cabin').value=params.get('cabin');
    if(['round','oneway'].includes(params.get('tripType')))$$('[name="tripType"]',form).forEach(i=>i.checked=i.value===params.get('tripType'));
    const update=()=>{
      const trip=form.elements.namedItem('tripType').value, round=trip==='round';
      form.dataset.trip=trip;end.closest('[data-flight-return]').hidden=!round;end.disabled=!round;end.required=round;end.min=departure.value||localDate(0);
      end.setCustomValidity(round&&end.value&&departure.value&&end.value<departure.value?'Choose a return date on or after departure.':'');
      const same=form.elements.namedItem('from').value===form.elements.namedItem('to').value&&!!form.elements.namedItem('from').value;
      form.elements.namedItem('to').setCustomValidity(same?'Choose a destination airport different from your departure airport.':'');
      const message=$('[data-flight-search-error]',form);message.hidden=!same;message.textContent=same?'Your departure and destination airports must be different.':'';
    };
    form.addEventListener('change',update);form.addEventListener('submit',event=>{update();if(!form.reportValidity())event.preventDefault();});update();
  });
  if(!catalogue)return;
  const airports=new Map(catalogue.routes.flatMap(r=>[
    [r.fromCode,{code:r.fromCode,city:r.fromCity,country:r.fromCountry,countryId:r.fromCountryId,cityId:r.fromCityId}],
    [r.toCode,{code:r.toCode,city:r.toCity,country:r.country,countryId:r.countryId,cityId:r.cityId}]
  ]));
  const firstForm=$('[data-flight-search]');
  const defaultRoute=routeFromQuery||catalogue.routes[0];
  const fromCode=params.has('from')?code(params.get('from')):(firstForm?.elements.namedItem('from').value||defaultRoute.fromCode);
  const toCode=params.has('to')?code(params.get('to')):(firstForm?.elements.namedItem('to').value||defaultRoute.toCode);
  const origin=airports.get(fromCode), destination=airports.get(toCode);
  const exactRoute=catalogue.routes.find(r=>r.fromCode===fromCode&&r.toCode===toCode);
  const reversed=!exactRoute&&catalogue.routes.find(r=>r.fromCode===toCode&&r.toCode===fromCode);
  const route=exactRoute||reversed;
  const tripType=params.get('tripType')==='oneway'?'oneway':'round';
  const travellers=/^[1-9]$/.test(params.get('travellers')||'')?Number(params.get('travellers')):2;
  const cabin=supportedCabins.includes(params.get('cabin'))?params.get('cabin'):'economy';
  const cabinLabel=catalogue.cabins[cabin].label;
  const setText=(selector,value)=>$$(selector).forEach(el=>el.textContent=value);
  const duration=minutes=>Math.floor(minutes/60)+'h'+(minutes%60?' '+minutes%60+'m':'');
  const options=route?catalogue.options.map(o=>({...o,minutes:route.sampleDurationMinutes+o.extraMinutes,price:Math.round(route.sampleFareFrom*o.factor*catalogue.cabins[cabin].factor*(tripType==='round'?1.85:1)/50)*50})):[];
  const searchSummary=`${tripType==='round'?'Round Trip':'One Way'} · ${readable(depart)}${tripType==='round'?' – '+readable(returnDate):''} · ${travellers} ${travellers===1?'traveller':'travellers'} · ${cabinLabel}`;
  setText('[data-flight-origin]',origin?.city||'Choose your departure');
  setText('[data-flight-destination]',destination?.city||'Choose your destination');
  setText('[data-flight-origin-code]',origin?.code||'—');
  setText('[data-flight-destination-code]',destination?.code||'—');
  setText('[data-flight-search-summary]',searchSummary);
  setText('[data-flight-country-summary]',origin&&destination?origin.country+' → '+destination.country:'Choose two airports to compare journey examples.');
  setText('[data-flight-cabin]',cabinLabel);
  setText('[data-flight-traveller-summary]',`${travellers} ${travellers===1?'traveller':'travellers'} · ${cabinLabel}`);
  const baseQuery=()=>{
    const p=new URLSearchParams({from:fromCode,to:toCode,depart,travellers:String(travellers),cabin,tripType});
    if(tripType==='round')p.set('return',returnDate);
    if(exactRoute)p.set('route',exactRoute.id);
    return p;
  };
  const selectedOption=options.find(o=>o.id===params.get('flight'))||options[0];
  $$('[data-flight-enquire]').forEach(link=>{
    const p=baseQuery();p.set('service','flights');if(destination)p.set('destination',destination.cityId||destination.countryId);
    if(selectedOption&&location.pathname.includes('/review/'))p.set('flight',selectedOption.id);
    link.href='/plan-trip/?'+p.toString();
  });
  $$('[data-flight-select]').forEach(link=>{const p=baseQuery();p.set('flight',link.closest('[data-flight-option]').dataset.flightOption);link.href='/flights/review/?'+p.toString();});
  $$('[data-flight-edit]').forEach(link=>link.href='/flights/results/?'+baseQuery().toString());
  if(location.pathname.includes('/review/')){
    if(datesAdjusted)$('.tf-review>.page-title')?.append(adjustmentNote());
    setText('[data-flight-review-short]',origin&&destination?origin.city+' to '+destination.city:'Your requested route');
    setText('[data-flight-review-trip]',tripType==='round'?'Round Trip':'One Way');
    setText('[data-flight-review-travellers]',String(travellers));
    setText('[data-flight-outbound-date]',readable(depart));setText('[data-flight-return-date]',readable(returnDate));
    $$('[data-flight-return-leg]').forEach(el=>el.hidden=tripType!=='round');
    if(selectedOption){
      setText('[data-flight-review-option]',selectedOption.name);setText('[data-flight-review-depart]',selectedOption.depart);setText('[data-flight-review-return-depart]',selectedOption.returnDepart);
      setText('[data-flight-review-duration]',duration(selectedOption.minutes));setText('[data-flight-review-return-duration]',duration(selectedOption.minutes));setText('[data-flight-review-stop]',selectedOption.stops?'1 connection example':'Direct example');
      $('[data-flight-review-price]').innerHTML=moneyHTML(selectedOption.price);$('[data-flight-review-total]').innerHTML=moneyHTML(selectedOption.price*travellers);
    }else{
      for(const selector of ['[data-flight-review-price]','[data-flight-review-total]','[data-flight-review-duration]','[data-flight-review-return-duration]','[data-flight-review-depart]','[data-flight-review-return-depart]','[data-flight-review-stop]'])setText(selector,'To be quoted');
      setText('[data-flight-review-option]','Custom route enquiry');
    }
  }
  const panel=$('[data-flight-filters]');if(!panel)return;
  const disclosure=$('[data-flight-filter-disclosure]');if(window.matchMedia('(max-width: 800px)').matches)disclosure.open=false;
  const cards=$$('[data-flight-option]'), budget=$('[name="budget"]',panel),sort=$('[data-flight-sort]');
  for(const card of cards){
    const o=options.find(x=>x.id===card.dataset.flightOption);
    if(!o){card.hidden=true;continue;}
    card.dataset.price=o.price;card.dataset.minutes=o.minutes;
    $('[data-flight-price]',card).innerHTML=moneyHTML(o.price);$('[data-flight-duration]',card).textContent=duration(o.minutes);
    $('[data-flight-fare-label]',card).textContent=(tripType==='round'?'Round trip':'One way')+' · per person';
    $('[data-flight-round-note]',card).textContent=tripType==='round'?'Return journey included in example fare':'One-way journey';
  }
  const maximum=options.length?Math.ceil(Math.max(...options.map(o=>o.price))/5000)*5000:150000;
  budget.min='0';budget.max=String(maximum);budget.step='500';
  const requestedBudget=Number(params.get('fareMax'));budget.value=String(params.has('fareMax')&&Number.isFinite(requestedBudget)?Math.max(0,Math.min(maximum,requestedBudget)):maximum);
  for(const name of ['stops','time']){const selected=(params.get(name)||'').split(',');$$(`[name="${name}"]`,panel).forEach(input=>input.checked=selected.includes(input.value));}
  if([...sort.options].some(o=>o.value===params.get('sort')))sort.value=params.get('sort');
  const apply=(persist=false)=>{
    const stops=$$('[name="stops"]:checked',panel).map(x=>x.value), times=$$('[name="time"]:checked',panel).map(x=>x.value),limit=Number(budget.value);
    $('[data-flight-budget-label]').innerHTML=moneyHTML(limit);$('[data-flight-budget-min]').innerHTML=moneyHTML(0);$('[data-flight-budget-max]').innerHTML=moneyHTML(maximum);
    budget.setAttribute('aria-valuetext',format(limit)+' per person');
    let visible=0;
    cards.forEach(card=>{
      const o=options.find(x=>x.id===card.dataset.flightOption), hour=Number(o?.depart.slice(0,2)), time=hour>=6&&hour<12?'morning':hour>=12&&hour<18?'afternoon':'evening';
      card.hidden=!o||(stops.length&&!stops.includes(String(o.stops)))||(times.length&&!times.includes(time))||o.price>limit;
      if(!card.hidden)visible++;
    });
    setText('[data-flight-count]',String(visible));$('[data-flight-empty]').hidden=visible>0;
    if(!route){
      setText('[data-flight-empty-title]',origin&&destination?'No example journeys for this airport pair yet.':'Choose your departure and destination airports.');
      setText('[data-flight-empty-copy]',origin&&destination?'You can still request a tailored flight quote with these airports, dates and cabin preferences.':'Use the search fields above to select two different airports and your preferred dates.');
      $('[data-flight-empty] [data-flight-reset]').hidden=true;
    }
    const sortValue=sort.value;
    [...cards].sort((a,b)=>sortValue==='price'?Number(a.dataset.price)-Number(b.dataset.price):sortValue==='duration'?Number(a.dataset.minutes)-Number(b.dataset.minutes):sortValue==='departure'?a.dataset.depart.localeCompare(b.dataset.depart):cards.indexOf(a)-cards.indexOf(b)).forEach(card=>$('.tf-flight-list').append(card));
    const labels={morning:'Morning',afternoon:'Afternoon',evening:'Evening & night'};
    const chips=[...stops.map(x=>({type:'stops',value:x,label:x==='0'?'Direct examples':'1 connection'})),...times.map(x=>({type:'time',value:x,label:labels[x]})),...(limit<maximum?[{type:'budget',value:'',label:'Up to '+format(limit)}]:[])];
    $('[data-flight-selected-filters]').innerHTML=chips.map(x=>`<button type="button" data-flight-remove-filter="${x.type}" data-filter-value="${x.value}" aria-label="Remove ${escape(x.label)} filter">${escape(x.label)} <span aria-hidden="true">×</span></button>`).join('');
    if(persist){const url=new URL(location.href);for(const [k,v] of Object.entries({stops:stops.join(','),time:times.join(','),fareMax:limit<maximum?String(limit):'',sort:sortValue==='recommended'?'':sortValue})){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);}history.replaceState(null,'',url.pathname+url.search);}
    window.TravoraCurrency?.refresh();
  };
  panel.addEventListener('change',()=>apply(true));budget.addEventListener('input',()=>apply(true));sort.addEventListener('change',()=>apply(true));
  $$('[data-flight-reset]').forEach(button=>button.addEventListener('click',()=>{$$('input[type="checkbox"]',panel).forEach(x=>x.checked=false);budget.value=String(maximum);sort.value='recommended';apply(true);}));
  $('[data-flight-selected-filters]').addEventListener('click',event=>{const button=event.target.closest('[data-flight-remove-filter]');if(!button)return;if(button.dataset.flightRemoveFilter==='budget')budget.value=String(maximum);else $$(`input[name="${button.dataset.flightRemoveFilter}"]`,panel).forEach(x=>{if(x.value===button.dataset.filterValue)x.checked=false;});apply(true);});
  document.addEventListener('travora:currency-change',()=>apply(false));apply();
})();

;
window.TravoraPlaces=[{"id":"uk","name":"United Kingdom","countryId":"uk","parentId":null,"aliases":["uk","United Kingdom","uk","united kingdom","great britain","britain","england","scotland"]},{"id":"singapore","name":"Singapore","countryId":"singapore","parentId":null,"aliases":["singapore","Singapore","singapore","sg"]},{"id":"malaysia","name":"Malaysia","countryId":"malaysia","parentId":null,"aliases":["malaysia","Malaysia","malaysia","my"]},{"id":"thailand","name":"Thailand","countryId":"thailand","parentId":null,"aliases":["thailand","Thailand","thailand","thai"]},{"id":"vietnam","name":"Vietnam","countryId":"vietnam","parentId":null,"aliases":["vietnam","Vietnam","vietnam","viet nam"]},{"id":"usa","name":"United States of America","countryId":"usa","parentId":null,"aliases":["usa","United States of America","usa","us","united states","united states of america","america"]},{"id":"uae","name":"United Arab Emirates","countryId":"uae","parentId":null,"aliases":["uae","United Arab Emirates","uae","united arab emirates","emirates"]},{"id":"indonesia","name":"Indonesia","countryId":"indonesia","parentId":null,"aliases":["indonesia","Indonesia","indonesia","bali","nusa penida"]},{"id":"maldives","name":"Maldives","countryId":"maldives","parentId":null,"aliases":["maldives","Maldives","maldives","maldives"]},{"id":"london","name":"London","countryId":"uk","parentId":"uk","aliases":["london","London","london","london"]},{"id":"edinburgh","name":"Edinburgh","countryId":"uk","parentId":"uk","aliases":["edinburgh","Edinburgh","edinburgh","edinburgh"]},{"id":"bath","name":"Bath","countryId":"uk","parentId":"uk","aliases":["bath","Bath","bath","roman baths","pulteney bridge"]},{"id":"marina-bay","name":"Marina Bay","countryId":"singapore","parentId":"singapore","aliases":["marina-bay","Marina Bay","marina bay","marina bay"]},{"id":"sentosa","name":"Sentosa","countryId":"singapore","parentId":"singapore","aliases":["sentosa","Sentosa","sentosa","sentosa"]},{"id":"orchard-road","name":"Orchard Road","countryId":"singapore","parentId":"singapore","aliases":["orchard-road","Orchard Road","orchard","orchard road","emerald hill"]},{"id":"chinatown","name":"Chinatown","countryId":"singapore","parentId":"singapore","aliases":["chinatown","Chinatown","chinatown","singapore chinatown","maxwell"]},{"id":"kuala-lumpur","name":"Kuala Lumpur","countryId":"malaysia","parentId":"malaysia","aliases":["kuala-lumpur","Kuala Lumpur","kuala lumpur","kuala lumpur"]},{"id":"penang","name":"Penang","countryId":"malaysia","parentId":"malaysia","aliases":["penang","Penang","penang","george town","georgetown"]},{"id":"langkawi","name":"Langkawi","countryId":"malaysia","parentId":"malaysia","aliases":["langkawi","Langkawi","langkawi","langkawi"]},{"id":"bangkok","name":"Bangkok","countryId":"thailand","parentId":"thailand","aliases":["bangkok","Bangkok","bangkok","bangkok"]},{"id":"chiang-mai","name":"Chiang Mai","countryId":"thailand","parentId":"thailand","aliases":["chiang-mai","Chiang Mai","chiang mai","chiangmai","doi suthep"]},{"id":"phuket","name":"Phuket","countryId":"thailand","parentId":"thailand","aliases":["phuket","Phuket","phuket","phuket"]},{"id":"hanoi","name":"Hanoi","countryId":"vietnam","parentId":"vietnam","aliases":["hanoi","Hanoi","hanoi","hanoi"]},{"id":"hoi-an","name":"Hoi An","countryId":"vietnam","parentId":"vietnam","aliases":["hoi-an","Hoi An","hoi an","hoi an"]},{"id":"da-nang","name":"Da Nang","countryId":"vietnam","parentId":"vietnam","aliases":["da-nang","Da Nang","da nang","danang","dragon bridge","my khe"]},{"id":"ho-chi-minh-city","name":"Ho Chi Minh City","countryId":"vietnam","parentId":"vietnam","aliases":["ho-chi-minh-city","Ho Chi Minh City","ho chi minh","ho chi minh city","saigon","hcmc"]},{"id":"new-york","name":"New York","countryId":"usa","parentId":"usa","aliases":["new-york","New York","new york","new york","nyc","new york city"]},{"id":"los-angeles","name":"Los Angeles","countryId":"usa","parentId":"usa","aliases":["los-angeles","Los Angeles","los angeles","los angeles","la","los angeles city"]},{"id":"san-francisco","name":"San Francisco","countryId":"usa","parentId":"usa","aliases":["san-francisco","San Francisco","san francisco","sf","golden gate"]},{"id":"las-vegas","name":"Las Vegas","countryId":"usa","parentId":"usa","aliases":["las-vegas","Las Vegas","las vegas","vegas","nevada","the strip"]},{"id":"dubai","name":"Dubai","countryId":"uae","parentId":"uae","aliases":["dubai","Dubai","dubai","dubai"]},{"id":"abu-dhabi","name":"Abu Dhabi","countryId":"uae","parentId":"uae","aliases":["abu-dhabi","Abu Dhabi","abu dhabi","abu dhabi"]},{"id":"bali","name":"Bali","countryId":"indonesia","parentId":"indonesia","aliases":["bali","Bali","bali","indonesia"]}];
(() => {
  const normal = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
  const places = Array.isArray(window.TravoraPlaces) ? window.TravoraPlaces : [];
  const findPlace = value => {
    const key = normal(value);
    return key ? places.find(p => p.id === key) || places.find(p => p.aliases.some(alias => normal(alias) === key)) : undefined;
  };
  const currency = () => window.TravoraCurrency;
  const format = amount => currency()?.format(amount) || new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0}).format(amount);
  const styleLabels = {all:'All styles',city:'City breaks',culture:'Culture & food',beach:'Beach escapes',family:'Family holidays',romantic:'Honeymoon & romance',adventure:'Adventure',luxury:'Luxury stays'};
  const durationLabels = {all:'Any duration',short:'3–5 days',week:'6–7 days',long:'8–10 days',extended:'11+ days'};
  const pageSize = 9;
  const documentParams = new URLSearchParams(location.search);
  const preferredDates = ['depart', 'return'].map((key, index) => documentParams.get(key) || (index === 0 ? documentParams.get('date') : ''));
  const requestedTravellers = Number(documentParams.get('travellers'));
  const dateLabel = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(new Date(value + 'T12:00:00').getTime()) ? new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '';

  document.querySelectorAll('[data-ex-results]').forEach((root, rootIndex) => {
    const one = selector => root.querySelector(selector);
    const all = selector => Array.from(root.querySelectorAll(selector));
    if (preferredDates.some(date => dateLabel(date)) || (requestedTravellers >= 1 && requestedTravellers <= 30)) {
      const summary = document.createElement('p');
      summary.className = 'ts-stay-summary';
      const dates = preferredDates.map(dateLabel).filter(Boolean);
      const pieces = [dates.length ? 'Preferred dates: ' + dates.join(' – ') : '', requestedTravellers >= 1 && requestedTravellers <= 30 ? requestedTravellers + (requestedTravellers === 1 ? ' traveller' : ' travellers') : ''].filter(Boolean);
      pieces.forEach(text => { const span = document.createElement('span'); span.textContent = text; summary.append(span); });
      one('.ex-results-section-head > div')?.append(summary);
    }
    const initialGeo = root.dataset.initialDestination || 'all';
    const scopeCountry = root.dataset.scopeCountry || '';
    const allowed = place => place && (!scopeCountry || place.countryId === scopeCountry);
    const requested = findPlace(documentParams.get('destination') || documentParams.get('country'));
    const exactQuery = findPlace(documentParams.get('q'));
    const hasRequested = allowed(requested);
    const compatibleQuery = allowed(exactQuery) && (!hasRequested || requested.countryId === exactQuery.countryId);
    const queryGeo = compatibleQuery && (!hasRequested || exactQuery.parentId || !requested.parentId) ? exactQuery : requested;
    const positive = value => value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
    const budgetParam = documentParams.get('budget');
    const state = {
      geo: compatibleQuery ? queryGeo.id : hasRequested ? requested.id : initialGeo,
      query: compatibleQuery ? '' : (documentParams.get('q') || ''),
      budget: ['all','50000','100000','200000','300000'].includes(budgetParam) ? budgetParam : 'all',
      duration: Object.hasOwn(durationLabels, documentParams.get('duration')) ? documentParams.get('duration') : 'all',
      style: Object.hasOwn(styleLabels, documentParams.get('style')) ? documentParams.get('style') : 'all',
      sort: ['recommended','price-asc','price-desc','duration'].includes(documentParams.get('sort')) ? documentParams.get('sort') : 'recommended',
      page: Math.max(1, Number.parseInt(documentParams.get('page') || '1', 10) || 1),
      min: positive(documentParams.get('min')),
      max: positive(documentParams.get('max'))
    };
    if (!requested && !documentParams.get('q') && documentParams.get('destination') && documentParams.get('destination') !== 'all') state.query = documentParams.get('destination');
    const cards = all('[data-ex-grid] > [data-ex-tour]');
    cards.forEach((card, i) => card.dataset.originalIndex = String(i));
    const search = one('[data-ex-search] input[name=q]');
    const grid = one('[data-ex-grid]');
    const selected = one('[data-ex-selected]');
    const pagination = one('[data-ex-pagination]');
    const disclosure = one('[data-ex-filter-disclosure]');
    const media = window.matchMedia('(max-width: 760px)');
    function responsiveFilters() { disclosure.open = !media.matches; }
    responsiveFilters();
    media.addEventListener?.('change', responsiveFilters);

    function geoMatches(card, value) {
      if (!value || value === 'all') return true;
      const place = findPlace(value);
      if (!place) return false;
      return place.parentId ? (card.dataset.destinations || '').split(' ').includes(place.id) : (card.dataset.countries || card.dataset.country || '').split(' ').includes(place.countryId);
    }
    function syncControls() {
      search.value = state.query;
      all('[data-ex-geo]').forEach(input => input.checked = input.value === state.geo);
      all('[data-ex-budget]').forEach(input => input.checked = input.value === state.budget);
      all('[data-ex-length]').forEach(input => input.checked = input.value === state.duration);
      one('[data-ex-style-select]').value = state.style;
      one('[data-ex-sort]').value = state.sort;
      all('[data-ex-style]').forEach(button => {
        const active = button.dataset.exStyle === state.style;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const current = findPlace(state.geo);
      if (current) all('[data-ex-country-group]').forEach(group => {
        const groupPlace = findPlace(group.dataset.exCountryGroup);
        if (groupPlace?.countryId === current.countryId) group.open = true;
      });
    }
    function chip(text, key, locked = false) {
      const element = document.createElement(locked ? 'span' : 'button');
      element.className = 'ex-selected-chip' + (locked ? ' is-scope' : '');
      element.textContent = text;
      if (!locked) {
        element.type = 'button';
        element.dataset.exClear = key;
        element.setAttribute('aria-label', 'Remove filter: ' + text);
        const cross = document.createElement('span');
        cross.textContent = '×';
        cross.setAttribute('aria-hidden', 'true');
        element.append(cross);
      }
      selected.append(element);
    }
    function renderSelected() {
      selected.replaceChildren();
      let activeCount = 0;
      const geo = findPlace(state.geo);
      if (geo) { chip(geo.name, 'geo', Boolean(scopeCountry && state.geo === initialGeo)); if (state.geo !== initialGeo) activeCount++; }
      if (state.query) { chip('Search: ' + state.query, 'query'); activeCount++; }
      if (state.budget !== 'all') { chip('Under ' + format(Number(state.budget)), 'budget'); activeCount++; }
      if (state.min !== null) { chip('From ' + format(state.min), 'min'); activeCount++; }
      if (state.max !== null) { chip('Up to ' + format(state.max), 'max'); activeCount++; }
      if (state.duration !== 'all') { chip(durationLabels[state.duration], 'duration'); activeCount++; }
      if (state.style !== 'all') { chip(styleLabels[state.style], 'style'); activeCount++; }
      selected.hidden = selected.children.length === 0;
      one('[data-ex-filter-total]').textContent = activeCount ? String(activeCount) : '';
    }
    function syncURL() {
      if (rootIndex > 0) return;
      const next = new URLSearchParams();
      for (const key of ['date','depart','return','month','travellers']) {
        const value = documentParams.get(key);
        if (value) next.set(key, value);
      }
      if (state.geo !== 'all' && (!scopeCountry || state.geo !== initialGeo)) next.set('destination', state.geo);
      if (state.query) next.set('q', state.query);
      if (state.style !== 'all') next.set('style', state.style);
      if (state.budget !== 'all') next.set('budget', state.budget);
      if (state.duration !== 'all') next.set('duration', state.duration);
      if (state.sort !== 'recommended') next.set('sort', state.sort);
      if (state.min !== null) next.set('min', String(state.min));
      if (state.max !== null) next.set('max', String(state.max));
      if (state.page > 1) next.set('page', String(state.page));
      const query = next.toString();
      history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    }
    function pageButton(label, page, disabled, current = false) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.dataset.exPage = String(page);
      button.disabled = disabled;
      button.setAttribute('aria-label', /^\d+$/.test(label) ? 'Result page ' + page : label + ' result page');
      if (current) button.setAttribute('aria-current', 'page');
      pagination.append(button);
    }
    function apply({resetPage = false, updateURL = false} = {}) {
      if (resetPage) state.page = 1;
      const query = normal(state.query), queryPlace = findPlace(query);
      const matches = cards.filter(card => {
        const price = Number(card.dataset.price), days = Number(card.dataset.days);
        const tags = (card.dataset.style || '').split(' ');
        const durationOK = state.duration === 'all' || (state.duration === 'short' ? days >= 3 && days <= 5 : state.duration === 'week' ? days >= 6 && days <= 7 : state.duration === 'long' ? days >= 8 && days <= 10 : days >= 11);
        return geoMatches(card, state.geo) &&
          (!query || (queryPlace ? geoMatches(card, queryPlace.id) : normal(card.dataset.name).includes(query))) &&
          (state.style === 'all' || tags.includes(state.style)) &&
          (state.budget === 'all' || price < Number(state.budget)) &&
          (state.min === null || price >= state.min) &&
          (state.max === null || price <= state.max) && durationOK;
      });
      matches.sort((a, b) => state.sort === 'price-asc' ? Number(a.dataset.price) - Number(b.dataset.price) : state.sort === 'price-desc' ? Number(b.dataset.price) - Number(a.dataset.price) : state.sort === 'duration' ? Number(a.dataset.days) - Number(b.dataset.days) : Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));
      cards.forEach(card => card.hidden = true);
      const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
      state.page = Math.min(state.page, pageCount);
      const start = (state.page - 1) * pageSize, end = Math.min(start + pageSize, matches.length);
      matches.forEach(card => grid.append(card));
      matches.slice(start, end).forEach(card => card.hidden = false);
      one('[data-ex-count]').textContent = matches.length + (matches.length === 1 ? ' holiday' : ' holidays') + (matches.length ? ' · Showing ' + (start + 1) + '–' + end : '');
      one('[data-ex-empty]').hidden = matches.length > 0;
      pagination.replaceChildren();
      pagination.hidden = matches.length <= pageSize;
      if (pageCount > 1) {
        pageButton('Previous', state.page - 1, state.page === 1);
        for (let i = 1; i <= pageCount; i++) pageButton(String(i), i, false, i === state.page);
        pageButton('Next', state.page + 1, state.page === pageCount);
      }
      syncControls();
      renderSelected();
      currency()?.refresh(root);
      if (updateURL) syncURL();
    }
    function clearAll() {
      Object.assign(state, {geo:initialGeo,query:'',budget:'all',duration:'all',style:'all',sort:'recommended',page:1,min:null,max:null});
      apply({updateURL:true});
    }
    root.addEventListener('change', event => {
      const input = event.target;
      if (input.matches('[data-ex-geo]')) { state.geo = input.value; state.query = ''; }
      else if (input.matches('[data-ex-budget]')) { state.budget = input.value; state.min = null; state.max = null; }
      else if (input.matches('[data-ex-length]')) state.duration = input.value;
      else if (input.matches('[data-ex-sort]')) state.sort = input.value;
      else if (input.matches('[data-ex-style-select]')) state.style = input.value;
      else return;
      apply({resetPage:true, updateURL:true});
    });
    root.addEventListener('click', event => {
      const reset = event.target.closest('[data-ex-reset]');
      if (reset) { clearAll(); return; }
      const style = event.target.closest('[data-ex-style]');
      if (style) { state.style = style.dataset.exStyle; apply({resetPage:true,updateURL:true}); return; }
      const clear = event.target.closest('[data-ex-clear]');
      if (clear) {
        const key = clear.dataset.exClear;
        if (key === 'geo') state.geo = initialGeo;
        else if (key === 'query') state.query = '';
        else if (key === 'min' || key === 'max') state[key] = null;
        else state[key] = 'all';
        apply({resetPage:true,updateURL:true});
        return;
      }
      const page = event.target.closest('[data-ex-page]');
      if (page && !page.disabled) {
        state.page = Number(page.dataset.exPage);
        apply({updateURL:true});
        one('[data-ex-count]').scrollIntoView({behavior:'smooth',block:'center'});
      }
    });
    search.addEventListener('input', () => { state.query = search.value; apply({resetPage:true,updateURL:true}); });
    one('[data-ex-search]').addEventListener('submit', event => {
      event.preventDefault();
      const place = findPlace(search.value);
      if (allowed(place)) { state.geo = place.id; state.query = ''; }
      else state.query = search.value;
      apply({resetPage:true,updateURL:true});
      one('[data-ex-count]').scrollIntoView({behavior:'smooth',block:'center'});
    });
    document.addEventListener('travora:currency-change', renderSelected);
    apply();
  });

  document.querySelectorAll('[data-ex-tour] a[href^="/tours/"]').forEach(link => {
    const url = new URL(link.getAttribute('href'), location.origin);
    for (const key of ['date','depart','return','month','travellers']) {
      const value = documentParams.get(key);
      if (value) url.searchParams.set(key, value);
    }
    link.href = url.pathname + url.search;
  });

  document.querySelectorAll('[data-ex-gallery]').forEach(gallery => {
    const buttons = Array.from(gallery.querySelectorAll('[data-ex-gallery-image]'));
    const main = gallery.querySelector('.ex-trip-main-image img, .ex-destination-cover>img');
    const caption = gallery.querySelector('[data-ex-gallery-caption-display]');
    const count = gallery.querySelector('[data-ex-gallery-count]');
    if (!buttons.length || !main) return;
    let index = 0;
    function showPhoto(next) {
      index = (next + buttons.length) % buttons.length;
      const button = buttons[index];
      main.src = button.dataset.exGalleryImage;
      main.alt = button.dataset.exGalleryCaption;
      if (caption) caption.textContent = button.dataset.exGalleryCaption;
      if (count) count.textContent = (index + 1) + ' / ' + buttons.length;
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    }
    buttons.forEach((button, i) => button.addEventListener('click', () => showPhoto(i)));
    gallery.querySelector('[data-ex-gallery-prev]')?.addEventListener('click', () => showPhoto(index - 1));
    gallery.querySelector('[data-ex-gallery-next]')?.addEventListener('click', () => showPhoto(index + 1));
  });
  document.querySelectorAll('[data-ex-future-date]').forEach(input => {
    const today = new Date();
    const local = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    input.min = local(today);
    const requested = documentParams.get('date') || documentParams.get('depart');
    if (/^\d{4}-\d{2}-\d{2}$/.test(requested || '') && requested >= input.min) input.value = requested;
  });
  document.querySelectorAll('.ex-trip-enquiry').forEach(form => {
    const travellers = Number(documentParams.get('travellers'));
    if (Number.isInteger(travellers) && travellers >= 1 && travellers <= 30) form.elements.travellers.value = String(travellers);
    const returning = documentParams.get('return');
    if (dateLabel(returning)) {
      const label = document.createElement('label');
      label.textContent = 'Preferred return date';
      const input = document.createElement('input');
      input.type = 'date'; input.name = 'return'; input.value = returning;
      label.append(input);
      form.elements.travellers.closest('label').before(label);
    }
    const month = documentParams.get('month');
    if (month) { const input = document.createElement('input'); input.type = 'hidden'; input.name = 'month'; input.value = month.slice(0, 40); form.append(input); }
    function updateEnquiryLinks() {
      const returning = form.elements.return;
      if (returning) {
        returning.min = form.elements.date.value || form.elements.date.min;
        returning.setCustomValidity(returning.value && form.elements.date.value && returning.value < form.elements.date.value ? 'Choose a return date on or after your departure.' : '');
      }
      document.querySelectorAll('[data-ex-package-enquiry]').forEach(link => {
        const url = new URL(link.getAttribute('href'), location.origin);
        for (const key of ['date','depart','return','travellers']) url.searchParams.delete(key);
        for (const key of ['month']) {
          const value = documentParams.get(key);
          if (value) url.searchParams.set(key, value);
        }
        if (returning?.value && returning.validity.valid) url.searchParams.set('return', returning.value);
        if (form.elements.date.value && form.elements.date.validity.valid) url.searchParams.set('date', form.elements.date.value);
        if (form.elements.travellers.validity.valid) url.searchParams.set('travellers', form.elements.travellers.value);
        link.href = url.pathname + url.search;
      });
    }
    form.addEventListener('input', updateEnquiryLinks);
    form.addEventListener('change', updateEnquiryLinks);
    updateEnquiryLinks();
  });
})();

;

(() => {
 const root=document.querySelector('[data-dv5-country-list]');
 if(!root)return;
 const query=root.querySelector('[data-dv5-country-query]');
 const cards=[...root.querySelectorAll('[data-dv5-country]')];
 const buttons=[...root.querySelectorAll('[data-dv5-country-style]')];
 const params=new URLSearchParams(location.search);
 let style=params.get('style')||'all';
 if(!buttons.some(b=>b.dataset.dv5CountryStyle===style))style='all';
 query.value=params.get('q')||'';
 function update(){
  const words=query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let count=0;
  cards.forEach(card=>{const matches=words.every(word=>card.dataset.dv5Search.includes(word))&&(style==='all'||card.dataset.dv5Styles.split(' ').includes(style));card.hidden=!matches;if(matches)count++;});
  buttons.forEach(button=>{const active=button.dataset.dv5CountryStyle===style;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  root.querySelector('[data-dv5-country-count]').textContent=count+' '+(count===1?'country':'countries')+' to inspire your next chapter';
  root.querySelector('[data-dv5-country-empty]').hidden=count>0;
 }
 query.addEventListener('input',update);
 buttons.forEach(button=>button.addEventListener('click',()=>{style=button.dataset.dv5CountryStyle;update();}));
 root.querySelector('[data-dv5-country-clear]').addEventListener('click',()=>{query.value='';style='all';update();query.focus();});
 update();
})();

;
(() => {
  if (!location.pathname.startsWith('/transportation/')) return;
  const params = new URLSearchParams(location.search);
  const search = document.querySelector('[data-service-search="transportation"]');
  const validRide = {airport:'Airport transfer',private:'Private car & driver',intercity:'City-to-city journey'};
  const requested = key => params.get(key) || search?.elements[key]?.value || '';
  const pickup = (requested('pickup') || 'Singapore Changi airport (SIN)').slice(0, 120);
  const dropoff = (requested('dropoff') || 'Marina Bay, Singapore').slice(0, 120);
  const passengers = Math.max(1, Math.min(20, parseInt(requested('passengers') || '2', 10) || 2));
  const ride = Object.hasOwn(validRide, requested('ride')) ? requested('ride') : 'airport';
  const day = requested('date');
  const localDate = value => value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
  const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(day) && localDate(new Date(day + 'T12:00:00')) === day;
  const time = requested('time');
  const timeValid = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
  const dateText = dateValid ? new Date(day + 'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : 'Choose your travel date';
  document.querySelectorAll('[data-tp-pickup]').forEach(element => element.textContent = pickup);
  document.querySelectorAll('[data-tp-dropoff]').forEach(element => element.textContent = dropoff);
  document.querySelectorAll('[data-tp-passengers]').forEach(element => element.textContent = passengers + ' passenger' + (passengers === 1 ? '' : 's'));
  document.querySelectorAll('[data-tp-ride]').forEach(element => element.textContent = validRide[ride]);
  document.querySelectorAll('[data-tp-date]').forEach(element => element.textContent = dateText + (timeValid ? ' · ' + time + ' local time' : ''));
  const journey = new URLSearchParams({pickup, dropoff, passengers:String(passengers), ride});
  if (dateValid) journey.set('date', day);
  if (timeValid) journey.set('time', time);
  document.querySelectorAll('[data-tp-detail],[data-tp-back],[data-tp-plan]').forEach(link => {
    const url = new URL(link.getAttribute('href'), location.origin);
    journey.forEach((value, key) => url.searchParams.set(key, value));
    link.href = url.pathname + url.search;
  });
  if (search) {
    search.elements.pickup.value = pickup;
    search.elements.dropoff.value = dropoff;
    if (dateValid) search.elements.date.value = day;
    if (timeValid && search.elements.time) search.elements.time.value = time;
    if ([...search.elements.passengers.options].some(option => option.value === String(passengers))) search.elements.passengers.value = String(passengers);
    search.querySelectorAll('[name="ride"]').forEach(input => input.checked = input.value === ride);
  }
  const capacity = document.getElementById('tp-min-passengers');
  const sort = document.getElementById('tp-sort');
  const list = document.querySelector('.tp-results-list');
  if (!capacity || !list) return;
  if (![...capacity.options].some(option => option.value === String(passengers))) {
    const option = document.createElement('option');
    option.value = String(passengers); option.textContent = passengers + ' passengers'; capacity.append(option);
  }
  capacity.value = String(passengers);
  function update() {
    const minimum = Number(capacity.value);
    const cards = [...list.querySelectorAll('[data-tp-vehicle]')];
    cards.sort((a, b) => sort.value === 'space' ? Number(b.dataset.seats) - Number(a.dataset.seats) : sort.value === 'price-desc' ? Number(b.dataset.price) - Number(a.dataset.price) : Number(a.dataset.price) - Number(b.dataset.price));
    let count = 0;
    for (const card of cards) { card.hidden = Number(card.dataset.seats) < minimum; if (!card.hidden) count++; list.append(card); }
    document.querySelector('[data-tp-count]').textContent = count;
    document.querySelector('[data-tp-empty]').hidden = count > 0;
  }
  capacity.addEventListener('change', update);
  sort.addEventListener('change', update);
  document.querySelector('[data-tp-reset]').addEventListener('click', () => { capacity.value = '1'; sort.value = 'price-asc'; update(); });
  update();
})();
;
/* Journal filters enhance the linked, server-rendered story collection. */
(()=>{
 const listing=document.querySelector('[data-blog-listing]');
 if(!listing)return;
 const form=listing.querySelector('[data-blog-search]');
 const input=form.querySelector('input[name="q"]');
 const cards=Array.from(listing.querySelectorAll('[data-blog-card]'));
 const categoryButtons=Array.from(listing.querySelectorAll('[data-blog-category-filter]'));
 const count=listing.querySelector('[data-blog-count]');
 const summary=listing.querySelector('[data-blog-summary]');
 const empty=listing.querySelector('[data-blog-empty]');
 const pagination=listing.querySelector('[data-blog-pagination]');
 const clear=listing.querySelector('.blog-result-summary [data-blog-clear]');
 const heading=listing.querySelector('#blog-stories-heading');
 const pageSize=Number(listing.dataset.pageSize)||6;
 const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 let category='all',page=1,debounce;

 function readLocation(){
  const query=new URLSearchParams(location.search);
  input.value=(query.get('q')||'').slice(0,120);
  category=categoryButtons.some(button=>button.dataset.blogCategoryFilter===query.get('category'))?query.get('category'):'all';
  page=Math.max(1,parseInt(query.get('page'),10)||1);
 }
 function saveLocation(){
  const url=new URL(location.href);
  const query=input.value.trim();
  query?url.searchParams.set('q',query):url.searchParams.delete('q');
  category==='all'?url.searchParams.delete('category'):url.searchParams.set('category',category);
  page>1?url.searchParams.set('page',String(page)):url.searchParams.delete('page');
  history.replaceState(null,'',url.pathname+url.search+url.hash);
 }
 function pageButton(label,value,{current=false,disabled=false,ariaLabel}={}){
  const button=document.createElement('button');
  button.type='button';button.className='blog-page-button';button.textContent=label;
  button.dataset.blogPage=String(value);button.disabled=disabled;
  if(current)button.setAttribute('aria-current','page');
  if(ariaLabel)button.setAttribute('aria-label',ariaLabel);
  return button;
 }
 function render({save=true,focus=false}={}){
  const words=normalize(input.value).split(/\s+/).filter(Boolean);
  const matching=cards.filter(card=>(category==='all'||card.dataset.blogCategory===category)&&words.every(word=>normalize(card.dataset.blogSearchtext).includes(word)));
  const pages=Math.ceil(matching.length/pageSize);
  page=Math.min(Math.max(page,1),pages||1);
  const visible=new Set(matching.slice((page-1)*pageSize,page*pageSize));
  cards.forEach(card=>{card.hidden=!visible.has(card);});
  categoryButtons.forEach(button=>{const active=button.dataset.blogCategoryFilter===category;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
  count.textContent=`${matching.length} ${matching.length===1?'story':'stories'}`;
  const currentCategory=categoryButtons.find(button=>button.dataset.blogCategoryFilter===category)?.textContent;
  summary.textContent=matching.length?`${(page-1)*pageSize+1}–${Math.min(page*pageSize,matching.length)} of ${matching.length} ${matching.length===1?'story':'stories'}${category!=='all'?` · ${currentCategory}`:''}${input.value.trim()?` matching “${input.value.trim()}”`:''}`:'Try a different search or explore all stories.';
  empty.hidden=matching.length!==0;
  clear.hidden=category==='all'&&!input.value.trim();
  pagination.replaceChildren();
  pagination.hidden=pages<=1;
  if(pages>1){
   pagination.append(pageButton('Previous',page-1,{disabled:page===1,ariaLabel:'Previous page of stories'}));
   for(let number=1;number<=pages;number++)pagination.append(pageButton(String(number),number,{current:number===page,ariaLabel:`Page ${number} of stories`}));
   pagination.append(pageButton('Next',page+1,{disabled:page===pages,ariaLabel:'Next page of stories'}));
  }
  if(save)saveLocation();
  if(focus){heading.focus({preventScroll:true});heading.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
 }
 form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(debounce);page=1;render();});
 input.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>{page=1;render();},180);});
 categoryButtons.forEach(button=>button.addEventListener('click',()=>{clearTimeout(debounce);category=button.dataset.blogCategoryFilter;page=1;render();}));
 listing.querySelectorAll('[data-blog-clear]').forEach(button=>button.addEventListener('click',()=>{clearTimeout(debounce);input.value='';category='all';page=1;render();input.focus();}));
 pagination.addEventListener('click',event=>{const button=event.target.closest('[data-blog-page]');if(!button||button.disabled)return;page=Number(button.dataset.blogPage);render({focus:true});});
 window.addEventListener('popstate',()=>{clearTimeout(debounce);readLocation();render({save:false});});
 readLocation();render({save:false});
})();
