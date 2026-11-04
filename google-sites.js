/* Google Sites integration: ?embed=1&page=home|lab|code|lessons|grades|account */
(()=>{'use strict';
 const params=new URLSearchParams(location.search);
 const accepted=['home','lab','code','lessons','grades','account'];
 const embed=params.get('embed')==='1';
 if(embed){document.body.classList.add('is-embedded');const bar=document.createElement('div');bar.className='embed-banner';const message=document.createElement('strong');message.textContent='MicroLab 3D Academy · ห้องเรียนไมโครคอนโทรลเลอร์';const a=document.createElement('a');a.href=location.origin+location.pathname;a.target='_blank';a.rel='noopener noreferrer';a.textContent='เปิดเว็บเต็มหน้าจอ ↗';bar.append(message,a);document.body.prepend(bar)}
 const requested=params.get('page');if(accepted.includes(requested)){const n=document.querySelector('#nav [data-page="'+requested+'"]');if(n)n.click()}
 // Keep a linkable page query for teachers to embed separate lessons/tabs in Google Sites.
 document.querySelectorAll('#nav [data-page]').forEach(b=>b.addEventListener('click',()=>{const p=new URL(location.href);p.searchParams.set('page',b.dataset.page);history.replaceState(null,'',p.pathname+p.search+p.hash)}));
 // The login page is best opened top-level if embedded browser blocks session storage.
 if(embed){const account=document.getElementById('account');if(account){const info=document.createElement('p');info.className='note';info.textContent='หากการเข้าสู่ระบบใน Google Sites ไม่ทำงาน ให้เลือก “เปิดเว็บเต็มหน้าจอ” ด้านบนเพื่อใช้งานระบบสมาชิกโดยตรง';account.prepend(info)}}
})();
