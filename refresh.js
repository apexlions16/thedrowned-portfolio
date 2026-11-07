(()=>{'use strict';
const filters=[...document.querySelectorAll('[data-project-filter]')];
const cards=[...document.querySelectorAll('.project[data-status]')];
if(!filters.length||!cards.length)return;
const applyFilter=filter=>{
  filters.forEach(button=>{
    const active=button.dataset.projectFilter===filter;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  cards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.status!==filter;});
};
filters.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.projectFilter)));
applyFilter('all');
})();
