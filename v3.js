/* MicroLab 3D Academy v3 improvements; depends on v2 interface and enhances, does not replace, its 3D viewer */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const boardPin={esp32:18,uno:13};
const pinData={
 esp32:[
  ['3V3','3.3V','Power', 'แหล่งจ่าย 3.3 V จากบอร์ด ไม่ใช่ขาดิจิทัล'],['GND','กราวด์','Power','จุดอ้างอิงทางไฟฟ้า'],
  ['GPIO18','I/O, SPI SCK','Output','เหมาะกับ LED ภายนอกในแบบฝึกนี้'],['GPIO19','I/O, SPI MISO','I/O','ขาดิจิทัลทั่วไป'],
  ['GPIO21','I/O, I²C SDA','I/O','ใช้สื่อสาร I²C ได้'],['GPIO22','I/O, I²C SCL','I/O','ใช้สื่อสาร I²C ได้'],
  ['GPIO23','I/O, SPI MOSI','I/O','ขาดิจิทัลทั่วไป'],['GPIO25','I/O, DAC1','I/O','มีความสามารถ DAC บางรุ่น'],
  ['GPIO26','I/O, DAC2','I/O','มีความสามารถ DAC บางรุ่น'],['GPIO27','I/O','I/O','ขาดิจิทัลทั่วไป'],
  ['GPIO32','I/O, ADC','I/O','ขารับสัญญาณอนาล็อกได้'],['GPIO33','I/O, ADC','I/O','ขารับสัญญาณอนาล็อกได้'],
  ['GPIO34','Input only','Input','รับสัญญาณเข้าเท่านั้น ไม่เป็น Output'],['GPIO35','Input only','Input','รับสัญญาณเข้าเท่านั้น ไม่เป็น Output'],
  ['GPIO0','Boot strap','Caution','มีผลต่อโหมดบูต ควรตรวจเอกสารบอร์ดก่อนใช้งาน'],['GPIO2','Boot strap','Caution','มีผลต่อการเริ่มทำงานในบางบอร์ด'],
  ['GPIO4','Boot strap','Caution','มีข้อพิจารณาเกี่ยวกับการบูต'],['GPIO5','Boot strap','Caution','มีข้อพิจารณาเกี่ยวกับการบูต']
 ],
 uno:[
  ['5V','5 โวลต์','Power','จ่ายไฟ 5V ตามขีดจำกัดของบอร์ด'],['3.3V','3.3 โวลต์','Power','ขาจ่ายไฟ 3.3V ตามข้อกำหนด'],['GND','กราวด์','Power','จุดกราวด์วงจร'],
  ['D0','RX','I/O','Serial RX; หลีกเลี่ยงการชนกับการสื่อสาร USB'],['D1','TX','I/O','Serial TX; หลีกเลี่ยงการชนกับการสื่อสาร USB'],
  ['D2','Digital','I/O','รับอินเทอร์รัปต์ภายนอกได้'],['D3','PWM','I/O','PWM และอินเทอร์รัปต์ภายนอก'],
  ['D4','Digital','I/O','ขาดิจิทัลทั่วไป'],['D5','PWM','I/O','ขาดิจิทัลที่รองรับ PWM'],
  ['D6','PWM','I/O','ขาดิจิทัลที่รองรับ PWM'],['D7','Digital','I/O','ขาดิจิทัลทั่วไป'],
  ['D8','Digital','I/O','ขาดิจิทัลทั่วไป'],['D9','PWM','I/O','รองรับ PWM'],['D10','PWM, SPI SS','I/O','รองรับ PWM/SPI'],
  ['D11','PWM, SPI MOSI','I/O','รองรับ PWM/SPI'],['D12','SPI MISO','I/O','การสื่อสาร SPI'],
  ['D13','SPI SCK, LED L','I/O','มี LED บนบอร์ดเชื่อมต่ออยู่กับ D13'],
  ['A0','Analog','Input','อ่านค่าอนาล็อก'],['A1','Analog','Input','อ่านค่าอนาล็อก'],['A2','Analog','Input','อ่านค่าอนาล็อก'],
  ['A3','Analog','Input','อ่านค่าอนาล็อก'],['A4','I²C SDA','I/O','อ่านอนาล็อกหรือใช้ I²C'],['A5','I²C SCL','I/O','อ่านอนาล็อกหรือใช้ I²C']
 ]
};
const example=b=>`// ${b==='uno'?'Arduino UNO R3':'ESP32 DevKit'}: วงจร LED ภายนอก\nconst int ledPin = ${boardPin[b]};\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(1000);\n  digitalWrite(ledPin, LOW);\n  delay(1000);\n}`;
function el(tag,attrs={},txt){const n=document.createElement(tag);for(const [key,v] of Object.entries(attrs))if(key==='className')n.className=v;else n.setAttribute(key,v);if(txt!==undefined)n.textContent=txt;return n}
function status(node,txt,okay=false){node.textContent=txt;node.className='status v3-status '+(okay?'good':'');}
function panel(parent,title){const box=el('div',{className:'panel v3-panel'});box.append(el('h2',{},title));parent.append(box);return box;}
// Accessible, documented pin reference. A conceptual viewer, NOT a physical footprint or CAD pin map.
const homePanel=panel($('home'),'📍 Pinout Explorer — ขาใช้งานของบอร์ด');
homePanel.append(el('p',{className:'v3-muted'},'ตารางขาอ้างอิงเพื่อการเรียนรู้ แยกความสามารถและข้อควรระวัง บอร์ด ESP32 มีหลายรุ่นย่อย โปรดตรวจฉลากขาบนบอร์ดจริงก่อนต่ออุปกรณ์'));
const pinGrid=el('div',{className:'v3-pins',id:'pinGrid'}),pinInfo=el('div',{className:'info',id:'pinInfo',role:'status','aria-live':'polite'},'เลือกขาจากตารางเพื่ออ่านข้อมูล');homePanel.append(pinGrid,pinInfo);
let activePin='';
function showPins(){const b=$('boardSelect').value;pinGrid.replaceChildren();activePin='';pinInfo.textContent='เลือกขาเพื่ออ่านคำอธิบาย';pinData[b].forEach(([name,label,type,detail])=>{
const btn=el('button',{type:'button',className:'v3-pin','aria-label':`${name} ${label}`});btn.append(el('b',{},name),el('small',{},label));btn.addEventListener('click',()=>{pinGrid.querySelectorAll('.v3-pin').forEach(n=>n.classList.remove('active'));btn.classList.add('active');activePin=name;pinInfo.textContent=`${name} — ${label} (${type}) : ${detail}`});pinGrid.append(btn)});}
$('boardSelect').addEventListener('change',showPins);showPins();
// The core training example is synchronized with the selected board and chosen pin.
function ensurePins(){const board=$('labBoard').value,select=$('pinSelect');const options=board==='uno'?[13,8,7,9,10,11]:[18,19,21,22,23,25,26,27,32,33];const prev=Number(select.value);select.replaceChildren();options.forEach(pin=>select.add(el('option',{value:String(pin)},(board==='uno'?'D':'GPIO ')+pin)));select.value=options.includes(prev)?String(prev):String(boardPin[board]);select.dispatchEvent(new Event('change',{bubbles:false}));}
function syncCodeBoard(){const b=$('codeBoard').value;const store='microlab3d_draft_'+b;const draft=localStorage.getItem(store);$('editor').value=draft??example(b);}
$('editor').addEventListener('input',()=>{try{localStorage.setItem('microlab3d_draft_'+$('codeBoard').value,$('editor').value)}catch{}});
['labBoard','boardSelect'].forEach(id=>$(id).addEventListener('change',()=>{ensurePins();setTimeout(syncCodeBoard,0)}));
$('codeBoard').addEventListener('change',()=>{ensurePins();setTimeout(syncCodeBoard,0)});
$('resetCode').addEventListener('click',()=>{const b=$('codeBoard').value;$('editor').value=example(b);try{localStorage.removeItem('microlab3d_draft_'+b)}catch{}});
ensurePins();syncCodeBoard();
const message=panel($('code'),'✅ การตรวจและจำลองโค้ด');
message.append(el('p',{},'การตรวจโค้ดในเว็บเป็นการตรวจรูปแบบเพื่อฝึกทักษะเท่านั้น หากต้องการคอมไพล์และจำลอง MCU ให้เปิดโครงการใน Wokwi พร้อมนำไฟล์ sketch.ino และ diagram.json ไปวาง'));
// Replace v2 Wokwi output: synchronize selected pin with code sketch and diagram.
function download(name,data,mime='text/plain'){const blob=new Blob([data],{type:mime}),url=URL.createObjectURL(blob),a=el('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function wokwiDiagram(b,pin){const uno=b==='uno';return {version:1,author:'MicroLab 3D Academy V3',editor:'wokwi',parts:[
{type:uno?'wokwi-arduino-uno':'board-esp32-devkit-c-v4',id:'mcu',top:0,left:0,attrs:{}},
{type:'wokwi-resistor',id:'r1',top:75,left:295,attrs:{value:'220'}},
{type:'wokwi-led',id:'led1',top:145,left:360,attrs:{color:'red'}}],
connections:[[`mcu:${pin}`,'r1:1','green',[]],['r1:2','led1:A','green',[]],['led1:C','mcu:GND.1','black',[]]],dependencies:{}};}
$('downloadProject').onclick=()=>{const b=$('codeBoard').value,code=$('editor').value;const match=code.match(/(?:const\s+int\s+ledPin\s*=\s*|#define\s+ledPin\s+)(\d+)/);const pin=match?Number(match[1]):boardPin[b];const allowed=b==='uno'?[2,3,4,5,6,7,8,9,10,11,12,13]:[18,19,21,22,23,25,26,27,32,33];if(!allowed.includes(pin)){status($('codeStatus'),'ขาที่ระบุในตัวแปร ledPin ไม่อยู่ในรายการขา Output สำหรับแบบฝึกนี้ กรุณาเลือกขาที่แนะนำก่อน');return}
download('sketch.ino',code);download('diagram.json',JSON.stringify(wokwiDiagram(b,pin),null,2),'application/json');status($('codeStatus'),`ส่งออกไฟล์ Wokwi แล้ว (${b==='uno'?'D':'GPIO '}${pin}) โปรดตรวจผังสายและกด Run ใน Wokwi เพื่อจำลองจริง`,true)};
// Clear statement of capabilities and no promises of real hardware physics.
const safety=panel($('lab'),'🛡️ ข้อจำกัดการจำลองและการต่อวงจรจริง');
safety.append(el('div',{className:'v3-warning'},'แบบฝึกต่อสายตรวจเฉพาะเส้นทางวงจร LED ตัวอย่าง ไม่จำลองกระแสไฟฟ้า แรงดันลัดวงจร หรือความเสียหายของอุปกรณ์ สำหรับบอร์ดจริงควรใช้ไฟเลี้ยงและแรงดันลอจิกตามคู่มือผู้ผลิต และมีผู้สอนกำกับดูแล'));
// Add optional class management on Supabase. Scoring is performed only by PostgreSQL RPC.
const cloudConfigured=Boolean(window.MICROLAB_CONFIG?.supabaseUrl&&window.MICROLAB_CONFIG?.supabaseAnonKey);
const classPanel=panel($('account'),'🏫 จัดการชั้นเรียน');
classPanel.append(el('p',{className:'v3-muted'},'ครูสร้างชั้นเรียนและแจกรหัสเข้าร่วม นักเรียนเข้าร่วมด้วยรหัส การอ่านคะแนนของครูจำกัดเฉพาะผู้เรียนในชั้นเรียนของตน'));
const controls=el('div',{className:'v3-flex'});
const className=el('input',{className:'control v3-input',placeholder:'ชื่อชั้นเรียน เช่น ไมโครคอนโทรลเลอร์ ปวช.2','aria-label':'ชื่อชั้นเรียน'});
const createBtn=el('button',{className:'btn',type:'button'},'สร้างชั้นเรียน');
const classCode=el('input',{className:'control v3-input',placeholder:'รหัสเข้าร่วม 10 ตัวอักษร','aria-label':'รหัสเข้าร่วมชั้นเรียน',maxLength:'20'});
const joinBtn=el('button',{className:'btn secondary',type:'button'},'เข้าร่วมชั้นเรียน');
controls.append(className,createBtn,classCode,joinBtn);
const classStatus=el('div',{className:'status',role:'status'},cloudConfigured?'กรุณาเข้าสู่ระบบก่อนใช้งานชั้นเรียน':'โหมดสาธิต: ยังไม่ได้ตั้งค่า Supabase');
const reloadClasses=el('button',{className:'btn secondary',type:'button'},'รีเฟรชรายชื่อชั้นเรียน');
const classRows=el('div',{});classPanel.append(controls,classStatus,reloadClasses,classRows);
let cloudClient=null;
function getClient(){if(!cloudConfigured||!window.supabase)return null;if(!cloudClient)cloudClient=window.supabase.createClient(window.MICROLAB_CONFIG.supabaseUrl,window.MICROLAB_CONFIG.supabaseAnonKey,{auth:{storageKey:'microlab-v3-auth'}});return cloudClient}
// Shared auth storage is necessary to reuse v2 login: do not use a second unique session key.
function client(){if(!cloudConfigured||!window.supabase)return null;if(!cloudClient)cloudClient=window.supabase.createClient(window.MICROLAB_CONFIG.supabaseUrl,window.MICROLAB_CONFIG.supabaseAnonKey);return cloudClient}
async function signed(){const c=client();if(!c)return {c:null,u:null};const {data,error}=await c.auth.getUser();return {c,u:error?null:data.user};}
async function classroomList(){const {c,u}=await signed();if(!u){status(classStatus,'กรุณาเข้าสู่ระบบก่อนใช้งานชั้นเรียน');return}const [rooms,members,profile]=await Promise.all([
c.from('classrooms').select('id,name,join_code,teacher_id').order('id',{ascending:false}),
c.from('classroom_members').select('classroom_id,student_id'),
c.from('profiles').select('role').eq('id',u.id).maybeSingle()]);
if(rooms.error){status(classStatus,'อ่านชั้นเรียนไม่สำเร็จ: '+rooms.error.message);return}
const isTeacher=profile.data?.role==='teacher';createBtn.disabled=!isTeacher;className.disabled=!isTeacher;
classRows.replaceChildren();for(const room of rooms.data||[]){const box=el('div',{className:'v3-class'});const isOwner=room.teacher_id===u.id;box.append(el('b',{},room.name));box.append(el('p',{className:'v3-muted'},isOwner?`รหัสเชิญ: ${room.join_code} • สมาชิก ${(members.data||[]).filter(x=>x.classroom_id===room.id).length} คน`:'เป็นสมาชิกชั้นเรียนนี้'));classRows.append(box)}
if(!(rooms.data||[]).length)classRows.append(el('p',{className:'v3-muted'},'ยังไม่มีชั้นเรียนสำหรับบัญชีนี้'));
status(classStatus,'โหลดชั้นเรียนเรียบร้อย',true)}
createBtn.onclick=async()=>{const {c,u}=await signed();if(!u){status(classStatus,'ต้องเข้าสู่ระบบก่อน');return}const {data,error}=await c.rpc('create_classroom',{p_name:className.value.trim()});if(error){status(classStatus,error.message);return}className.value='';status(classStatus,'สร้างชั้นเรียนแล้ว รหัสเข้าร่วม: '+data?.[0]?.class_code,true);classroomList()};
joinBtn.onclick=async()=>{const {c,u}=await signed();if(!u){status(classStatus,'ต้องเข้าสู่ระบบก่อน');return}const {data,error}=await c.rpc('join_classroom',{p_code:classCode.value.trim()});if(error){status(classStatus,error.message);return}status(classStatus,'เข้าร่วมชั้นเรียน '+data+' แล้ว',true);classCode.value='';classroomList()};
reloadClasses.onclick=classroomList;
// In cloud mode, quiz answers go only to trusted SQL function. v2 client-side quiz handler is replaced.
if(cloudConfigured){
$('syncBtn').disabled=true;$('syncBtn').title='คะแนนใน V3 จะถูกตรวจและบันทึกที่เซิร์ฟเวอร์โดยตรง';$('syncBtn').textContent='✓ ตรวจและบันทึกคะแนนอัตโนมัติ';
$('submitQuiz').onclick=async()=>{const {c,u}=await signed();const result=$('quizResult');result.classList.remove('hidden');if(!u){status(result,'กรุณาเข้าสู่ระบบก่อนทำแบบทดสอบที่มีการบันทึกคะแนน');return}
const title=$('lessonTitle').textContent,lesson=Number(title.match(/บทเรียนที่\s*(\d+)/)?.[1]);if(!(lesson>=1&&lesson<=5)){status(result,'ไม่พบเลขบทเรียน');return}
const answers=[];for(let i=0;i<3;i++){const checked=document.querySelector(`input[name="question${i}"]:checked`);if(!checked){status(result,'กรุณาตอบคำถามทั้ง 3 ข้อ');return}answers.push(Number(checked.value))}
$('submitQuiz').disabled=true;
try{const {data,error}=await c.rpc('submit_quiz',{p_lesson_id:lesson,p_answers:answers});if(error)throw error;const r=data?.[0];status(result,`ระบบตรวจคำตอบบนเซิร์ฟเวอร์แล้ว • รอบนี้ ${r?.latest_score}/3 • คะแนนดีที่สุด ${r?.best_score}/3`,true);await cloudProgress();}catch(e){status(result,'บันทึกคะแนนไม่สำเร็จ: '+e.message)}finally{$('submitQuiz').disabled=false}};
const scoreNote=$('grades').querySelector('.note');if(scoreNote)scoreNote.textContent='โหมดคลาวด์: คะแนนทางการตรวจและจัดเก็บที่ Supabase โดยไม่รับคะแนนที่กำหนดจากเบราว์เซอร์';
const cloudScorePanel=panel($('grades'),'☁️ คะแนนที่ยืนยันจากฐานข้อมูล');const cloudScoreBody=el('div',{role:'status'},'เข้าสู่ระบบเพื่อดูคะแนนทางการ');const refresh=el('button',{className:'btn secondary',type:'button'},'รีเฟรชคะแนนจากฐานข้อมูล');cloudScorePanel.append(refresh,cloudScoreBody);refresh.onclick=cloudProgress;
async function cloudProgress(){const {c,u}=await signed();if(!u){cloudScoreBody.textContent='กรุณาเข้าสู่ระบบ';return}const {data,error}=await c.from('lesson_scores').select('lesson_id,score').eq('student_id',u.id).order('lesson_id');if(error){cloudScoreBody.textContent=error.message;return}cloudScoreBody.replaceChildren();let total=0;for(let i=1;i<=5;i++){const s=data?.find(x=>x.lesson_id===i)?.score??0;total+=s;cloudScoreBody.append(el('p',{},`บทที่ ${i}: ${s}/3 คะแนน`))}cloudScoreBody.append(el('strong',{},`รวม ${total}/15 คะแนน (${Math.round(total/15*100)}%)`));}
$('loginBtn').addEventListener('click',()=>setTimeout(()=>{classroomList();cloudProgress()},1200));
$('logoutBtn').addEventListener('click',()=>setTimeout(()=>{classRows.replaceChildren();cloudScoreBody.textContent='กรุณาเข้าสู่ระบบ'},200));
}
// Disallow accidental presentation of local demo scores as authenticated grades.
const demoNote=el('p',{className:'v3-muted'},'หมายเหตุ: คะแนนสาธิตที่เก็บในเบราว์เซอร์แก้ไขได้ ไม่ควรใช้เป็นคะแนนทางการของสถานศึกษา');$('grades').append(demoNote);
})();
