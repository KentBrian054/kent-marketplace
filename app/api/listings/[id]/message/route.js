import { addMessage } from '../../../../../lib/store';
import { clean,email,error,sameOrigin } from '../../../../../lib/input';
import { idPattern } from '../../../../../lib/shared';
export async function POST(request,{params}) {
  if(!sameOrigin(request)) return error('Request origin is not allowed.',403);
  const {id}=await params;
  if(!idPattern.test(id)) return error('Listing not found.',404);
  if(Number(request.headers.get('content-length'))>10000) return error('The message is too large.',413);
  let body;
  try { body=await request.json(); } catch { return error('Could not read your message.'); }
  const buyer_email=clean(body?.email).toLowerCase(),message=clean(body?.message);
  if(!email(buyer_email) || !message || message.length>1000) return error('Enter a valid email and a message of up to 1,000 characters.');
  try {
    if(!(await addMessage(id,{buyer_email,message}))) return error('Listing not found.',404);
    return Response.json({saved:true},{status:201});
  } catch { return error('Could not save your message. Please try again.',503); }
}
