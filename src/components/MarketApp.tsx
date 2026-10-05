import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Apple, Calculator, CloudOff, Heart, Keyboard, Languages, Leaf, Moon, PackageOpen, RefreshCw, Search, Settings, ShoppingBasket, Sun, TrendingDown, TrendingUp, Wifi } from "lucide-react";
import { setupServiceWorker } from "@/lib/pwa";
import { CACHE_KEYS, MARKET_ENDPOINTS, REFRESH_INTERVAL_MS } from "@/lib/market-config";
import { mockHistory, mockPrices, validHistory, validPrices, type HistoryResponse, type PriceItem, type PricesResponse } from "@/lib/market-data";
import { DEFAULT_LANGUAGE, marketLabel, productLabel, translateTemplate, translations, unitLabel, type Language } from "@/lib/i18n";

type Theme = "light" | "dark";
type View = "market" | "watchlist" | "calculator" | "settings";
type Source = "live" | "cache" | "mock";

function readStorage<T>(key:string, fallback:T):T { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } }
function writeStorage(key:string, value:unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be unavailable */ } }

/* أسماء المنتجات الإضافية تأتي من names.json بدون إعادة بناء التطبيق */
type ExtraNames = Record<string,{ar?:string;en?:string}>;
let EXTRA_NAMES:ExtraNames = {};
const NAMES_CACHE = "souk_names_v1";
const productName = (p:string, l:Language) => EXTRA_NAMES[p.trim().toLowerCase().replace(/[\s-]+/g,"_")]?.[l] || productLabel(p, l);
async function loadNames(bust:string):Promise<boolean>{
  const url = MARKET_ENDPOINTS.prices.replace(/[^/]*$/, "names.json");
  try {
    const r = await fetch(`${url}?${bust}`, {cache:"no-store"});
    if(!r.ok) throw new Error("no names");
    const j:unknown = await r.json();
    if(!j || typeof j!=="object" || Array.isArray(j)) throw new Error("bad names");
    EXTRA_NAMES = j as ExtraNames; writeStorage(NAMES_CACHE, j); return true;
  } catch {
    const c = readStorage<ExtraNames|null>(NAMES_CACHE, null);
    if(c){ EXTRA_NAMES = c; return true; }
    return false;
  }
}

export function MarketApp() {
  const [language,setLanguage]=useState<Language>(DEFAULT_LANGUAGE); const [theme,setTheme]=useState<Theme>("light"); const [view,setView]=useState<View>("market");
  const [prices,setPrices]=useState<PricesResponse>(mockPrices); const [history,setHistory]=useState<HistoryResponse>(mockHistory); const [source,setSource]=useState<Source>("mock");
  const [refreshing,setRefreshing]=useState(false); const [online,setOnline]=useState(true); const [query,setQuery]=useState(""); const [category,setCategory]=useState("all"); const [lastUpdated,setLastUpdated]=useState<number|null>(null);
  const [favorites,setFavorites]=useState<string[]>([]); const [,setSelected]=useState(""); const [pull,setPull]=useState(0);
  const startY=useRef<number|null>(null); const searchRef=useRef<HTMLInputElement>(null); const t=translations[language]; const isAr=language==="ar";

  const refresh=useCallback(async()=>{ setRefreshing(true); try { const bust=`t=${Date.now()}`; void loadNames(bust).then(ok=>{if(ok)setNamesVer(v=>v+1)}); const [p,h]=await Promise.all([fetch(`${MARKET_ENDPOINTS.prices}?${bust}`,{cache:"no-store"}),fetch(`${MARKET_ENDPOINTS.history}?${bust}`,{cache:"no-store"})]); if(!p.ok||!h.ok) throw new Error("feed unavailable"); const pj:unknown=await p.json(), hj:unknown=await h.json(); if(!validPrices(pj)||!validHistory(hj)) throw new Error("invalid feed"); setPrices(pj);setHistory(hj);setSource("live");setLastUpdated(Date.now());writeStorage(CACHE_KEYS.prices,pj);writeStorage(CACHE_KEYS.history,hj); } catch { const cp=readStorage<PricesResponse|null>(CACHE_KEYS.prices,null), ch=readStorage<HistoryResponse|null>(CACHE_KEYS.history,null); if(cp&&ch&&validPrices(cp)&&validHistory(ch)){setPrices(cp);setHistory(ch);setSource("cache");} else {setPrices(mockPrices);setHistory(mockHistory);setSource("mock");} } finally {setRefreshing(false);} },[]);

  useEffect(()=>{ setLanguage(readStorage(CACHE_KEYS.language,DEFAULT_LANGUAGE));setTheme(readStorage(CACHE_KEYS.theme,"light"));setFavorites(readStorage(CACHE_KEYS.watchlist,[]));setOnline(navigator.onLine); void refresh(); const timer=window.setInterval(()=>void refresh(),REFRESH_INTERVAL_MS); const onOnline=()=>{setOnline(true);void refresh()}; const onOffline=()=>setOnline(false); const onVisible=()=>{if(document.visibilityState==="visible")void refresh()};window.addEventListener("online",onOnline);window.addEventListener("offline",onOffline);document.addEventListener("visibilitychange",onVisible);void setupServiceWorker(); const v=new URLSearchParams(window.location.hash.split("?")[1]??window.location.search).get("view"); if(v==="market"||v==="watchlist"||v==="calculator"||v==="settings")setView(v);return()=>{clearInterval(timer);window.removeEventListener("online",onOnline);window.removeEventListener("offline",onOffline);document.removeEventListener("visibilitychange",onVisible)}},[refresh]);
  useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=isAr?"rtl":"ltr";document.documentElement.classList.toggle("dark",theme==="dark");writeStorage(CACHE_KEYS.language,language);writeStorage(CACHE_KEYS.theme,theme)},[language,theme,isAr]);

  useEffect(()=>{const views:View[]=["market","watchlist","calculator","settings"];const onKey=(e:KeyboardEvent)=>{const el=e.target as HTMLElement|null;const typing=!!el&&(el.tagName==="INPUT"||el.tagName==="SELECT"||el.tagName==="TEXTAREA"||el.isContentEditable);if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setView(x=>x==="market"||x==="watchlist"?x:"market");setTimeout(()=>searchRef.current?.focus(),0);return}if(e.key==="Escape"&&typing){el?.blur();return}if(typing||e.ctrlKey||e.metaKey||e.altKey)return;const n=Number(e.key);if(n>=1&&n<=4){setView(views[n-1]??"market");return}const k=e.key.toLowerCase();if(e.key==="/"){e.preventDefault();setView(x=>x==="market"||x==="watchlist"?x:"market");setTimeout(()=>searchRef.current?.focus(),0)}else if(k==="r"){void refresh()}else if(k==="t"){setTheme(x=>x==="light"?"dark":"light")}else if(k==="l"){setLanguage(x=>x==="ar"?"en":"ar")}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[refresh]);
  const entries=useMemo(()=>Object.entries(prices.prices),[prices]);
  const visible=entries.filter(([key,item])=>{const term=query.trim().toLowerCase();const label=productName(item.product,language);const market=marketLabel(item.market,language).toLowerCase();return(category==="all"||item.category===category)&&(!term||label.toLowerCase().includes(term)||market.includes(term))&&(view!=="watchlist"||favorites.includes(key))});
  const toggleFavorite=(key:string)=>setFavorites(prev=>{const next=prev.includes(key)?prev.filter(x=>x!==key):[...prev,key];writeStorage(CACHE_KEYS.watchlist,next);return next});
  const money=(n:number)=>`${new Intl.NumberFormat(isAr?"ar-DZ":"en-DZ",{maximumFractionDigits:0}).format(n)} ${isAr?"دج":"DZD"}`;
  const dateLabel=new Intl.DateTimeFormat(isAr?"ar-DZ":"en-DZ",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"}).format(new Date(prices.generated_at));
  const gesture={onTouchStart:(e:React.TouchEvent)=>{if(window.scrollY===0)startY.current=e.touches[0]?.clientY??null},onTouchMove:(e:React.TouchEvent)=>{if(startY.current!==null)setPull(Math.min(84,Math.max(0,(e.touches[0]?.clientY??0)-startY.current)))},onTouchEnd:()=>{if(pull>62)void refresh();setPull(0);startY.current=null}};

  const [brand,setBrand]=useState(true);
  const [,setNamesVer]=useState(0);
  const [intro,setIntro]=useState<boolean|null>(null);
  useEffect(()=>{try{setIntro(localStorage.getItem("souk_intro")!=="1")}catch{setIntro(false)}},[]);
  if(brand) return <BrandIntro onDone={()=>setBrand(false)}/>;
  if(intro===null) return <div className="min-h-screen bg-background"/>;
  if(intro) return <Intro language={language} setLanguage={setLanguage} onDone={()=>{try{localStorage.setItem("souk_intro","1")}catch{}setIntro(false)}}/>;

  return (
    <div {...gesture} className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <BrandMark/>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-transform" style={{transform:`translateY(${Math.max(-52,pull-52)}px)`}}>
        <div className="mt-2 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg">
          <RefreshCw size={14} className={pull>62?"animate-spin":""}/>{t.pull}
        </div>
      </div>
      <div className="lg:ps-28">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-blue">
                <ShoppingBasket size={22}/>
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-xl font-extrabold">{t.app}</h1>
                <p className="truncate text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" aria-label={t.switchLanguage} title={t.switchLanguage} onClick={()=>setLanguage(x=>x==="ar"?"en":"ar")} className="language-switch">
                <Languages size={16}/><span>{isAr?"EN":"AR"}</span>
              </button>
              <button type="button" aria-label={t.theme} onClick={()=>setTheme(x=>x==="light"?"dark":"light")} className="icon-button">
                {theme==="light"?<Moon size={19}/>:<Sun size={19}/>}
              </button>
            </div>
          </div>
        </header>

        {/* تمت زيادة pb-36 لإعطاء مساحة كافية قبل شريط التنقل السفلي */}
        <main className="mx-auto max-w-6xl px-4 pb-36 pt-5 md:px-6 lg:pb-12">
          <div className={`mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${source==="live"&&online?"border-info/25 bg-info-soft text-info":"border-warning/25 bg-warning-soft text-warning"}`}>
            <div className="flex items-center gap-2">
              {source==="live"&&online?<Wifi size={17}/>:<CloudOff size={17}/>}
              <span>{source==="live"&&online?t.live:source==="cache"?t.offline:t.mock}</span>
              {lastUpdated!==null&&<span className="text-xs opacity-75">· {t.updated} {new Intl.DateTimeFormat(isAr?"ar-DZ":"en-DZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(lastUpdated))}</span>}
            </div>
            <button aria-label={t.retry} onClick={()=>void refresh()} className="icon-button-sm">
              <RefreshCw size={15} className={refreshing?"animate-spin":""}/>
            </button>
          </div>

          {(view==="market"||view==="watchlist")&&<>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.updated}</p>
                <p className="mt-1 font-display text-2xl font-bold">{dateLabel}</p>
              </div>
              <div className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
                {translateTemplate(t.itemCount,{count:entries.length})}
              </div>
            </div>
            <div className="relative mb-4">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={19}/>
              <input ref={searchRef} aria-label={t.search} value={query} onChange={e=>setQuery(e.target.value)} placeholder={`${t.search}  ( / )`} className="h-12 w-full rounded-xl border border-border bg-card ps-12 pe-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/15"/>
            </div>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {([['all',t.all],['vegetable',t.vegetables],['fruit',t.fruits]] as Array<[string,string]>).map(([v,l])=><button key={v} onClick={()=>setCategory(v)} className={category===v?"filter-active":"filter-button"}>{l}</button>)}
            </div>
            {refreshing?<Skeletons/>:visible.length?<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map(([key,item])=><PriceCard key={key} itemKey={key} item={item} language={language} favorite={favorites.includes(key)} onFavorite={()=>toggleFavorite(key)} onSelect={()=>setSelected(key)} money={money} history={history[key]??[]}/>)}</div>:<Empty title={view==="watchlist"?t.watchEmpty:t.empty} detail={view==="watchlist"?t.watchSub:t.emptySub}/>}
          </>}

          {view==="calculator"&&<Calc entries={entries} language={language} money={money}/>}
          
          {view==="settings"&&<section className="mx-auto max-w-2xl"><SectionTitle icon={<Settings/>} title={t.settings}/><div className="space-y-4"><SettingCard icon={<Languages/>} title={t.language}><div className="segmented"><button onClick={()=>setLanguage("ar")} className={language==="ar"?"selected":""}>{t.arabic}</button><button onClick={()=>setLanguage("en")} className={language==="en"?"selected":""}>{t.english}</button></div></SettingCard><SettingCard icon={theme==="light"?<Sun/>:<Moon/>} title={t.theme}><div className="segmented"><button onClick={()=>setTheme("light")} className={theme==="light"?"selected":""}>{t.light}</button><button onClick={()=>setTheme("dark")} className={theme==="dark"?"selected":""}>{t.dark}</button></div></SettingCard><SettingCard icon={<RefreshCw/>} title={t.data}><p className="text-sm text-muted-foreground">{t.auto}</p><p className="mt-1 text-xs text-muted-foreground/70">{t.source}: {t.liveSource}</p></SettingCard><SettingCard icon={<Keyboard/>} title={t.shortcuts}><ul className="grid gap-2 text-sm sm:grid-cols-2">{([["1–4",t.scNav],["/  ·  Ctrl+K",t.scSearch],["R",t.scRefresh],["T",t.scTheme],["L",t.scLang],["Esc",t.scEsc]] as const).map(([k,l])=><li key={k} className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2"><span className="text-muted-foreground">{l}</span><kbd dir="ltr" className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-bold">{k}</kbd></li>)}</ul></SettingCard></div></section>}
          
          {/* الفوتر داخل المحتوى الرئيسي مع هامش سفلي متناسق */}
          <footer className="mt-10 border-t border-border/70 pt-6 text-center">
            <p className="text-xs text-muted-foreground">{translateTemplate(t.copyright,{year:new Date().getFullYear()})}</p>
          </footer>
        </main>
      </div>

      <nav aria-label={t.app} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:inset-y-0 lg:end-auto lg:start-0 lg:w-24 lg:border-e lg:border-t-0 lg:pb-0">
        <div className="mx-auto grid max-w-lg grid-cols-4 px-2 py-2 lg:mt-24 lg:max-w-none lg:grid-cols-1 lg:gap-2">
          {([{id:"market",icon:ShoppingBasket,label:t.market},{id:"watchlist",icon:Heart,label:t.watchlist},{id:"calculator",icon:Calculator,label:t.calculator},{id:"settings",icon:Settings,label:t.settings}] as const).map((n,i)=>(
            <button key={n.id} title={`${n.label} (${i+1})`} aria-current={view===n.id?"page":undefined} onClick={()=>setView(n.id)} className={view===n.id?"nav-active":"nav-button"}>
              <n.icon size={21} fill={view===n.id&&n.id==="watchlist"?"currentColor":"none"}/>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function PriceCard({item,itemKey,language,favorite,onFavorite,onSelect,money,history}:{itemKey:string;item:PriceItem;language:Language;favorite:boolean;onFavorite:()=>void;onSelect:()=>void;money:(n:number)=>string;history:Array<{date:string;price:number}>}){const t=translations[language], product=productName(item.product,language), up=item.change>0, down=item.change<0;return <article onClick={onSelect} className="group rounded-2xl border border-border bg-card p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"><div className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary" title={t.categories[item.category]}>{item.category==="fruit"?<Apple size={22}/>:<Leaf size={22}/>}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-display text-base font-bold">{product}</h3><p className="mt-0.5 text-xs text-muted-foreground">{marketLabel(item.market,language)} · {t.categories[item.category]}</p></div><button aria-label={translateTemplate(favorite?t.favoriteRemove:t.favoriteAdd,{product})} onClick={e=>{e.stopPropagation();onFavorite()}} className="icon-button-sm"><Heart size={18} className={favorite?"fill-primary text-primary":""}/></button></div><div className="mt-4 flex items-end justify-between"><div><p className="font-display text-2xl font-extrabold" dir="ltr">{money(item.price)}</p><p className="text-[11px] text-muted-foreground">{translateTemplate(t.perUnit,{unit:unitLabel(item.unit,language)})}</p></div><div className={`flex items-center gap-1 text-xs font-bold ${up?"text-rise":down?"text-fall":"text-muted-foreground"}`}>{up?<TrendingUp size={15}/>:down?<TrendingDown size={15}/>:null}<span dir="ltr">{(()=>{const prev=item.price-item.change;const p=prev>0?Math.round(item.change/prev*1000)/10:0;return `${p>0?"+":""}${p}%`})()}</span></div></div></div></div><div className="mt-3 h-10"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history.slice(-30)}><defs><linearGradient id={`g-${itemKey.replace(/[^a-zA-Z0-9]/g,"-")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity={0.25}/><stop offset="1" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><YAxis hide domain={["dataMin - 5","dataMax + 5"]}/><Tooltip content={()=>null}/><Area type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2} fill={`url(#g-${itemKey.replace(/[^a-zA-Z0-9]/g,"-")})`} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div></article>}
function Skeletons(){return <div className="grid gap-3 md:grid-cols-2">{Array.from({length:6}).map((_,i)=><div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card p-4"><div className="h-full rounded-xl bg-muted"/></div>)}</div>}
function Empty({title,detail}:{title:string;detail:string}){return <div className="py-16 text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary text-primary"><PackageOpen size={28}/></span><h2 className="mt-4 font-display text-lg font-bold">{title}</h2><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{detail}</p></div>}
function SectionTitle({icon,title}:{icon:React.ReactNode;title:string}){return <div className="mb-5 flex items-center gap-3 text-primary">{icon}<h2 className="font-display text-2xl font-extrabold text-foreground">{title}</h2></div>}
function SettingCard({icon,title,children}:{icon:React.ReactNode;title:string;children:React.ReactNode}){return <div className="rounded-2xl border border-border bg-card p-5 shadow-card"><div className="mb-4 flex items-center gap-3 text-primary">{icon}<h3 className="font-display font-bold text-foreground">{title}</h3></div>{children}</div>}

function Calc({entries,language,money}:{entries:Array<[string,PriceItem]>;language:Language;money:(n:number)=>string}){
  const isAr=language==="ar";
  const map=new Map(entries);
  const first=entries[0]?.[0]??"";
  const [mode,setMode]=useState<"basket"|"budget">("basket");
  const [rows,setRows]=useState([{key:first,qty:1}]);
  const [budget,setBudget]=useState(1000);
  const [bKey,setBKey]=useState(first);
  const num=(n:number)=>new Intl.NumberFormat(isAr?"ar-DZ":"en-DZ",{maximumFractionDigits:2}).format(n);
  const L=isAr?{title:"حاسبة المشتريات",basket:"سلة",budget:"ميزانية",add:"+ إضافة منتج",total:"المجموع الكلي",amount:"المبلغ (دج)",can:"يمكنك شراء"}:{title:"Shopping calculator",basket:"Basket",budget:"Budget",add:"+ Add product",total:"Grand total",amount:"Amount (DZD)",can:"You can buy"};
  const opts=entries.map(([k,i])=><option key={k} value={k}>{productName(i.product,language)} — {marketLabel(i.market,language)}</option>);
  const price=(k:string)=>(map.get(k)??entries[0]?.[1])?.price??0;
  const unit=(k:string)=>unitLabel((map.get(k)??entries[0]?.[1])?.unit??"kg",language);
  const total=rows.reduce((s,r)=>s+price(r.key)*r.qty,0);
  const upd=(i:number,p:Partial<{key:string;qty:number}>)=>setRows(rs=>rs.map((r,x)=>x===i?{...r,...p}:r));
  return <section className="mx-auto max-w-2xl"><SectionTitle icon={<Calculator/>} title={L.title}/>
    <div className="segmented mb-4"><button onClick={()=>setMode("basket")} className={mode==="basket"?"selected":""}>{L.basket}</button><button onClick={()=>setMode("budget")} className={mode==="budget"?"selected":""}>{L.budget}</button></div>
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      {mode==="basket"?<>
        {rows.map((r,i)=><div key={i} className="mb-3 flex items-center gap-2">
          <select value={map.has(r.key)?r.key:first} onChange={e=>upd(i,{key:e.target.value})} className="field min-w-0 flex-1">{opts}</select>
          <input type="number" min="0" step="0.1" value={r.qty} onChange={e=>upd(i,{qty:Math.max(0,Number(e.target.value))})} className="field w-24"/>
          <span className="w-10 text-xs text-muted-foreground">{unit(r.key)}</span>
          {rows.length>1&&<button onClick={()=>setRows(rs=>rs.filter((_,x)=>x!==i))} className="icon-button-sm" aria-label="remove">✕</button>}
        </div>)}
        <button onClick={()=>setRows(rs=>[...rs,{key:first,qty:1}])} className="filter-button mb-5">{L.add}</button>
        <div className="rounded-xl bg-primary p-5 text-primary-foreground"><p className="text-sm opacity-80">{L.total}</p><p className="mt-2 font-display text-4xl font-extrabold" dir="ltr">{money(total)}</p></div>
      </>:<>
        <select value={map.has(bKey)?bKey:first} onChange={e=>setBKey(e.target.value)} className="field mb-4">{opts}</select>
        <label className="label">{L.amount}</label>
        <input type="number" min="0" step="50" value={budget} onChange={e=>setBudget(Math.max(0,Number(e.target.value)))} className="field mb-6"/>
        <div className="rounded-xl bg-primary p-5 text-primary-foreground"><p className="text-sm opacity-80">{L.can}</p><p className="mt-2 font-display text-4xl font-extrabold"><bdi>{num(price(bKey)>0?budget/price(bKey):0)}</bdi> {unit(bKey)}</p></div>
      </>}
    </div></section>}

function Intro({language,setLanguage,onDone}:{language:Language;setLanguage:(l:Language)=>void;onDone:()=>void}){
  const isAr=language==="ar";
  const [i,setI]=useState(0);
  const S=isAr?[
    {icon:<ShoppingBasket size={56}/>,title:"مرحباً بك في سوقي",text:"أسعار الخضر والفواكه في سوق الجملة، محدّثة وبشكل واضح مثل شاشات الأسهم."},
    {icon:<TrendingUp size={56}/>,title:"تابع الأسعار",text:"شاهد الارتفاع والانخفاض والرسم البياني لكل منتج، وأضف المفضّلة بنقرة واحدة."},
    {icon:<Calculator size={56}/>,title:"احسب مشترياتك",text:"احسب سلة مشترياتك أو اعرف كم كيلوغراماً تشتري بميزانيتك."}
  ]:[
    {icon:<ShoppingBasket size={56}/>,title:"Welcome to Souk",text:"Wholesale fruit and vegetable prices, clear and up to date like a stock ticker."},
    {icon:<TrendingUp size={56}/>,title:"Track prices",text:"See rises, falls and a chart for every product, and save favorites with one tap."},
    {icon:<Calculator size={56}/>,title:"Calculate your shopping",text:"Total your basket or see how many kilos your budget can buy."}
  ];
  const L=isAr?{next:"التالي",start:"ابدأ",skip:"تخطّي",lang:"English"}:{next:"Next",start:"Get started",skip:"Skip",lang:"العربية"};
  const last=i===S.length-1;
  return <div dir={isAr?"rtl":"ltr"} className="flex min-h-screen flex-col bg-background px-6 py-8 text-foreground">
    <div className="flex items-center justify-between">
      <button onClick={onDone} className="text-sm text-muted-foreground">{L.skip}</button>
      <button onClick={()=>setLanguage(isAr?"en":"ar")} className="text-sm font-bold text-primary">{L.lang}</button>
    </div>
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="grid size-28 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-card">{S[i]!.icon}</span>
      <h1 className="mt-8 font-display text-3xl font-extrabold">{S[i]!.title}</h1>
      <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-muted-foreground">{S[i]!.text}</p>
    </div>
    <div className="mb-6 flex justify-center gap-2">{S.map((_,x)=><span key={x} className={`h-2 rounded-full transition-all ${x===i?"w-6 bg-primary":"w-2 bg-muted"}`}/>)}</div>
    <button onClick={()=>last?onDone():setI(i+1)} className="w-full rounded-2xl bg-primary py-4 font-display text-lg font-bold text-primary-foreground">{last?L.start:L.next}</button>
  </div>}

function BrandLetters({className,delay=0}:{className?:string;delay?:number}){
  return <svg viewBox="0 0 420 140" className={className} fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-label="MWC">
    <path className="mwo-draw" style={{animationDelay:`${delay+0.1}s`}} pathLength="1" d="M15 125 L15 15 L65 85 L115 15 L115 125"/>
    <path className="mwo-draw" style={{animationDelay:`${delay+0.55}s`}} pathLength="1" d="M155 15 L185 125 L210 50 L235 125 L265 15"/>
    <path className="mwo-draw" style={{animationDelay:`${delay+1}s`}} pathLength="1" d="M383.9 31.1 A48 55 0 1 0 383.9 108.9"/>
  </svg>}

function BrandIntro({onDone}:{onDone:()=>void}){
  useEffect(()=>{const t=setTimeout(onDone,6000);return()=>clearTimeout(t)},[onDone]);
  const name="salah".split("");
  return <div onClick={onDone} className="mwo-root fixed inset-0 z-50 overflow-hidden text-white" style={{background:"linear-gradient(180deg,#3b82d6 0%,#1e4fa0 100%)"}}>
    <style>{`
      .mwo-root{animation:mwo-out .6s ease 5.4s forwards}
      .mwo-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
      .mwo-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:mwo-draw 1.1s cubic-bezier(.65,0,.35,1) forwards}
      .mwo-s{stroke-dasharray:1;stroke-dashoffset:1;animation:mwo-draw 1.2s cubic-bezier(.65,0,.35,1) .5s forwards}
      .mwo-box{opacity:0;animation:mwo-pop .8s cubic-bezier(.22,1,.36,1) .2s forwards}
      .mwo-ch{display:inline-block;opacity:0;transform:translateX(-14px);filter:blur(6px);animation:mwo-ch .8s cubic-bezier(.22,1,.36,1) forwards}
      .mwo-first{animation:mwo-gone .7s ease 3s forwards}
      .mwo-second{opacity:0;animation:mwo-in .6s ease 3.4s forwards}
      .mwo-fade{opacity:0;animation:mwo-up .8s cubic-bezier(.22,1,.36,1) forwards}
      @keyframes mwo-draw{to{stroke-dashoffset:0}}
      @keyframes mwo-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
      @keyframes mwo-ch{to{opacity:1;transform:none;filter:blur(0)}}
      @keyframes mwo-gone{to{opacity:0;transform:scale(.96);filter:blur(8px);visibility:hidden}}
      @keyframes mwo-in{to{opacity:1}}
      @keyframes mwo-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      @keyframes mwo-out{to{opacity:0}}
      @media (prefers-reduced-motion:reduce){.mwo-draw,.mwo-s{animation-duration:.01s}}
    `}</style>
    <div className="mwo-stage mwo-first" dir="ltr">
      <div className="flex items-center gap-5">
        <div className="mwo-box grid size-20 place-items-center rounded-[1.4rem] bg-white/10 ring-1 ring-white/30 backdrop-blur-sm">
          <svg viewBox="0 0 100 100" className="size-12" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
            <path className="mwo-s" pathLength="1" d="M72 28 C66 14 32 12 28 34 C25 54 74 46 74 68 C74 90 36 90 26 74"/>
          </svg>
        </div>
        <div className="text-[2.6rem] font-light leading-none tracking-[0.14em]" style={{fontFamily:"Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"}}>
          {name.map((c,i)=><span key={i} className="mwo-ch" style={{animationDelay:`${1.3+i*0.12}s`}}>{c}</span>)}
        </div>
      </div>
      <div className="mwo-fade mt-7 h-px w-24 bg-white/40" style={{animationDelay:"2.1s"}}/>
    </div>
    <div className="mwo-stage mwo-second" dir="ltr">
      <BrandLetters className="w-64" delay={3.5}/>
      <div className="mwo-fade mt-7 h-px w-32 bg-blue-200/60" style={{animationDelay:"5s"}}/>
      <p className="mwo-fade mt-4 text-xs font-light tracking-[0.45em] text-blue-100" style={{animationDelay:"5s"}}>TEAM</p>
    </div>
  </div>}

function BrandMark(){
  return <div aria-hidden="true" className="pointer-events-none fixed bottom-24 end-3 z-40 select-none text-primary opacity-25"><BrandLetters className="w-12"/></div>}
