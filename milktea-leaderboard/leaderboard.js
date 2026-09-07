/* Edit entries.json to add stores, drinks, tiers, photos, and locations. */
const TRACKS = ['milktea', 'fruittea', 'hk-milktea', 'pure-tea', 'ready-to-drink-tea'];
let activeTrack = 'milktea';
let leaderboardData = null;
const TIERS = ['S+', 'S', 'A', 'B', 'C', 'D'];
const tierClass = tier => tier === null ? 'tier-pending' : tier === 'S+' ? 'tier-sp' : `tier-${tier.toLowerCase()}`;
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, document.baseURI);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function makeEntry(entry, store) {
  const row = element('li', `tea-row ${tierClass(entry.tier)}`);
  const locationUrl = safeUrl(entry.location?.url);
  const logoBox = element(locationUrl ? 'a' : 'div', 'store-logo');
  if (locationUrl) {
    logoBox.href = locationUrl;
    logoBox.target = '_blank';
    logoBox.rel = 'noopener noreferrer';
    logoBox.setAttribute('aria-label', `${entry.location.label || store.name} on Google Maps (opens in a new tab)`);
    logoBox.title = 'Open in Google Maps';
  }
  const logo = safeUrl(store.logo);
  const fallback = () => {
    logoBox.replaceChildren(element('span', 'logo-placeholder', store.logoText || 'Logo pending'));
  };
  if (logo) {
    const img = element('img');
    img.src = logo; img.alt = store.logoAlt || `${store.name} logo`; img.loading = 'lazy';
    img.addEventListener('error', fallback, {once: true});
    logoBox.append(img);
  } else fallback();
  const copy = element('div', 'tea-copy');
  const identity = element('div', 'tea-identity');
  identity.append(element('p', 'shop', store.name), element('h3', '', entry.drink));
  const details = element('div', 'tea-details');
  copy.append(identity, details);
  if (entry.order) details.append(element('p', 'order-detail', entry.order));
  if (entry.notes) details.append(element('p', 'tasting-note', entry.notes));
  const badge = element('span', 'entry-tier', entry.tier ?? '—');
  badge.setAttribute('aria-label', entry.tier ? `${entry.tier} tier` : 'Not rated yet');
  const price = element('div', 'entry-price');
  let priceText = '—';
  if (Number.isFinite(entry.price?.amount) && entry.price.amount >= 0) {
    priceText = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: entry.price.currency || 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 2
    }).format(entry.price.amount);
  }
  price.append(element('span', 'price-value', priceText));
  const ratings = element('div', 'entry-ratings');
  const health = element('span', `entry-health health-${(entry.healthRating || 'pending').toLowerCase()}`, entry.healthRating || '—');
  health.setAttribute('aria-label', `Health rating: ${entry.healthRating || 'Not rated'}`);
  health.title = 'Personal health rating';
  const storeRating = element('div', 'store-rating');
  storeRating.append(badge, logoBox);
  ratings.append(element('span', 'rating-label', 'Health'), health);
  row.append(storeRating, copy, price, ratings);
  const imageUrl = safeUrl(entry.image);
  if (imageUrl) {
    const figure = element('figure', 'drink-photo');
    const img = element('img');
    img.src = imageUrl; img.alt = entry.imageAlt || `${entry.drink} from ${store.name}`;
    img.loading = 'lazy'; img.width = 160; img.height = 180;
    img.addEventListener('error', () => { figure.remove(); row.classList.remove('has-photo'); }, {once: true});
    figure.append(img); copy.insertBefore(figure, details); row.classList.add('has-photo');
  }
  return row;
}
function renderLeaderboard(data) {
  if (!data.stores || !Array.isArray(data.entries)) throw new Error('Invalid leaderboard data.');
  const ids = new Set();
  for (const entry of data.entries) {
    if (entry.healthRating != null && !['A', 'B', 'C', 'D', 'E', 'F'].includes(entry.healthRating)) throw new Error('Invalid health rating.');
    if (!entry.id || ids.has(entry.id) || (entry.tier !== null && !TIERS.includes(entry.tier)) || !data.stores[entry.store]?.name || !entry.drink || !TRACKS.includes(entry.track || 'milktea')) {
      throw new Error('An entry is missing its unique ID, store, drink, or valid tier.');
    }
    ids.add(entry.id);
  }
  leaderboardData = data;
  const visibleEntries = data.entries.filter(entry => (entry.track || 'milktea') === activeTrack);
  const fragment = document.createDocumentFragment();
  for (const entry of visibleEntries) {
    fragment.append(makeEntry(entry, data.stores[entry.store]));
  }
  document.getElementById('entries').replaceChildren(fragment);
  document.getElementById('empty-list').hidden = visibleEntries.length !== 0;
  document.getElementById('empty-list').textContent = 'No drinks added to this track yet.';
  document.getElementById('demo-notice').hidden = !data.sample;
  document.getElementById('load-status').hidden = true;
}
const trackTabs = [...document.querySelectorAll('[role="tab"][data-track]')];
function selectTrack(tab) {
  activeTrack = tab.dataset.track;
  for (const item of trackTabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  document.getElementById('leaderboard').setAttribute('aria-labelledby', tab.id);
  if (leaderboardData) renderLeaderboard(leaderboardData);
}
trackTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTrack(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % trackTabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + trackTabs.length) % trackTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = trackTabs.length - 1;
    else return;
    event.preventDefault(); selectTrack(trackTabs[next]); trackTabs[next].focus();
  });
});
fetch('entries.json' , {cache: 'no-cache'})
  .then(response => { if (!response.ok) throw new Error('Could not load entries.'); return response.json(); })
  .then(renderLeaderboard)
  .catch(error => {
    document.getElementById('load-status').textContent = 'The tea list could not load. Please refresh and try again.';
    console.error(error);
  });
