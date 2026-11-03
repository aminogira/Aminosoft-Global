// Central company configuration. Replace null values with verified details only.
const company = {
  name: 'Aminosoft Global',
  contact: { email: null, telephone: null, address: null, facebook: null, linkedin: null },
  products: [{ name: 'Aminosoft Artha', url: 'https://artha.aminosoftglobal.com/', capabilities: ['Inventory Management', 'Accounting Management', 'Hire Purchase Management', 'Multi-Branch Management', 'Reports & Analytics', 'Merchant Management'] }],
  strengths: [
    ['◇', 'Practical business solutions', 'Built around real operational challenges, with a clear focus on everyday usefulness.'],
    ['⌁', 'User-friendly software', 'Thoughtful experiences that make complex tasks feel simpler and more approachable.'],
    ['⟐', 'Modern technology', 'Contemporary tools and thoughtful engineering for evolving business needs.'],
    ['↗', 'Scalable architecture', 'A considered foundation designed to adapt as your business requirements grow.'],
    ['◎', 'Customer-focused development', 'Business needs guide how we think, what we build, and where we go next.'],
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
const contactFields = [['Email address','email','Email to be added'], ['Telephone','telephone','Telephone to be added'], ['Business address','address','Address to be added']];
const details = document.querySelector('#contact-details');
for (const [label,key,placeholder] of contactFields) {
  const row = document.createElement('div'); row.className='contact-row';
  const heading = document.createElement('span'); heading.textContent=label; row.append(heading);
  const value=company.contact[key];
  const element=document.createElement(value && key!=='address' ? 'a' : 'p');
  element.textContent=value || placeholder;
  if (!value) element.className='placeholder';
  if (value && key!=='address') element.href=(key==='email'?'mailto:':'tel:')+value;
  row.append(element); details.append(row);
}
const socials = ['facebook','linkedin'].filter(key=>company.contact[key]);
if(socials.length){const container=document.querySelector('#footer-social');container.textContent='';for(const key of socials){const a=document.createElement('a');a.href=company.contact[key];a.textContent=key==='facebook'?'Facebook ↗':'LinkedIn ↗';a.target='_blank';a.rel='noopener noreferrer';container.append(a);}}
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('.approach').id='approach';document.querySelector('#approach-link').href='#approach';
const toggle=document.querySelector('.menu');const navigation=document.querySelector('#navigation');
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');navigation.classList.remove('open');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');navigation.classList.toggle('open',open);});
navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();toggle.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.nav-wrap'))closeMenu();});
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('#navigation a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}}},{rootMargin:'-15% 0px -60% 0px'});
for(const id of ['home','about','solutions','products','contact'])observer.observe(document.getElementById(id));
