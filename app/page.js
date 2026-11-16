'use client';
import { useCallback,useEffect,useMemo,useState } from 'react';
import { categories,usd,photoLimit,photoTypes } from '../lib/shared';

const icons={bag:'M5 8h14l1 13H4L5 8zm4 1V6a3 3 0 0 1 6 0v3',search:'m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',plus:'M12 5v14M5 12h14',arrow:'m14 6-6 6 6 6',photo:'M4 4h16v16H4zM4 17l5-5 3 3 3-4 5 6M8 8h.01',check:'m5 12 4 4L19 6',box:'M3 8l9-5 9 5v9l-9 5-9-5V8zm0 0 9 5 9-5m-9 5v9',pin:'M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 1 1 16 0zm-8-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'};
function Icon({name,size=20}) { return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d={icons[name]}/></svg>; }
function AppLink({to,go,children,...props}) {
  return <a href={to} {...props} onClick={e=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go(to);}}}>{children}</a>;
}
function Visual({item,className=''}) {
  const [broken,setBroken]=useState(false);
  useEffect(()=>setBroken(false),[item.image_url]);
  return <div className={'visual '+className} data-category={item.category}>{item.image_url&&!broken ? <img src={item.image_url} alt={item.title||'Listing photo preview'} onError={()=>setBroken(true)}/> : <div className="visual-placeholder"><Icon name="box" size={48}/><span>No photo</span></div>}</div>;
}
async function json(url,opts) {
  const res=await fetch(url,opts);
  const body=await res.json().catch(()=>null);
  if(!res.ok) throw new Error(body?.error || (res.status===413 ? 'The upload is too large.' : 'Something went wrong. Please try again.'));
  return body;
}
export default function Home() {
  const [view,setView]=useState('#browse'),[list,setList]=useState([]),[local,setLocal]=useState(false),[status,setStatus]=useState('loading'),[error,setError]=useState(''),[search,setSearch]=useState(''),[category,setCategory]=useState('');
  const go=useCallback(to=>{if(location.hash!==to) history.pushState(null,'',to);setView(to);window.scrollTo(0,0);},[]);
  const load=useCallback(async () => {
    setStatus('loading');setError('');
    try {const body=await json('/api/listings');setList(body.listings);setLocal(body.localDemo);setStatus('ready');}
    catch(e){setError(e.message);setStatus('error');}
  },[]);
  useEffect(()=>{
    const sync=()=>setView(location.hash||'#browse');
    sync();load();window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);
    return ()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);};
  },[load]);
  const filtered=useMemo(()=>list.filter(item=>(!category||item.category===category)&&(!search.trim()||[item.title,item.description,item.location,item.category].some(value=>value?.toLowerCase().includes(search.trim().toLowerCase())))),[list,category,search]);
  const detail=view.startsWith('#listing/'), selected=detail? list.find(it=>it.id===view.slice(9)):null;
  return <>
    <header className="nav"><div className="wrap nav-inner">
      <AppLink className="brand" to="#browse" go={go}><span className="brand-mark"><Icon name="bag"/></span><span>Campus<span className="brand-accent">Market</span></span></AppLink>
      <AppLink to="#create" go={go} className="button"><Icon name="plus" size={17}/> Create listing</AppLink>
    </div></header>
    <main className="wrap content">
      {local&&<p className="demo-note">Local demo · Uses sample data and local storage, not Supabase.</p>}
      {view==='#create' ? <><Back go={go}/><Composer onCreated={item=>{setList(previous=>[item,...previous]);go('#listing/'+item.id);}}/></>
      : detail ? <><Back go={go}/>{selected ? <Details key={selected.id} item={selected}/> : <State status={status} error={error} load={load} empty="This listing is unavailable."/>}</>
      : <>
        <section className="hero"><div className="eyebrow">THE STUDENT MARKETPLACE</div><h1>Good finds.<br/>Second lives.</h1><p>Find what you need or pass on what you don’t.</p><div className="hero-icon"><Icon name="bag" size={145}/></div></section>
        <div className="market">
          <aside><h2>Categories</h2><div className="categories">{['',...categories].map(x=><button key={x} className={x===category?'active':''} aria-pressed={x===category} onClick={()=>setCategory(x)}>{x||'All listings'}</button>)}</div></aside>
          <section className="feed" aria-label="Marketplace listings"><div className="feed-head"><div><h2>{category||'Latest listings'}</h2>{status==='ready'&&<p>{filtered.length} {filtered.length===1?'listing':'listings'}</p>}</div><label className="search"><Icon name="search" size={18}/><input type="search" aria-label="Search listings" placeholder="Search listings" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
          {status!=='ready'||!filtered.length ? <State status={status} error={error} load={load} empty={search||category?'No listings match your filters.':'No listings yet. Be the first to post an item.'}/> :
            <div className="cards">{filtered.map(item=><AppLink to={'#listing/'+item.id} go={go} className="card" key={item.id}><Visual item={item}/><div className="card-body"><span className="tag">{item.category}</span><h3>{item.title}</h3><strong>{usd(item.price)}</strong><span className="place"><Icon name="pin" size={15}/>{item.location}</span></div></AppLink>)}</div>}
          </section>
        </div>
      </>}
    </main>
    <footer className="wrap footer">CampusMarket <span>Buy secondhand. Sell locally.</span></footer>
  </>;
}
function Back({go}) {return <AppLink to="#browse" go={go} className="back"><Icon name="arrow" size={16}/> Back to marketplace</AppLink>;}
function State({status,error,load,empty}) {return <div className="state" role={status==='error'?'alert':'status'}>{status==='loading'?'Loading listings…':status==='error'?<><p>{error}</p><button className="button secondary" onClick={load}>Try again</button></>:empty}</div>;}
function Composer({onCreated}) {
  const [draft,setDraft]=useState({title:'',price:'',location:'Palo Alto, CA',description:'',category:''}),[photo,setPhoto]=useState(null),[url,setUrl]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    if(!photo){setUrl('');return;}
    const preview=URL.createObjectURL(photo);setUrl(preview);
    return ()=>URL.revokeObjectURL(preview);
  },[photo]);
  const field=name=>({name,value:draft[name],onChange:e=>setDraft({...draft,[name]:e.target.value})});
  async function submit(e) {
    e.preventDefault();setBusy(true);setError('');
    const input=new FormData(e.currentTarget);
    try {const body=await json('/api/listings',{method:'POST',body:input});onCreated(body.listing);}
    catch(e){setError(e.message);}
    finally {setBusy(false);}
  }
  return <><div className="page-title"><div className="eyebrow">SELL ON CAMPUSMARKET</div><h1>Create a listing</h1><p>Give something you no longer need a second life.</p></div><div className="split"><form className="panel form" onSubmit={submit}>
    <h2>Item for sale</h2><label className="upload"><Icon name="photo"/><span>Add a photo <small>Optional · JPEG, PNG, or WebP up to 4 MB</small></span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0]; if(file&&(!photoTypes[file.type]||file.size>photoLimit)){e.target.value='';setPhoto(null);setError('Use a JPEG, PNG, or WebP photo up to 4 MB.');}else{setPhoto(file||null);setError('');}}}/></label>
    <label>Title <input required maxLength={255} placeholder="e.g. City commuter bicycle" {...field('title')}/></label>
    <div className="pair"><label>Category <select required {...field('category')}><option value="">Choose category</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label><label>Price (USD) <input required type="number" min="0" max="99999999.99" step=".01" placeholder="0.00" {...field('price')}/></label></div>
    <label>Location <input maxLength={255} {...field('location')}/></label>
    <label>Contact email <input name="email" type="email" required maxLength={255} placeholder="you@example.com"/><small>Your email is not displayed publicly.</small></label>
    <label>Description <textarea maxLength={2000} rows={4} placeholder="Tell buyers about the item and its condition." {...field('description')}/></label>
    {error&&<p className="alert" role="alert">{error}</p>}<button className="button" disabled={busy} type="submit">{busy?'Publishing…':'Publish listing'}</button>
  </form><section className="panel preview"><h2>Listing preview</h2><Visual item={{...draft,image_url:url}}/><div className="preview-body"><span className="tag">{draft.category||'Category'}</span><h3>{draft.title||'Your item title'}</h3><strong>{draft.price?usd(draft.price):'Price'}</strong><p className="place"><Icon name="pin" size={16}/>{draft.location||'Palo Alto, CA'}</p><p>{draft.description}</p></div></section></div></>;
}
function Details({item}) {
  const [status,setStatus]=useState(''),[error,setError]=useState('');
  async function submit(e) {
    e.preventDefault();setStatus('sending');setError('');
    const data=Object.fromEntries(new FormData(e.currentTarget));
    try {await json('/api/listings/'+item.id+'/message',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});setStatus('saved');}
    catch(e){setError(e.message);setStatus('');}
  }
  return <div className="split detail"><Visual item={item}/><div className="panel detail-body"><span className="tag">{item.category}</span><h1>{item.title}</h1><strong>{usd(item.price)}</strong><p className="place"><Icon name="pin" size={16}/>{item.location}</p>{item.description&&<p className="description">{item.description}</p>}
  <hr/><h2>Message seller</h2><p className="muted">Ask about availability, pickup, or condition.</p>
  {status==='saved'?<p className="success" role="status"><Icon name="check"/> Your message was saved. This demo does not send an email notification.</p>:<form className="form message" onSubmit={submit}><label>Your email <input type="email" required name="email" maxLength={255} placeholder="you@example.com"/></label><label>Message <textarea name="message" required maxLength={1000} rows={4} placeholder="Hi! Is this still available?"/></label>{error&&<p className="alert" role="alert">{error}</p>}<button className="button" type="submit" disabled={status==='sending'}>{status==='sending'?'Saving…':'Send message'}</button></form>}</div></div>;
}
