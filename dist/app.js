// Central website configuration. Only the explicitly approved WhatsApp contact is published.
const company = {
  name: 'Aminosoft Global',
  contact: { whatsappNumber: '94716848320' },
  products: [{ name: 'Aminosoft Artha', url: 'https://artha.aminosoftglobal.com/', capabilities: ['Service Invoices', 'Quotations', 'Customer Details', 'PDF Downloads & Sharing', 'Inventory · Paid Plans', 'Accounting · Selected Plans'] }],
  strengths: [
    ['◇', 'Practical business solutions', 'Useful tools for real tasks—from preparing a quotation to organizing the day’s work.'],
    ['⌁', 'User-friendly software', 'Thoughtful experiences that make complex tasks feel simpler and more approachable.'],
    ['⟐', 'Affordable technology', 'A Free plan to get started with Artha, plus paid options as your needs change.'],
    ['↗', 'Room to grow', 'Start with the tools you need today and explore more features when your work calls for them.'],
    ['◎', 'Solutions shaped around you', 'Ready-made products for shared challenges, custom development for requirements that are different.'],
    ['⟳', 'Continuous improvement', 'An ongoing commitment to learning, refining, and making our software better.']
  ],
  steps: [
    ['Understand', 'We start by understanding business needs and the challenges behind them.'],
    ['Design', 'We shape practical solutions with clarity and usability at their core.'],
    ['Develop', 'We turn ideas into reliable software with thoughtful engineering.'],
    ['Improve', 'We keep listening, learning, and refining the experience.']
  ]
};
document.querySelector('#capabilities').innerHTML = company.products[0].capabilities.map(item => `<li><span>✓</span>${item}</li>`).join('');
document.querySelector('#strengths').innerHTML = company.strengths.map(([icon,title,description]) => `<article><span class="strength-icon" aria-hidden="true">${icon}</span><h3>${title}</h3><p>${description}</p></article>`).join('');
document.querySelector('#steps').innerHTML = company.steps.map(([title,description],i) => `<article><div class="step-index"><span>0${i+1}</span><span aria-hidden="true">${i===3?'✓':'→'}</span></div><h3>${title}</h3><p>${description}</p></article>`).join('');
const whatsappUrl = `https://wa.me/${company.contact.whatsappNumber}`;
for (const link of document.querySelectorAll('.whatsapp-link')) {
  link.href = whatsappUrl;
}
document.querySelector('#year').textContent=new Date().getFullYear();
const toggle=document.querySelector('.menu');const navigation=document.querySelector('#navigation');
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');navigation.classList.remove('open');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');navigation.classList.toggle('open',open);});
navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();toggle.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.nav-wrap'))closeMenu();});
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('#navigation a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}}},{rootMargin:'-15% 0px -60% 0px'});
for(const id of ['home','about','solutions','products','contact'])observer.observe(document.getElementById(id));
