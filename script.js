const menu=document.querySelector('.menu-btn');const links=document.querySelector('.nav-links');
const setMenu=o=>{links.classList.toggle('open',o);menu.setAttribute('aria-expanded',o);menu.setAttribute('aria-label',o?'Close menu':'Open menu');menu.textContent=o?'✕':'☰'};
if(menu&&links){menu.addEventListener('click',()=>setMenu(!links.classList.contains('open')));links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)))}
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();