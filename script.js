document.addEventListener("DOMContentLoaded",()=>{
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const num=id=>{const v=parseFloat($("#"+id)?.value);return Number.isFinite(v)?v:0};
const f=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):"—";
const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
let history=JSON.parse(localStorage.getItem("industools-history")||"[]");
let favorites=new Set(JSON.parse(localStorage.getItem("industools-favorites")||"[]"));

function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2200)}
function addHistory(tool,input,result){
  const signature=tool+"|"+input+"|"+result;
  if(history[0]?.signature===signature)return;
  history.unshift({tool,input,result,signature,time:new Date().toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})});
  history=history.slice(0,12);localStorage.setItem("industools-history",JSON.stringify(history));renderHistory();
}
function renderHistory(){
  const box=$("#historyList");box.innerHTML="";
  if(!history.length){box.innerHTML='<div class="empty">Tus últimos cálculos aparecerán aquí.</div>';return}
  history.forEach(h=>{const d=document.createElement("div");d.className="history-item";d.innerHTML=`<div><b>${h.tool}</b><span>${h.input} · ${h.time}</span></div><strong>${h.result}</strong>`;box.appendChild(d)})
}
$("#clearHistory").addEventListener("click",()=>{history=[];localStorage.removeItem("industools-history");renderHistory();toast("Historial limpiado")});

function toolTitle(key){return $(`.tool[data-key="${key}"] h3`)?.textContent||key}
function renderFavorites(){
  $$(".fav").forEach(b=>b.classList.toggle("active",favorites.has(b.dataset.fav)));
  const list=$("#favoritesList"),empty=$("#favoritesEmpty");list.innerHTML="";
  if(!favorites.size){empty.style.display="block";return}empty.style.display="none";
  favorites.forEach(key=>{const card=$(`.tool[data-key="${key}"]`);if(!card)return;const d=document.createElement("button");d.className="favorite-link";d.innerHTML=`<span>★ FAVORITA</span>${toolTitle(key)}`;d.addEventListener("click",()=>card.scrollIntoView({behavior:"smooth",block:"center"}));list.appendChild(d)})
}
$$(".fav").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.fav;favorites.has(k)?favorites.delete(k):favorites.add(k);localStorage.setItem("industools-favorites",JSON.stringify([...favorites]));renderFavorites();toast(favorites.has(k)?"Añadida a favoritas":"Eliminada de favoritas")}));
$("#goFavorites").addEventListener("click",()=>$("#favoritas").scrollIntoView({behavior:"smooth"}));

function calc420(log=false){const ma=num("maValue"),min=num("maMin"),max=num("maMax"),u=$("#maUnit").value.trim();const p=(ma-4)/16,val=min+p*(max-min);$("#maOut").textContent=`${f(val)} ${u}`;$("#maPct").textContent=`${f(p*100,1)} % del rango`;if(log)addHistory("4–20 mA → proceso",`${ma} mA · ${min}…${max} ${u}`,`${f(val)} ${u}`)}
function calcProc420(log=false){const x=num("procValue"),min=num("procMin"),max=num("procMax"),u=$("#procUnit").value.trim();const p=(x-min)/(max-min),ma=4+16*p;$("#procMaOut").textContent=`${f(ma)} mA`;$("#procPct").textContent=`${f(p*100,1)} % del rango`;if(log)addHistory("Proceso → 4–20 mA",`${x} ${u} · ${min}…${max}`,`${f(ma)} mA`)}
function calc010(log=false){const v=num("vValue"),min=num("vMin"),max=num("vMax"),u=$("#vUnit").value.trim(),p=v/10,val=min+p*(max-min);$("#vOut").textContent=`${f(val)} ${u}`;$("#vPct").textContent=`${f(p*100,1)} % del rango`;if(log)addHistory("0–10 V → proceso",`${v} V · ${min}…${max} ${u}`,`${f(val)} ${u}`)}
function calcScale(log=false){const x=num("scIn"),a=num("scInMin"),b=num("scInMax"),c=num("scOutMin"),d=num("scOutMax"),u=$("#scUnit").value.trim();const den=b-a;const m=den?((d-c)/den):0,y=c+(x-a)*m,k=c-m*a;$("#scOut").textContent=`${f(y)} ${u}`;$("#scFormula").textContent=`y = ${f(m,6)}·x ${k>=0?"+":"−"} ${f(Math.abs(k),4)}`;if(log)addHistory("Escalado lineal",`${x} de ${a}…${b}`,`${f(y)} ${u}`)}
function calcBase(log=false){const base=parseInt($("#baseType").value,10),raw=$("#baseValue").value.trim();let v=parseInt(raw,base);if(!Number.isFinite(v))v=0;$("#baseDec").textContent=`DEC ${v}`;$("#baseBin").textContent=`BIN ${v.toString(2).toUpperCase()}`;$("#baseHex").textContent=`HEX ${v.toString(16).toUpperCase()}`;if(log)addHistory("Bases numéricas",`${raw} (base ${base})`,`DEC ${v} · HEX ${v.toString(16).toUpperCase()}`)}
function calcWord(log=false){let u=clamp(Math.round(num("wordValue")),0,65535),s=u>32767?u-65536:u,hex=u.toString(16).toUpperCase().padStart(4,"0"),bin=u.toString(2).padStart(16,"0");$("#wordSigned").textContent=`INT: ${s}`;$("#wordUnsigned").textContent=`UINT: ${u}`;$("#wordHex").textContent=`HEX: ${hex}`;$("#wordBin").textContent=`BIN: ${bin}`;if(log)addHistory("WORD 16-bit",`UINT ${u}`,`INT ${s} · HEX ${hex}`)}
function calcFloat(log=false){const r1=clamp(Math.round(num("reg1")),0,65535),r2=clamp(Math.round(num("reg2")),0,65535),order=$("#wordOrder").value;const buf=new ArrayBuffer(4),view=new DataView(buf);if(order==="ABCD"){view.setUint16(0,r1,false);view.setUint16(2,r2,false)}else{view.setUint16(0,r2,false);view.setUint16(2,r1,false)}const val=view.getFloat32(0,false),hex=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();$("#floatOut").textContent=Number.isFinite(val)?f(val,6):String(val);$("#floatHex").textContent=`HEX: ${hex}`;if(log)addHistory("Modbus → FLOAT",`${r1}, ${r2} · ${order}`,Number.isFinite(val)?f(val,6):String(val))}
function calcTime(log=false){const x=num("timeValue"),u=$("#timeUnit").value;let ms=x;if(u==="s")ms=x*1000;if(u==="min")ms=x*60000;if(u==="h")ms=x*3600000;const s=ms/1000,m=s/60,h=m/60;$("#timeMs").textContent=`${f(ms,0)} ms`;$("#timeOther").textContent=`${f(s,3)} s · ${f(m,3)} min · ${f(h,4)} h`;if(log)addHistory("Tiempo PLC",`${x} ${u}`,`${f(ms,0)} ms`)}
function s5Encode(seconds){
 const choices=[{base:.01,code:0},{base:.1,code:1},{base:1,code:2},{base:10,code:3}];
 let best=null;
 for(const c of choices){const val=Math.round(seconds/c.base);if(val>=1&&val<=999){const represented=val*c.base,err=Math.abs(represented-seconds);if(!best||err<best.err)best={...c,val,represented,err}}}
 if(!best)return null;
 const hundreds=Math.floor(best.val/100),tens=Math.floor((best.val%100)/10),ones=best.val%10;
 const word=(best.code<<12)|(hundreds<<8)|(tens<<4)|ones;
 return {...best,word};
}
function s5Text(sec){if(sec<1)return `S5T#${Math.round(sec*1000)}MS`;if(sec<60)return `S5T#${f(sec,sec%1?2:0)}S`;if(sec<3600){const m=Math.floor(sec/60),s=Math.round(sec%60);return `S5T#${m}M${s?`${s}S`:""}`}const h=Math.floor(sec/3600),m=Math.round((sec%3600)/60);return `S5T#${h}H${m?`${m}M`:""}`}
function calcS5(log=false){const sec=num("s5Seconds"),e=s5Encode(sec);if(!e){$("#s5Text").textContent="Fuera de rango";$("#s5Hex").textContent="S5TIME admite aprox. 10 ms…9990 s";return}$("#s5Text").textContent=s5Text(e.represented);$("#s5Hex").textContent=`WORD: W#16#${e.word.toString(16).toUpperCase().padStart(4,"0")} · real ${f(e.represented,2)} s`;if(log)addHistory("S5TIME",`${sec} s`,s5Text(e.represented))}
function calcThree(log=false){const V=num("tpV"),I=num("tpI"),pf=clamp(num("tpPf"),0,1),eff=clamp(num("tpEff"),0,100)/100;const kva=Math.sqrt(3)*V*I/1000,kw=kva*pf*eff;$("#tpOut").textContent=`${f(kw)} kW`;$("#tpApp").textContent=`Aparente: ${f(kva)} kVA`;if(log)addHistory("Potencia trifásica",`${V} V · ${I} A · cosφ ${pf}`,`${f(kw)} kW`)}
function calcOhm(log=false){const V=num("ohmV"),R=num("ohmR"),I=R?V/R:0,P=V*I;$("#ohmI").textContent=`${f(I,3)} A`;$("#ohmP").textContent=`Potencia: ${f(P)} W`;if(log)addHistory("Ley de Ohm",`${V} V · ${R} Ω`,`${f(I,3)} A · ${f(P)} W`)}
function calcRpm(log=false){const hz=num("rpmHz"),p=num("rpmPoles")||2,n=120*hz/p;$("#rpmOut").textContent=`${f(n,0)} rpm`;if(log)addHistory("RPM síncronas",`${hz} Hz · ${p} polos`,`${f(n,0)} rpm`)}
function calcTorque(log=false){const kw=num("torqueKw"),rpm=num("torqueRpm"),t=rpm?9550*kw/rpm:0;$("#torqueOut").textContent=`${f(t)} N·m`;if(log)addHistory("Par motor",`${kw} kW · ${rpm} rpm`,`${f(t)} N·m`)}
function calcUnits(log=false){const v=num("unitValue"),t=$("#unitType").value;let out=0,label="",formula="";if(t==="bar-psi"){out=v*14.5037738;label="psi";formula="1 bar = 14.5038 psi"}if(t==="psi-bar"){out=v/14.5037738;label="bar";formula="1 psi = 0.06895 bar"}if(t==="bar-kpa"){out=v*100;label="kPa";formula="1 bar = 100 kPa"}if(t==="kpa-bar"){out=v/100;label="bar";formula="100 kPa = 1 bar"}if(t==="c-f"){out=v*9/5+32;label="°F";formula="°F = °C × 9/5 + 32"}if(t==="f-c"){out=(v-32)*5/9;label="°C";formula="°C = (°F − 32) × 5/9"}if(t==="mm-in"){out=v/25.4;label="in";formula="1 in = 25.4 mm"}if(t==="in-mm"){out=v*25.4;label="mm";formula="1 in = 25.4 mm"}$("#unitOut").textContent=`${f(out,3)} ${label}`;$("#unitFormula").textContent=formula;if(log)addHistory("Conversor de unidades",`${v} · ${t}`,`${f(out,3)} ${label}`)}


function calcSiemens(log=false){
  const mode=$("#s7Mode").value, x=num("s7Value"), rawMax=Math.max(1,num("s7RawMax"));
  const min=num("s7Min"), max=num("s7Max"), unit=$("#s7Unit").value.trim();
  let pct=0, out=0, result="";
  if(mode==="raw-eng"){
    pct=x/rawMax;
    out=min+pct*(max-min);
    result=`${f(out)} ${unit}`;
    $("#s7Out").textContent=result;
  }else{
    pct=(x-min)/(max-min);
    out=pct*rawMax;
    result=`RAW ${f(out,0)}`;
    $("#s7Out").textContent=result;
  }
  $("#s7Pct").textContent=`${f(pct*100,1)} % del rango`;
  if(log)addHistory("Siemens 0–27648",`${x} · ${mode}`,result);
}

const PT_A=3.9083e-3, PT_B=-5.775e-7, PT_C=-4.183e-12, PT_R0=100;
function ptResistance(temp){
  if(temp>=0) return PT_R0*(1+PT_A*temp+PT_B*temp*temp);
  return PT_R0*(1+PT_A*temp+PT_B*temp*temp+PT_C*(temp-100)*temp*temp*temp);
}
function ptTemperature(resistance){
  // Newton-Raphson sobre el rango normalizado de una PT100 IEC 60751.
  let t=(resistance/PT_R0-1)/PT_A;
  t=clamp(t,-200,850);
  for(let k=0;k<25;k++){
    const y=ptResistance(t)-resistance;
    const eps=.001;
    const dy=(ptResistance(t+eps)-ptResistance(t-eps))/(2*eps);
    if(!dy)break;
    const next=clamp(t-y/dy,-200,850);
    if(Math.abs(next-t)<1e-8){t=next;break}
    t=next;
  }
  return t;
}
function calcPt100(log=false){
  const mode=$("#ptMode").value, x=num("ptValue");
  if(mode==="r-t"){
    const t=ptTemperature(x);
    $("#ptOut").textContent=`${f(t)} °C`;
    $("#ptNote").textContent=`${f(x,2)} Ω · IEC 60751`;
    if(log)addHistory("PT100",`${f(x,2)} Ω`,`${f(t)} °C`);
  }else{
    const r=ptResistance(x);
    $("#ptOut").textContent=`${f(r)} Ω`;
    $("#ptNote").textContent=`${f(x,2)} °C · IEC 60751`;
    if(log)addHistory("PT100",`${f(x,2)} °C`,`${f(r)} Ω`);
  }
}

function calcDbx(log=false){
  const raw=$("#dbxInput").value.trim().toUpperCase().replace(/\s+/g,"");
  const m=raw.match(/^DB(\d+)\.DBX(\d+)\.([0-7])$/);
  if(!m){
    $("#dbxOut").textContent="Dirección no válida";
    $("#dbxDetail").textContent="Formato esperado: DB313.DBX67.5";
    return;
  }
  const db=parseInt(m[1],10), byte=parseInt(m[2],10), bit=parseInt(m[3],10), abs=byte*8+bit;
  $("#dbxOut").textContent=`DB${db} · byte ${byte} · bit ${bit}`;
  $("#dbxDetail").textContent=`Bit absoluto dentro del DB: ${abs} · contiene DBB${byte}`;
  if(log)addHistory("Dirección DBX",raw,`byte ${byte} · bit ${bit} · abs ${abs}`);
}

function calcModbusAddr(log=false){
  let raw=$("#mbRef").value.trim().replace(/\s+/g,"");
  if(!/^\d+$/.test(raw)){
    $("#mbOut").textContent="Referencia no válida";
    $("#mbDetail").textContent="Ejemplos: 00001, 10001, 30001, 40001";
    return;
  }
  // Conservamos ceros de referencias tipo 00001.
  let family, refNum, label, fc;
  if(raw.length>=5){
    const first=raw[0];
    family=first;
    refNum=parseInt(raw.slice(1),10);
  }else{
    // Para coils se permite escribir 1, 10, 100... como referencia 0xxxx.
    family="0";
    refNum=parseInt(raw,10);
  }
  const map={
    "0":["Coil","FC01"],
    "1":["Discrete Input","FC02"],
    "3":["Input Register","FC04"],
    "4":["Holding Register","FC03"]
  };
  if(!map[family] || !Number.isFinite(refNum) || refNum<1){
    $("#mbOut").textContent="Referencia no válida";
    $("#mbDetail").textContent="Usa familias 0xxxx, 1xxxx, 3xxxx o 4xxxx.";
    return;
  }
  [label,fc]=map[family];
  const offset=refNum-1;
  $("#mbOut").textContent=`${label} · ${fc}`;
  $("#mbDetail").textContent=`Offset PDU: ${offset} · referencia ${raw}`;
  if(log)addHistory("Dirección Modbus",raw,`${label} · offset ${offset}`);
}

function calcVfd(log=false){
  const rpm=Math.max(0,num("vfdRpm")), poles=Math.max(2,num("vfdPoles")), slip=clamp(num("vfdSlip"),0,20)/100;
  const baseHz=Math.max(.1,num("vfdBaseHz"));
  const denom=120*(1-slip);
  const hz=denom?rpm*poles/denom:0;
  const sync=120*hz/poles;
  const pctBase=hz/baseHz*100;
  $("#vfdOut").textContent=`${f(hz)} Hz`;
  $("#vfdDetail").textContent=`≈ ${f(pctBase,1)} % de ${f(baseHz,1)} Hz · síncrona ${f(sync,0)} rpm`;
  if(log)addHistory("Variador RPM → Hz",`${rpm} rpm · ${poles} polos · slip ${f(slip*100,1)}%`,`${f(hz)} Hz`);
}


function calcSignalAlarm(log=false){
  const type=$("#alarmSignalType").value, sig=num("alarmSignal"), min=num("alarmProcMin"), max=num("alarmProcMax"),
        low=num("alarmLow"), high=num("alarmHigh"), unit=$("#alarmUnit").value.trim();
  const elecMin=type==="420"?4:0, elecMax=type==="420"?20:10;
  const pct=(sig-elecMin)/(elecMax-elecMin), process=min+pct*(max-min);
  let state="OK", detail="Señal dentro del rango eléctrico y de alarmas";
  if(sig<elecMin||sig>elecMax){state="FUERA DE RANGO";detail=`Rango eléctrico esperado: ${elecMin}–${elecMax} ${type==="420"?"mA":"V"}`}
  else if(process<=low){state="LOW";detail=`Proceso ≤ alarma LOW (${f(low,2)} ${unit})`}
  else if(process>=high){state="HIGH";detail=`Proceso ≥ alarma HIGH (${f(high,2)} ${unit})`}
  $("#alarmOut").textContent=`${f(process,2)} ${unit} · ${state}`;
  $("#alarmDetail").textContent=detail;
  if(log)addHistory("Sensor + alarmas",`${sig} ${type==="420"?"mA":"V"}`,`${f(process,2)} ${unit} · ${state}`);
}

function calcFlow(log=false){
  const value=num("flowValue"), unit=$("#flowUnit").value, dmm=Math.max(.001,num("pipeDiameter"));
  let m3h=value;
  if(unit==="ls")m3h=value*3.6;
  if(unit==="lmin")m3h=value*0.06;
  const ls=m3h/3.6, lmin=ls*60, q=m3h/3600;
  const d=dmm/1000, area=Math.PI*d*d/4, velocity=area?q/area:0;
  $("#flowOut").textContent=`${f(velocity,2)} m/s`;
  $("#flowDetail").textContent=`${f(m3h,3)} m³/h · ${f(ls,3)} L/s · ${f(lmin,3)} L/min`;
  if(log)addHistory("Caudal y velocidad",`${value} ${unit} · Ø${dmm} mm`,`${f(velocity,2)} m/s`);
}

function formatDuration(ms){
  const sign=ms<0?"−":"";
  let x=Math.abs(Math.trunc(ms));
  const days=Math.floor(x/86400000);x%=86400000;
  const h=Math.floor(x/3600000);x%=3600000;
  const m=Math.floor(x/60000);x%=60000;
  const s=Math.floor(x/1000), milli=x%1000;
  return `${sign}${days?days+"d ":""}${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(milli).padStart(3,"0")}`;
}
function timeLiteral(ms){
  const sign=ms<0?"-":"";
  let x=Math.abs(Math.trunc(ms));
  const d=Math.floor(x/86400000);x%=86400000;
  const h=Math.floor(x/3600000);x%=3600000;
  const m=Math.floor(x/60000);x%=60000;
  const s=Math.floor(x/1000), milli=x%1000;
  let parts=[];
  if(d)parts.push(`${d}D`);if(h)parts.push(`${h}H`);if(m)parts.push(`${m}M`);if(s)parts.push(`${s}S`);if(milli)parts.push(`${milli}MS`);
  return `${sign}T#${parts.join("")||"0MS"}`;
}
function calcTimeDate(log=false){
  const type=$("#tdType").value, raw=Math.trunc(num("tdValue"));
  if(type==="TIME"){
    $("#tdOut").textContent=formatDuration(raw);
    $("#tdDetail").textContent=timeLiteral(raw);
    if(log)addHistory("TIME",`${raw} ms`,formatDuration(raw));
    return;
  }
  if(type==="TOD"){
    const day=86400000;
    const ms=((raw%day)+day)%day;
    const h=Math.floor(ms/3600000), m=Math.floor((ms%3600000)/60000), s=Math.floor((ms%60000)/1000), milli=ms%1000;
    const out=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(milli).padStart(3,"0")}`;
    $("#tdOut").textContent=out;$("#tdDetail").textContent=`TOD#${out}`;
    if(log)addHistory("TOD",`${raw} ms`,out);
    return;
  }
  const base=Date.UTC(1990,0,1);
  const date=new Date(base+raw*86400000);
  if(Number.isNaN(date.getTime())){
    $("#tdOut").textContent="Valor no válido";$("#tdDetail").textContent="—";return;
  }
  const iso=date.toISOString().slice(0,10);
  $("#tdOut").textContent=iso;$("#tdDetail").textContent=`DATE#${iso}`;
  if(log)addHistory("DATE",`${raw} días desde 1990-01-01`,iso);
}

function parseMaskValue(text){
  const t=text.trim().toLowerCase();
  try{
    if(t.startsWith("0x"))return BigInt(t);
    if(t.startsWith("0b"))return BigInt(t);
    return BigInt(t||"0");
  }catch(e){return null}
}
function calcMask(log=false){
  const mode=$("#maskMode").value, raw=$("#maskInput").value.trim();
  let mask=0n, bits=[];
  if(mode==="bits"){
    const parsed=raw.split(",").map(x=>parseInt(x.trim(),10)).filter(x=>Number.isInteger(x)&&x>=0&&x<=31);
    [...new Set(parsed)].forEach(bit=>mask|=(1n<<BigInt(bit)));
  }else{
    const v=parseMaskValue(raw);
    if(v===null){$("#maskOut").textContent="Entrada no válida";$("#maskDetail").textContent="Usa decimal, 0xHEX o 0bBIN";return}
    mask=v & 0xFFFFFFFFn;
  }
  for(let b=0;b<32;b++)if((mask&(1n<<BigInt(b)))!==0n)bits.push(b);
  const hex=mask.toString(16).toUpperCase().padStart(8,"0");
  const bin=mask.toString(2).padStart(32,"0");
  $("#maskOut").textContent=`HEX 0x${hex}`;
  $("#maskDetail").textContent=`DEC ${mask.toString()} · bits activos: ${bits.length?bits.join(", "):"ninguno"} · BIN ${bin}`;
  if(log)addHistory("Máscara de bits",raw,`0x${hex}`);
}

function calcPid(log=false){
  const kp=num("pidKp"), ti=num("pidTi"), td=num("pidTd");
  const ki=ti>0?kp/ti:0, kd=kp*td;
  $("#pidOut").textContent=`Ki = ${f(ki,4)} · Kd = ${f(kd,4)}`;
  $("#pidDetail").textContent=`Kp = ${f(kp,4)} · u = Kp·e + Ki·∫e·dt + Kd·de/dt`;
  if(log)addHistory("Conversor PID",`Kp ${kp} · Ti ${ti}s · Td ${td}s`,`Ki ${f(ki,4)} · Kd ${f(kd,4)}`);
}

function ipToUint(ip){
  const p=ip.trim().split(".");
  if(p.length!==4)return null;
  const nums=p.map(x=>Number(x));
  if(nums.some(x=>!Number.isInteger(x)||x<0||x>255))return null;
  return (((nums[0]<<24)>>>0)|((nums[1]<<16)>>>0)|((nums[2]<<8)>>>0)|nums[3])>>>0;
}
function uintToIp(v){v=v>>>0;return [v>>>24,(v>>>16)&255,(v>>>8)&255,v&255].join(".")}
function calcIp(log=false){
  const ip=$("#ipAddress").value.trim(), prefix=clamp(Math.trunc(num("ipPrefix")),0,32), value=ipToUint(ip);
  if(value===null){$("#ipOut").textContent="IPv4 no válida";$("#ipDetail").textContent="Ejemplo: 192.168.1.25";$("#ipHosts").textContent="—";return}
  const mask=prefix===0?0:(0xFFFFFFFF<<(32-prefix))>>>0;
  const network=(value&mask)>>>0, broadcast=(network|(~mask>>>0))>>>0;
  const total=2**(32-prefix);
  let hostText;
  if(prefix<=30){
    const usable=total-2;
    hostText=`Hosts: ${uintToIp((network+1)>>>0)} — ${uintToIp((broadcast-1)>>>0)} · ${usable.toLocaleString("es-ES")} utilizables`;
  }else if(prefix===31){
    hostText=`2 direcciones en la subred · sin rango host clásico`;
  }else{
    hostText=`Dirección host única /32`;
  }
  $("#ipOut").textContent=`${uintToIp(network)} /${prefix}`;
  $("#ipDetail").textContent=`Máscara ${uintToIp(mask)} · broadcast ${uintToIp(broadcast)} · ${total.toLocaleString("es-ES")} direcciones`;
  $("#ipHosts").textContent=hostText;
  if(log)addHistory("Red IPv4",`${ip}/${prefix}`,`${uintToIp(network)}/${prefix}`);
}

const calculations=[
 {ids:["maValue","maMin","maMax","maUnit"],fn:calc420},{ids:["procValue","procMin","procMax","procUnit"],fn:calcProc420},
 {ids:["vValue","vMin","vMax","vUnit"],fn:calc010},{ids:["scIn","scInMin","scInMax","scOutMin","scOutMax","scUnit"],fn:calcScale},
 {ids:["baseValue","baseType"],fn:calcBase},{ids:["wordValue"],fn:calcWord},{ids:["reg1","reg2","wordOrder"],fn:calcFloat},
 {ids:["timeValue","timeUnit"],fn:calcTime},{ids:["s5Seconds"],fn:calcS5},{ids:["tpV","tpI","tpPf","tpEff"],fn:calcThree},
 {ids:["ohmV","ohmR"],fn:calcOhm},{ids:["rpmHz","rpmPoles"],fn:calcRpm},{ids:["torqueKw","torqueRpm"],fn:calcTorque},
 {ids:["unitValue","unitType"],fn:calcUnits},
 {ids:["alarmSignalType","alarmSignal","alarmProcMin","alarmProcMax","alarmLow","alarmHigh","alarmUnit"],fn:calcSignalAlarm},
 {ids:["flowValue","flowUnit","pipeDiameter"],fn:calcFlow},
 {ids:["tdType","tdValue"],fn:calcTimeDate},
 {ids:["maskMode","maskInput"],fn:calcMask},
 {ids:["pidKp","pidTi","pidTd"],fn:calcPid},
 {ids:["ipAddress","ipPrefix"],fn:calcIp},


 {ids:["s7Mode","s7Value","s7RawMax","s7Min","s7Max","s7Unit"],fn:calcSiemens},
 {ids:["ptMode","ptValue"],fn:calcPt100},
 {ids:["dbxInput"],fn:calcDbx},
 {ids:["mbRef"],fn:calcModbusAddr},
 {ids:["vfdRpm","vfdPoles","vfdSlip","vfdBaseHz"],fn:calcVfd},
];
calculations.forEach(c=>{c.ids.forEach(id=>{$("#"+id)?.addEventListener("input",()=>c.fn(false));$("#"+id)?.addEventListener("change",()=>c.fn(false));$("#"+id)?.addEventListener("blur",()=>c.fn(true))});c.fn(false)});

let category="all";
function applyFilter(){
 const q=$("#searchInput").value.toLowerCase().trim();let visible=0;
 $$(".tool").forEach(card=>{const catOk=category==="all"||card.dataset.category===category;const searchOk=!q||(card.dataset.search+" "+card.innerText).toLowerCase().includes(q);const show=catOk&&searchOk;card.classList.toggle("hidden",!show);if(show)visible++});
 $("#toolCount").textContent=`${visible} herramienta${visible===1?"":"s"} disponible${visible===1?"":"s"}`;
}
$("#searchInput").addEventListener("input",applyFilter);
$$(".filter").forEach(b=>b.addEventListener("click",()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");category=b.dataset.category;applyFilter()}));
$("#menuButton").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$("#nav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("#nav").classList.remove("open")));

renderFavorites();renderHistory();applyFilter();

// ---- Producción: Analytics, compartir e instalación ----
const GA_MEASUREMENT_ID = "G-YDD26E1PNQ";
const ANALYTICS_CONSENT_KEY = "industools-analytics-consent";
let analyticsLoaded = false;
function loadGoogleAnalytics(){
  if(analyticsLoaded) return;
  analyticsLoaded=true;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments);};
  gtag("js",new Date());
  gtag("config",GA_MEASUREMENT_ID,{anonymize_ip:true});
  const s=document.createElement("script");
  s.async=true;
  s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(s);
}
function setAnalyticsConsent(choice){
  localStorage.setItem(ANALYTICS_CONSENT_KEY,choice);
  const banner=document.querySelector("#consentBanner");
  if(banner) banner.hidden=true;
  if(choice==="granted") loadGoogleAnalytics();
}
function openPrivacyPreferences(){
  const banner=document.querySelector("#consentBanner");
  if(banner) banner.hidden=false;
}
const savedAnalyticsConsent=localStorage.getItem(ANALYTICS_CONSENT_KEY);
if(savedAnalyticsConsent==="granted") loadGoogleAnalytics();
else if(savedAnalyticsConsent!=="denied"){
  const banner=document.querySelector("#consentBanner");
  if(banner) banner.hidden=false;
}
document.querySelector("#acceptAnalytics")?.addEventListener("click",()=>setAnalyticsConsent("granted"));
document.querySelector("#rejectAnalytics")?.addEventListener("click",()=>setAnalyticsConsent("denied"));
document.querySelector("#privacySettings")?.addEventListener("click",openPrivacyPreferences);

document.querySelectorAll(".tool").forEach(card=>{
  let tracked=false;
  const track=()=>{
    if(tracked||!analyticsLoaded||typeof window.gtag!=="function") return;
    tracked=true;
    gtag("event","tool_used",{tool_key:card.dataset.key||"unknown",tool_category:card.dataset.category||"unknown"});
  };
  card.querySelectorAll("input,select").forEach(el=>el.addEventListener("change",track,{once:true}));
});

let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",event=>{
  event.preventDefault();deferredInstallPrompt=event;
  const btn=document.querySelector("#installApp");if(btn) btn.hidden=false;
});
document.querySelector("#installApp")?.addEventListener("click",async()=>{
  if(!deferredInstallPrompt)return;
  deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;const btn=document.querySelector("#installApp");if(btn)btn.hidden=true;
});
document.querySelector("#shareSite")?.addEventListener("click",async()=>{
  const data={title:"IndusTools",text:"Herramientas gratuitas para automatización industrial.",url:window.location.href.split("#")[0]};
  try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);toast("Enlace copiado");}}catch(_e){}
});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

});