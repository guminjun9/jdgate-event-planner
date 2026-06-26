import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";


// ✅ Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBGs1iavtpzHozh0QMqAsIjhFK8kD73m3g",
  authDomain: "jackpotttt.firebaseapp.com",
  projectId: "jackpotttt",
  storageBucket: "jackpotttt.firebasestorage.app",
  messagingSenderId: "560033458740",
  appId: "1:560033458740:web:6543a95b5640bbfb2e7861",
  measurementId: "G-LFSENSRK0Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const DOC_REF = doc(db, "planner", "events");

const TAG_CLR = {
  "신규유입":      { bg:"#DBEAFE", tx:"#1D4ED8" },
  "매출부스트":    { bg:"#FEE2E2", tx:"#DC2626" },
  "카테고리부스트":{ bg:"#DCFCE7", tx:"#16A34A" },
  "재구매":        { bg:"#EDE9FE", tx:"#7C3AED" },
  "재구매+객단가": { bg:"#FCE7F3", tx:"#DB2777" },
  "충성도강화":    { bg:"#E0E7FF", tx:"#4338CA" },
  "시즌전환":      { bg:"#CCFBF1", tx:"#0D9488" },
};
const STS = ["준비중","진행중","완료"];
const STS_CLR = {
  "준비중": { bg:"#F3F4F6", tx:"#6B7280" },
  "진행중": { bg:"#FEF3C7", tx:"#B45309" },
  "완료":   { bg:"#D1FAE5", tx:"#059669" },
};
const FIXED_TABS = ["전체","재구매","매출부스트"];

const INIT = [
  { id:1, title:"여름 입문 기획전",       start:"07/01", end:"07/14", month:7, year:2025, tag:"신규유입",      desc:"신규 고객 유입을 위한 여름 입문 기획전", status:"준비중", cl:[{id:1,t:"첫구매 할인쿠폰 세팅",d:false},{id:2,t:"스타터팩 번들 구성",d:false},{id:3,t:"랜딩 팝업 등록",d:false}], notes:"" },
  { id:2, title:"복날 특수 타임딜",        start:"07/08", end:"07/18", month:7, year:2025, tag:"매출부스트",    desc:"복날을 겨냥한 한정 타임딜 이벤트", status:"준비중", cl:[{id:1,t:"타임딜 상품 선정",d:false},{id:2,t:"48시간 카운터 배너",d:false},{id:3,t:"랜덤증정 재고 확보",d:false}], notes:"" },
  { id:3, title:"휴가지 니코틴프리 기획전", start:"07/19", end:"07/31", month:7, year:2025, tag:"카테고리부스트", desc:"누벨ZERO·Summer Breeze ZERO 집중 기획전", status:"준비중", cl:[{id:1,t:"누벨ZERO 기획전 페이지",d:false},{id:2,t:"Summer Breeze 팝업",d:false},{id:3,t:"5종 묶음 가격 설정",d:false}], notes:"" },
  { id:4, title:"월말 재구매 부스터",       start:"07/26", end:"07/31", month:7, year:2025, tag:"재구매",        desc:"월말 재방문·재구매 유도 집중 프로모션", status:"준비중", cl:[{id:1,t:"구매이력 기반 쿠폰 발급",d:false},{id:2,t:"재방문 팝업 등록",d:false},{id:3,t:"리뷰 2배 적립 설정",d:false}], notes:"" },
  { id:5, title:"여름 럭키박스 챌린지",     start:"08/01", end:"08/15", month:8, year:2025, tag:"재구매+객단가", desc:"5만원 이상 구매 시 럭키박스 증정 챌린지", status:"준비중", cl:[{id:1,t:"박스 구성품 선정",d:false},{id:2,t:"5만원 이상 조건 설정",d:false},{id:3,t:"언박싱 유도 문구",d:false}], notes:"" },
  { id:6, title:"광복절 특가 세일",         start:"08/13", end:"08/15", month:8, year:2025, tag:"매출부스트",    desc:"광복절 기념 전카테고리 15% 할인 세일", status:"준비중", cl:[{id:1,t:"전카테고리 15% 할인 설정",d:false},{id:2,t:"D-day 카운터 배너",d:false},{id:3,t:"기간 한정 팝업",d:false}], notes:"" },
  { id:7, title:"VIP 회원 감사 이벤트",     start:"08/16", end:"08/25", month:8, year:2025, tag:"충성도강화",    desc:"상위 구매자 대상 VIP 전용 혜택 이벤트", status:"준비중", cl:[{id:1,t:"상위 구매자 리스트 추출",d:false},{id:2,t:"VIP 전용 쿠폰 발급",d:false},{id:3,t:"무료배송 조건 설정",d:false}], notes:"" },
  { id:8, title:"가을 시즌 예열 기획전",    start:"08/26", end:"08/31", month:8, year:2025, tag:"시즌전환",      desc:"가을 시즌 전환을 위한 신제품 사전 예열", status:"준비중", cl:[{id:1,t:"신제품 사전 등록",d:false},{id:2,t:"위시리스트 쿠폰 자동화",d:false},{id:3,t:"가을 테마 배너",d:false}], notes:"" },
];

const lbl = { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 };
const inp = { width:"100%", border:"1px solid #E5E7EB", borderRadius:8, padding:"8px 10px", fontSize:13, color:"#111827", marginBottom:12, boxSizing:"border-box", outline:"none", fontFamily:"inherit", background:"#fff" };
const now = new Date();

function getMonthTabs(evs) {
  return [...new Set(evs.map(e=>`${e.year}-${String(e.month).padStart(2,'0')}`))]
    .sort().map(k=>{ const [y,m]=k.split('-'); return {year:Number(y),month:Number(m),label:`${y}.${m}월`,key:k}; });
}
function filterEvs(evs, tab) {
  if(tab==="재구매") return evs.filter(e=>e.tag.includes("재구매"));
  if(tab==="매출부스트") return evs.filter(e=>e.tag==="매출부스트");
  if(tab==="전체") return evs;
  const [y,m]=tab.split('-');
  return evs.filter(e=>e.year===Number(y)&&e.month===Number(m));
}

export default function App() {
  const [evs, setEvs] = useState(INIT);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("전체");
  const [modal, setModal] = useState(null);
  const [newTxt, setNewTxt] = useState("");

  // ✅ Firebase 실시간 동기화
  useEffect(() => {
    const unsub = onSnapshot(DOC_REF, (snap) => {
      if (snap.exists()) {
        setEvs(snap.data().list);
      } else {
        // 최초 1회 초기 데이터 저장
        setDoc(DOC_REF, { list: INIT });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const save2db = async (next) => {
    await setDoc(DOC_REF, { list: next });
  };

  const list = filterEvs(evs, tab);
  const done = evs.filter(e=>e.status==="완료").length;
  const pct = Math.round((done/evs.length)*100);
  const monthTabs = getMonthTabs(evs);

  const upd = (ev) => {
    const next = evs.map(e=>e.id===ev.id?ev:e);
    setEvs(next); save2db(next);
  };

  const cycleStatus = (e, id) => {
    e.stopPropagation();
    const next = evs.map(ev=>{
      if(ev.id!==id) return ev;
      const i=STS.indexOf(ev.status);
      return {...ev, status:STS[(i+1)%3]};
    });
    setEvs(next); save2db(next);
  };

  const openModal = (ev) => { setModal({...ev, cl:ev.cl.map(c=>({...c}))}); setNewTxt(""); };

  const saveModal = () => {
    const isNew = !evs.find(e=>e.id===modal.id);
    const next = isNew ? [...evs, modal] : evs.map(e=>e.id===modal.id?modal:e);
    setEvs(next); save2db(next); setModal(null);
  };

  const toggleItem = (cid) => setModal(m=>({...m,cl:m.cl.map(c=>c.id===cid?{...c,d:!c.d}:c)}));
  const delItem   = (cid) => setModal(m=>({...m,cl:m.cl.filter(c=>c.id!==cid)}));
  const addItem   = () => {
    if(!newTxt.trim()) return;
    setModal(m=>({...m,cl:[...m.cl,{id:Date.now(),t:newTxt.trim(),d:false}]}));
    setNewTxt("");
  };

  if(loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Apple SD Gothic Neo',sans-serif",color:"#9CA3AF",fontSize:14}}>
      데이터 불러오는 중...
    </div>
  );

  return (
    <div style={{fontFamily:"'Apple SD Gothic Neo','Malgun Gothic',sans-serif",background:"#F1F5F9",minHeight:"100vh",padding:"16px 20px"}}>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{fontSize:18,fontWeight:800,color:"#111827"}}>전담GATE</span>
        <span style={{fontSize:13,color:"#9CA3AF"}}>이벤트 플래너</span>
        <span style={{marginLeft:4,fontSize:11,color:"#10B981",background:"#D1FAE5",padding:"2px 8px",borderRadius:10,fontWeight:600}}>🔴 실시간 공유중</span>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:16}}>
          {STS.map(s=>(
            <span key={s} style={{fontSize:12,color:STS_CLR[s].tx,fontWeight:600}}>
              {evs.filter(e=>e.status===s).length} <span style={{fontWeight:400,color:"#9CA3AF"}}>{s}</span>
            </span>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{background:"#E5E7EB",borderRadius:999,height:6,width:100,overflow:"hidden"}}>
              <div style={{background:done===evs.length&&evs.length>0?"#10B981":"#3B82F6",width:`${pct}%`,height:"100%",borderRadius:999,transition:"width .4s"}}/>
            </div>
            <span style={{fontSize:11,color:"#9CA3AF",whiteSpace:"nowrap"}}>{done}/{evs.length} 완료</span>
          </div>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:12,flexWrap:"wrap"}}>
        {FIXED_TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"5px 12px",borderRadius:16,border:"1.5px solid",cursor:"pointer",
            borderColor:tab===t?"#111827":"#E5E7EB",
            background:tab===t?"#111827":"#fff",
            color:tab===t?"#fff":"#374151",
            fontSize:12,fontWeight:tab===t?700:400,
          }}>
            {t} <span style={{opacity:.6,fontSize:11}}>({filterEvs(evs,t).length})</span>
          </button>
        ))}
        {monthTabs.length>0&&<span style={{color:"#E5E7EB",fontSize:16}}>|</span>}
        {monthTabs.map(mt=>(
          <button key={mt.key} onClick={()=>setTab(mt.key)} style={{
            padding:"5px 12px",borderRadius:16,border:"1.5px solid",cursor:"pointer",
            borderColor:tab===mt.key?"#3B82F6":"#E5E7EB",
            background:tab===mt.key?"#EFF6FF":"#fff",
            color:tab===mt.key?"#1D4ED8":"#374151",
            fontSize:12,fontWeight:tab===mt.key?700:400,
          }}>
            {mt.label} <span style={{opacity:.6,fontSize:11}}>({filterEvs(evs,mt.key).length})</span>
          </button>
        ))}
        <button onClick={()=>openModal({
          id:Date.now(), title:"새 이벤트",
          start:`${String(now.getMonth()+1).padStart(2,'0')}/01`,
          end:`${String(now.getMonth()+1).padStart(2,'0')}/30`,
          month:now.getMonth()+1, year:now.getFullYear(),
          tag:"신규유입", desc:"", status:"준비중", cl:[], notes:""
        })} style={{
          marginLeft:"auto",padding:"5px 14px",borderRadius:16,
          border:"1.5px solid #111827",background:"#111827",
          color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"
        }}>+ 추가</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {list.map(ev=>{
          const tc=TAG_CLR[ev.tag]||{bg:"#F3F4F6",tx:"#374151"};
          const sc=STS_CLR[ev.status];
          const doneCl=ev.cl.filter(c=>c.d).length;
          const clPct=ev.cl.length?Math.round((doneCl/ev.cl.length)*100):0;
          return (
            <div key={ev.id} onClick={()=>openModal(ev)}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.10)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"}
              style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"14px 16px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",transition:"box-shadow .15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <span style={{background:tc.bg,color:tc.tx,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{ev.tag}</span>
                <button onClick={(e)=>cycleStatus(e,ev.id)} style={{background:sc.bg,color:sc.tx,border:"none",borderRadius:10,padding:"2px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{ev.status}</button>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:4,lineHeight:1.3}}>{ev.title}</div>
              <div style={{fontSize:11,color:"#9CA3AF",marginBottom:8}}>📅 {ev.year}.{ev.start} ~ {ev.end}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{flex:1,background:"#F3F4F6",borderRadius:999,height:4,overflow:"hidden"}}>
                  <div style={{background:clPct===100?"#10B981":"#3B82F6",width:`${clPct}%`,height:"100%",borderRadius:999}}/>
                </div>
                <span style={{fontSize:10,color:"#9CA3AF"}}>{doneCl}/{ev.cl.length}</span>
              </div>
              {ev.cl.length>0&&(
                <div style={{marginTop:7,display:"flex",flexDirection:"column",gap:2}}>
                  {ev.cl.slice(0,2).map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:c.d?"#9CA3AF":"#6B7280"}}>
                      <span style={{color:c.d?"#10B981":"#D1D5DB",fontSize:10}}>{c.d?"✓":"○"}</span>
                      <span style={{textDecoration:c.d?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.t}</span>
                    </div>
                  ))}
                  {ev.cl.length>2&&<div style={{fontSize:10,color:"#C4C9D4"}}>+{ev.cl.length-2}개</div>}
                </div>
              )}
              {ev.notes&&<div style={{marginTop:7,fontSize:10,color:"#C4C9D4",borderTop:"1px solid #F3F4F6",paddingTop:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📝 {ev.notes}</div>}
            </div>
          );
        })}
      </div>

      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:500,maxHeight:"88vh",overflowY:"auto",padding:"24px 24px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <span style={{fontSize:15,fontWeight:800,color:"#111827"}}>이벤트 편집</span>
              <button onClick={()=>setModal(null)} style={{background:"#F3F4F6",border:"none",borderRadius:8,width:26,height:26,fontSize:15,cursor:"pointer",color:"#6B7280"}}>✕</button>
            </div>
            <label style={lbl}>제목</label>
            <input value={modal.title} onChange={e=>setModal(m=>({...m,title:e.target.value}))} style={inp}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div><label style={lbl}>연도</label><input type="number" value={modal.year} onChange={e=>setModal(m=>({...m,year:Number(e.target.value)}))} style={inp}/></div>
              <div><label style={lbl}>월 (1~12)</label><input type="number" min="1" max="12" value={modal.month} onChange={e=>setModal(m=>({...m,month:Number(e.target.value)}))} style={inp}/></div>
              <div>
                <label style={lbl}>기간</label>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input value={modal.start} onChange={e=>setModal(m=>({...m,start:e.target.value}))} placeholder="MM/DD" style={{...inp,marginBottom:0,flex:1}}/>
                  <span style={{color:"#9CA3AF",fontSize:12,marginBottom:12}}>~</span>
                  <input value={modal.end} onChange={e=>setModal(m=>({...m,end:e.target.value}))} placeholder="MM/DD" style={{...inp,marginBottom:0,flex:1}}/>
                </div>
              </div>
            </div>
            <label style={{...lbl,marginTop:12}}>태그</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
              {Object.keys(TAG_CLR).map(tg=>{
                const c=TAG_CLR[tg]; const on=modal.tag===tg;
                return <button key={tg} onClick={()=>setModal(m=>({...m,tag:tg}))} style={{padding:"3px 10px",borderRadius:16,border:"1.5px solid",cursor:"pointer",borderColor:on?c.tx:"#E5E7EB",background:on?c.bg:"#fff",color:on?c.tx:"#9CA3AF",fontSize:11,fontWeight:on?700:400}}>{tg}</button>;
              })}
            </div>
            <label style={lbl}>설명</label>
            <textarea value={modal.desc} onChange={e=>setModal(m=>({...m,desc:e.target.value}))} style={{...inp,height:60,resize:"vertical"}}/>
            <label style={lbl}>진행 상태</label>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {STS.map(s=>{ const sc=STS_CLR[s]; const on=modal.status===s;
                return <button key={s} onClick={()=>setModal(m=>({...m,status:s}))} style={{flex:1,padding:"7px 0",borderRadius:8,border:"1.5px solid",cursor:"pointer",borderColor:on?sc.tx:"#E5E7EB",background:on?sc.bg:"#fff",color:on?sc.tx:"#9CA3AF",fontWeight:on?700:400,fontSize:13}}>{s}</button>;
              })}
            </div>
            <label style={lbl}>체크리스트 <span style={{fontWeight:400,color:"#9CA3AF"}}>{modal.cl.filter(c=>c.d).length}/{modal.cl.length}</span></label>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
              {modal.cl.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:7,background:"#F9FAFB",borderRadius:8,padding:"7px 10px"}}>
                  <input type="checkbox" checked={c.d} onChange={()=>toggleItem(c.id)} style={{cursor:"pointer",width:14,height:14,accentColor:"#10B981"}}/>
                  <span style={{flex:1,fontSize:12,color:c.d?"#9CA3AF":"#374151",textDecoration:c.d?"line-through":"none"}}>{c.t}</span>
                  <button onClick={()=>delItem(c.id)} style={{background:"none",border:"none",color:"#D1D5DB",cursor:"pointer",fontSize:14,padding:"0 2px"}} onMouseEnter={e=>e.target.style.color="#EF4444"} onMouseLeave={e=>e.target.style.color="#D1D5DB"}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:7,marginBottom:14}}>
              <input value={newTxt} onChange={e=>setNewTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="새 항목 추가 후 Enter" style={{...inp,flex:1,marginBottom:0}}/>
              <button onClick={addItem} style={{padding:"0 14px",borderRadius:8,background:"#111827",color:"#fff",border:"none",fontSize:18,cursor:"pointer"}}>+</button>
            </div>
            <label style={lbl}>메모 / 노트</label>
            <textarea value={modal.notes} onChange={e=>setModal(m=>({...m,notes:e.target.value}))} placeholder="메모를 입력하세요..." style={{...inp,height:66,resize:"vertical",marginBottom:16}}/>
            <button onClick={saveModal} style={{width:"100%",padding:"11px 0",background:"#111827",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>저장하기</button>
          </div>
        </div>
      )}
    </div>
  );
}
