import { getLocalPhoto } from '../../../../lib/store';
import { idPattern } from '../../../../lib/shared';
export function GET(_request,{params}) {
  return params.then(({name}) => {
    const [id,ext,extra]=name.split('.');
    const types={jpg:'image/jpeg',png:'image/png',webp:'image/webp'};
    if(!idPattern.test(id) || !Object.hasOwn(types,ext) || extra!==undefined) return new Response(null,{status:404});
    const bytes=getLocalPhoto(name);
    if(!bytes) return new Response(null,{status:404});
    return new Response(bytes,{headers:{'Content-Type':types[ext],'X-Content-Type-Options':'nosniff'}});
  });
}
