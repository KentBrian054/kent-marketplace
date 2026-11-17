'use client';
import { usd } from '../lib/shared';

export const paymentsPreview = process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_STRIPE_UI_PREVIEW === '1';

const demoStates = {
  '10000000-0000-4000-8000-000000000001': 'available',
  '10000000-0000-4000-8000-000000000002': 'unavailable',
  '10000000-0000-4000-8000-000000000003': 'sold',
};

export function paymentState(item, sold) {
  return sold.includes(item.id) ? 'sold' : (demoStates[item.id] ?? 'unavailable');
}

export function PaymentBadge({state}) {
  const captions = {available:'Buy now available', unavailable:'Online checkout unavailable', sold:'Sold'};
  return <span className={'payment-badge '+state}>{captions[state]}</span>;
}

export function PurchasePanel({item,state,go}) {
  return <section className="payment-panel" aria-labelledby="payment-title">
    <p className="eyebrow">PURCHASE</p><h2 id="payment-title">{state==='sold' ? 'This item is sold' : 'Buy this item'}</h2>
    {state==='available' ? <>
      <p>Review the order before continuing. No payment is collected in this preview.</p>
      <button className="button" onClick={()=>go('#checkout/'+item.id)}>Buy Now · {usd(item.price)}</button>
    </> : <p>{state==='sold' ? 'This listing is no longer available to buy.' : 'The seller hasn’t enabled online checkout. You can still message them about the item.'}</p>}
  </section>;
}

export function SellerPayments({connected,onConnect}) {
  return <section className="payment-screen">
    <p className="eyebrow">CAMPUSMARKET SELLER TOOLS</p><h1>Seller payments</h1>
    <p className="muted">Connect a Stripe account to offer online checkout on eligible listings.</p>
    <div className="panel payment-flow">
      <span className={'payment-badge '+(connected?'available':'unavailable')}>{connected?'Connected · preview':'Not connected'}</span>
      <h2>{connected?'You’re ready to accept payments':'Connect with Stripe'}</h2>
      <p>In the finished app, Stripe handles onboarding on its own page and returns you here. This preview only changes the status on this screen.</p>
      {!connected&&<button className="button" onClick={onConnect}>Connect with Stripe · Preview</button>}
    </div>
  </section>;
}

export function OrderPreview({item,outcome,onConfirm,onCancel,onBack}) {
  if (!item) return <div className="state">This preview order is unavailable.</div>;
  return <section className="payment-screen"><p className="eyebrow">TEST 4 · UI PREVIEW</p>
    <h1>{outcome==='success'?'Order confirmed':outcome==='cancel'?'Checkout canceled':'Review your order'}</h1>
    <div className="panel payment-flow">
      {outcome==='success' && <p className="success" role="status">Simulated payment complete. The listing is marked sold in this preview only.</p>}
      {outcome==='cancel' && <p role="status">No payment was made. The item is still available.</p>}
      <dl className="order-summary"><div><dt>Item</dt><dd>{item.title}</dd></div><div><dt>Total (USD)</dt><dd>{usd(item.price)}</dd></div></dl>
      <p>{outcome ? 'No order or payment was recorded.' : 'The finished app will open Stripe Checkout. This preview does not collect card details or charge money.'}</p>
      <div className="payment-actions">{outcome ? <button className="button" onClick={onBack}>Back to listing</button> : <>
        <button className="button" onClick={onConfirm}>Simulate successful payment</button>
        <button className="button secondary" onClick={onCancel}>Cancel checkout</button>
      </>}</div>
    </div>
  </section>;
}
