import { createClient } from '@supabase/supabase-js';
import { mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const directory = join(process.cwd(), '.marketplace-local');
const path = join(directory, 'records.json');
const publicFields = 'id,title,description,price,category,image_url,location,created_at';
const examples = [
  ['City commuter bicycle', 140, 'Bicycles', 'Serviced last month and ready for a new rider.'],
  ['Compact desk lamp', 22, 'Home Goods', 'Warm light and an adjustable arm.'],
  ['Mechanical keyboard', 55, 'Electronics', 'Compact layout with tactile switches.']
].map(([title,price,category,description], i) => ({id:'10000000-0000-4000-8000-00000000000'+(i+1),title,price,category,description,seller_email:'seller@example.test',location:'Palo Alto, CA',created_at:new Date(Date.now()-i*1000).toISOString(), image_url:null}));

export function isLocal() {
  return process.env.NODE_ENV !== 'production' && process.env.MARKETPLACE_LOCAL_DEMO === '1';
}
function read() {
  try { return JSON.parse(readFileSync(path,'utf8')); }
  catch (e) { if (e.code !== 'ENOENT') throw e; return {listings:examples,messages:[]}; }
}
function write(data) {
  mkdirSync(directory,{recursive:true});
  const temp = path+'.'+randomUUID();
  writeFileSync(temp, JSON.stringify(data,null,2), {mode:0o600});
  renameSync(temp,path);
}
function db() {
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase configuration is missing.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
const hideEmail = ({seller_email,...listing}) => listing;
export async function getListings() {
  if (isLocal()) return read().listings.map(hideEmail);
  const {data,error}=await db().from('listings').select(publicFields).order('created_at',{ascending:false}).limit(100);
  if(error) throw error;
  return data;
}
export async function addListing(input, photo) {
  const id=randomUUID();
  if(isLocal()) {
    const data=read();
    const row={...input,id,image_url:photo ? '/api/photos/'+id+'.'+photo.ext : null,created_at:new Date().toISOString()};
    if(photo) {
      mkdirSync(directory,{recursive:true});
      writeFileSync(join(directory,id+'.'+photo.ext),photo.bytes);
    }
    try { data.listings.unshift(row); write(data); }
    catch(e) {
      if(photo) try { unlinkSync(join(directory,id+'.'+photo.ext)); } catch {}
      throw e;
    }
    return hideEmail(row);
  }
  const supabase=db();
  const bucket=supabase.storage.from('listing-images');
  const key=photo ? id+'.'+photo.ext : null;
  let image_url=null;
  if(photo) {
    const {error}=await bucket.upload(key,photo.bytes,{contentType:photo.type,upsert:false});
    if(error) throw error;
    image_url=bucket.getPublicUrl(key).data.publicUrl;
  }
  const {data,error}=await supabase.from('listings').insert({...input,id,image_url}).select(publicFields).single();
  if(error) {
    if(key) await bucket.remove([key]).catch(()=>{});
    throw error;
  }
  return data;
}
export async function addMessage(listing_id, input) {
  if(isLocal()) {
    const data=read();
    const listing=data.listings.find(row=>row.id===listing_id);
    if(!listing) return false;
    data.messages.push({...input,id:randomUUID(),listing_id,seller_email:listing.seller_email,created_at:new Date().toISOString()});
    write(data);
    return true;
  }
  const supabase=db();
  const {data,error}=await supabase.from('listings').select('seller_email').eq('id',listing_id).maybeSingle();
  if(error) throw error;
  if(!data) return false;
  const {error: insertError}=await supabase.from('messages').insert({...input,listing_id,seller_email:data.seller_email});
  if(insertError) throw insertError;
  return true;
}
export function getLocalPhoto(name) {
  if(!isLocal()) return null;
  try { return readFileSync(join(directory,name)); } catch(e) { if(e.code==='ENOENT') return null; throw e; }
}
