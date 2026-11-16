import { addListing,getListings,isLocal } from '../../../lib/store';
import { error,parseListing,readPhoto,sameOrigin } from '../../../lib/input';
export async function GET() {
  try { return Response.json({listings:await getListings(), localDemo:isLocal()},{headers:{'Cache-Control':'no-store'}}); }
  catch { return error('Could not load listings. Check your connection and try again.',503); }
}
export async function POST(request) {
  if(!sameOrigin(request)) return error('Request origin is not allowed.',403);
  if(Number(request.headers.get('content-length'))>4.4*1024*1024) return error('The upload is too large.',413);
  let input, photo;
  try {
    const form=await request.formData();
    input=parseListing(form);
    photo=await readPhoto(form.get('photo'));
  } catch(e) { return error(e instanceof TypeError ? 'Could not read the listing form.' : e.message); }
  try { return Response.json({listing:await addListing(input,photo)},{status:201}); }
  catch { return error('Could not publish this listing. Please try again.',503); }
}
