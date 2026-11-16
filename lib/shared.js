export const categories = ['Electronics','Home Goods','Apparel','Sporting Goods','Books & Media','Bicycles','Free Stuff','Other'];
export const usd = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
export const photoLimit = 4 * 1024 * 1024;
export const photoTypes = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
export const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
