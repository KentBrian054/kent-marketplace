import { categories, photoLimit, photoTypes } from './shared';
export const clean = v => typeof v==='string' ? v.trim() : '';
export const email = v => v.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export function error(message,status=400) { return Response.json({error:message},{status}); }
export function sameOrigin(request) {
  const origin=request.headers.get('origin');
  if(!origin) return true;
  try { return new URL(origin).host === request.headers.get('host'); } catch { return false; }
}
export async function readPhoto(file) {
  if(!file || typeof file==='string' || !file.size) return null;
  const ext=photoTypes[file.type];
  if(!ext || file.size>photoLimit) throw new Error('Use a JPEG, PNG, or WebP photo up to 4 MB.');
  const bytes=Buffer.from(await file.arrayBuffer());
  const valid=ext==='jpg' ? bytes.subarray(0,3).equals(Buffer.from([255,216,255]))
    : ext==='png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : bytes.subarray(0,4).toString()==='RIFF' && bytes.subarray(8,12).toString()==='WEBP';
  if(!valid) throw new Error('The photo does not match its file format.');
  return {bytes,ext,type:file.type};
}
export function parseListing(form) {
  const title=clean(form.get('title')), description=clean(form.get('description')),
    category=clean(form.get('category')), priceText=clean(form.get('price')),
    seller_email=clean(form.get('email')).toLowerCase(), location=clean(form.get('location')) || 'Palo Alto, CA';
  if(!title || title.length>255 || !categories.includes(category) || !/^\d{1,8}(\.\d{1,2})?$/.test(priceText) || !email(seller_email) || location.length>255 || description.length>2000)
    throw new Error('Enter a valid title, category, price, and contact email. Check the field limits.');
  return {title,description,category,price:Number(priceText),seller_email,location};
}
