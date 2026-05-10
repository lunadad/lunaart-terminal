import { readFileSync, writeFileSync } from 'fs';

const CHRISTIES_SALES = [
  {
    name: "Dans l'intimité de Pierre Bonnard: Collection Claude Terrasse",
    date: '2026-04-14',
    city: 'Paris',
    category: 'Impressionist',
    currency: 'EUR',
    url: 'https://www.christies.com/en/auction/dans-l-intimit-de-pierre-bonnard-collection-claude-terrasse-31333/',
  },
  {
    name: 'Radical Genius: Works on Paper from a Distinguished Private Collection',
    date: '2026-04-15',
    city: 'Paris',
    category: 'Modern',
    currency: 'EUR',
    url: 'https://www.christies.com/en/auction/radical-genius-works-on-paper-from-a-distinguished-private-collection-31335/',
  },
  {
    name: '20th/21st Century Art Evening Sale',
    date: '2026-04-15',
    city: 'Paris',
    category: 'Contemporary',
    currency: 'EUR',
    url: 'https://www.christies.com/en/auction/20th-21st-century-art-evening-sale-31240/',
  },
  {
    name: 'Art Contemporain',
    date: '2026-04-16',
    city: 'Paris',
    category: 'Contemporary',
    currency: 'EUR',
    url: 'https://www.christies.com/en/auction/art-contemporain-31018/',
  },
  {
    name: 'Art Impressionniste & Moderne',
    date: '2026-04-17',
    city: 'Paris',
    category: 'Modern',
    currency: 'EUR',
    url: 'https://www.christies.com/en/auction/art-impressionniste-moderne-31241/',
  },
];

const SOTHEBYS_SALES = [
  {
    name: 'Art Moderne et Contemporain Evening Auction',
    date: '2026-04-16',
    city: 'Paris',
    category: 'Modern',
    currency: 'EUR',
    url: 'https://www.sothebys.com/en/buy/auction/2026/art-moderne-et-contemporain-evening-auction-pf2606',
  },
  {
    name: 'Art Moderne et Contemporain Day Auction',
    date: '2026-04-17',
    city: 'Paris',
    category: 'Modern',
    currency: 'EUR',
    url: 'https://www.sothebys.com/en/buy/auction/2026/art-moderne-et-contemporain-day-auction-pf2626',
  },
];

const FX_TO_USD = { EUR: 1.08, GBP: 1.27, USD: 1, HKD: 0.128 };
const HEADERS = {
  Accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function normalizeName(name) {
  return (name || 'Unknown Artist').replace(/\s+/g, ' ').trim().toLowerCase();
}

function toTitleCase(str) {
  return (str || 'Unknown Artist')
    .split(' ')
    .map(word => {
      if (!word) return word;
      if (/^(de|da|di|du|van|von|la|le|of|the)$/i.test(word)) return word.toLowerCase();
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\bIi+\b/g, text => text.toUpperCase());
}

function parseArtist(titlePrimary) {
  const cleaned = (titlePrimary || 'Unknown Artist')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const match = cleaned.match(/^(.+?)\s*\((\d{4})(?:[-–](\d{4}))?\)$/);
  if (match) {
    return {
      name: toTitleCase(match[1].trim()),
      birthYear: Number(match[2]),
      deathYear: match[3] ? Number(match[3]) : null,
    };
  }
  return { name: toTitleCase(cleaned), birthYear: null, deathYear: null };
}

function parseMedium(description, objectTypes = []) {
  const text = `${description || ''} ${objectTypes.join(' ')}`.replace(/<[^>]+>/g, ' ').toLowerCase();
  if (/bronze|marble|ceramic|terracotta|plaster|sculpture|steel|wood/.test(text)) return 'Sculpture';
  if (/photograph|gelatin silver|chromogenic|c-print/.test(text)) return 'Photography';
  if (/print|lithograph|etching|screenprint|silkscreen|woodcut|aquatint/.test(text)) return 'Prints';
  if (/watercolour|watercolor|gouache|pastel|charcoal|chalk|pencil|ink|crayon|paper/.test(text)) return 'Works on Paper';
  if (/mixed media|collage|assemblage|installation/.test(text)) return 'Mixed Media';
  return 'Painting';
}

function parseYear(description, birthYear) {
  const text = (description || '').replace(/<[^>]+>/g, ' ');
  const match = text.match(/\b((?:18|19|20)\d{2})\b/);
  if (match) return Number(match[1]);
  return birthYear ? Math.min(birthYear + 35, 2026) : null;
}

function parseDimensions(description) {
  const text = (description || '').replace(/<[^>]+>/g, ' ');
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*[×xX]\s*(\d+(?:[.,]\d+)?)\s*cm/);
  return match ? `${match[1]} x ${match[2]} cm` : undefined;
}

function inferCategory(name, fallback = 'Contemporary') {
  const text = (name || '').toLowerCase();
  if (/bonnard|monet|renoir|pissarro|sisley|degas|manet|cezanne|cézanne/.test(text)) return 'Impressionist';
  if (/picasso|braque|matisse|léger|leger|mir[oó]|giacometti|magritte|dal[ií]|duchamp|kandinsky|mondrian|chagall|picabia/.test(text)) return 'Modern';
  return fallback;
}

function buildArtistResolver(data, prefix) {
  const artistByName = new Map(data.artists.map(artist => [normalizeName(artist.name), artist]));
  const maxExisting = data.artists.reduce((max, artist) => {
    const match = String(artist.id).match(new RegExp(`^${prefix}(\\d+)$`));
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  let nextId = maxExisting + 1;

  return function resolveArtist(info, fallbackCategory) {
    const key = normalizeName(info.name);
    const existing = artistByName.get(key);
    if (existing) return existing.id;

    const artist = {
      id: `${prefix}${nextId++}`,
      name: info.name || 'Unknown Artist',
      nationality: '',
      birthYear: info.birthYear ?? null,
      deathYear: info.deathYear ?? null,
      category: inferCategory(info.name, fallbackCategory),
    };
    data.artists.push(artist);
    artistByName.set(key, artist);
    return artist.id;
  };
}

async function fetchText(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function parseChristiesSaleMeta(html) {
  const saleId = html.match(/"sale_id":"([^"]+)"/)?.[1] || html.match(/"saleid":"([^"]+)"/)?.[1];
  const saleNumber = html.match(/"sale_number":"([^"]+)"/)?.[1] || html.match(/"salenumber":"([^"]+)"/)?.[1];
  const saleRoomCode = html.match(/"sale_room_code":"([^"]+)"/)?.[1] || html.match(/"saleroomcode":"([^"]+)"/)?.[1];
  if (!saleId || !saleNumber || !saleRoomCode) throw new Error('missing sale metadata');
  return { saleId, saleNumber, saleRoomCode };
}

async function fetchChristiesLots(sale) {
  const html = await fetchText(sale.url);
  const meta = parseChristiesSaleMeta(html);
  const pageSize = 120;
  const lots = [];

  for (let page = 1; page <= 10; page += 1) {
    const params = new URLSearchParams({
      language: 'en',
      pagesize: String(pageSize),
      geocountrycode: 'US',
      saleid: meta.saleId,
      salenumber: meta.saleNumber,
      saleroomcode: meta.saleRoomCode,
      page: String(page),
      sortby: 'lot_number_asc',
      saletype: 'Sale',
    });
    const data = await fetchJson(`https://www.christies.com/api/discoverywebsite/auctionpages/lotsearch?${params}`);
    const pageLots = data.lots || [];
    lots.push(...pageLots);
    if (pageLots.length < pageSize) break;
  }

  return { meta, lots };
}

function mapChristiesLot(raw, sale, meta, resolveArtist, sequence) {
  const estimateLow = Number(raw.estimate_low || 0);
  const estimateHigh = Number(raw.estimate_high || 0);
  const realised = Number(raw.price_realised || 0);
  if (!estimateLow && !estimateHigh && !realised) return null;

  const artistInfo = parseArtist(raw.title_primary_txt);
  const artistId = resolveArtist(artistInfo, sale.category);
  const lotNumber = Number.parseInt(String(raw.lot_id_txt || sequence), 10) || sequence;
  const lotKey = String(raw.lot_id_txt || raw.object_id || sequence).replace(/[^a-zA-Z0-9-]/g, '-');
  const lotId = `chr-apr-${meta.saleId}-${lotKey}`;
  const sold = realised > 0;
  const usdEquivalent = sold ? Math.round(realised * (FX_TO_USD[sale.currency] || 1)) : null;

  return {
    id: lotId,
    saleEventId: `chr-apr-${meta.saleId}`,
    auctionHouseId: 'christies',
    artistId,
    lotNumber,
    title: (raw.title_secondary_txt || 'Untitled').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120),
    medium: parseMedium(raw.description_txt),
    year: parseYear(raw.description_txt, artistInfo.birthYear),
    dimensions: parseDimensions(raw.description_txt),
    estimateLow,
    estimateHigh,
    currency: sale.currency,
    lotUrl: raw.url || `https://www.christies.com/en/lot/lot-${raw.object_id}`,
    result: {
      id: `res-${lotId}`,
      lotId,
      hammerPrice: sold ? Math.round(realised / 1.26) : null,
      premiumPrice: sold ? realised : null,
      currency: sale.currency,
      usdEquivalent,
      sold,
      saleDate: sale.date,
    },
  };
}

function extractSothebysHits(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('missing __NEXT_DATA__');
  return JSON.parse(match[1])?.props?.pageProps?.algoliaJson?.hits || [];
}

async function auditSothebysResults() {
  let hidden = 0;
  let priced = 0;

  for (const sale of SOTHEBYS_SALES) {
    process.stdout.write(`Sotheby's audit: ${sale.name}... `);
    try {
      const hits = extractSothebysHits(await fetchText(sale.url));
      const visiblePrices = hits.filter(hit => Number(hit.price || 0) > 0);
      hidden += hits.length - visiblePrices.length;
      priced += visiblePrices.length;
      console.log(`${hits.length} lots (${visiblePrices.length} visible result prices)`);
    } catch (error) {
      console.log(`failed (${error.message})`);
    }
  }

  return { hidden, priced };
}

async function updateChristies() {
  const path = './src/lib/christies-data.json';
  const data = readJson(path);
  data.saleEvents = data.saleEvents.filter(event => !String(event.id).startsWith('chr-apr-'));
  data.lots = data.lots.filter(lot => !String(lot.id).startsWith('chr-apr-'));
  const resolveArtist = buildArtistResolver(data, 'a');

  let sequence = data.lots.length + 1;
  for (const sale of CHRISTIES_SALES) {
    process.stdout.write(`Christie's: ${sale.name}... `);
    try {
      const { meta, lots } = await fetchChristiesLots(sale);
      data.saleEvents.push({
        id: `chr-apr-${meta.saleId}`,
        auctionHouseId: 'christies',
        name: sale.name,
        city: sale.city,
        date: sale.date,
        category: sale.category,
        url: sale.url,
      });
      const mapped = lots
        .map(raw => mapChristiesLot(raw, sale, meta, resolveArtist, sequence++))
        .filter(Boolean);
      data.lots.push(...mapped);
      console.log(`${mapped.length} lots, ${mapped.filter(lot => lot.result.sold).length} sold`);
    } catch (error) {
      console.log(`failed (${error.message})`);
    }
  }

  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  return {
    lots: data.lots.filter(lot => String(lot.id).startsWith('chr-apr-')).length,
    sold: data.lots.filter(lot => String(lot.id).startsWith('chr-apr-') && lot.result.sold).length,
  };
}

const christies = await updateChristies();
const sothebys = await auditSothebysResults();

console.log('\nApril result refresh complete');
console.log(`Christie's April lots saved: ${christies.lots} (${christies.sold} sold/resulted)`);
console.log(`Sotheby's April audit: ${sothebys.priced} visible result prices, ${sothebys.hidden} hidden-result lots not saved`);
