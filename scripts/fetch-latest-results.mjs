import { readFileSync, writeFileSync } from 'fs';

const CHRISTIES_SALES = [
  {
    key: 'jun-live',
    name: 'Post-War to Present',
    date: '2026-06-25',
    city: 'London',
    category: 'Contemporary',
    currency: 'GBP',
    url: 'https://www.christies.com/en/auction/post-war-to-present-24440-cks/',
  },
  {
    key: 'jul-online',
    name: 'Post-War to Present: Online',
    date: '2026-07-02',
    city: 'London',
    category: 'Contemporary',
    currency: 'GBP',
    url: 'https://www.christies.com/en/auction/post-war-to-present-online-24577-cks/',
  },
];

const SOTHEBYS_SALES = [
  {
    name: 'Masterpieces from the Lewis Collection',
    url: 'https://www.sothebys.com/en/buy/auction/2026/masterpieces-from-the-lewis-collection-l26900?lotFilter=AllLots',
  },
  {
    name: 'Modern & Contemporary Evening Auction',
    url: 'https://www.sothebys.com/en/buy/auction/2026/modern-contemporary-evening-auction-l26006?lotFilter=AllLots',
  },
  {
    name: 'Contemporary Day Auction',
    url: 'https://www.sothebys.com/en/buy/auction/2026/contemporary-day-auction-l26017?lotFilter=AllLots',
  },
  {
    name: 'Modern Day Auction including Masterpieces from the Lewis Collection',
    url: 'https://www.sothebys.com/en/buy/auction/2026/modern-day-auction-l26007?lotFilter=AllLots',
  },
];

const DATASET_PREFIX = 'chr-summer-2026-';
const FX_TO_USD = { EUR: 1.08, GBP: 1.27, USD: 1, HKD: 0.128 };
const HEADERS = {
  Accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function stripHtml(value) {
  return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
  const cleaned = stripHtml(titlePrimary || 'Unknown Artist');
  const match = cleaned.match(/^(.+?)\s*\((?:B\.\s*)?(\d{4})(?:\s*[-–]\s*(\d{4}))?\)$/i);
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
  if (/bronze|marble|ceramic|terracotta|plaster|sculpture|steel|wood|aluminum|aluminium/.test(text)) return 'Sculpture';
  if (/photograph|gelatin silver|chromogenic|c-print|inkjet/.test(text)) return 'Photography';
  if (/print|lithograph|etching|screenprint|silkscreen|woodcut|aquatint|monotype/.test(text)) return 'Prints';
  if (/watercolour|watercolor|gouache|pastel|charcoal|chalk|pencil|ink|crayon|paper/.test(text)) return 'Works on Paper';
  if (/mixed media|collage|assemblage|installation/.test(text)) return 'Mixed Media';
  return 'Painting';
}

function parseYear(description, birthYear) {
  const text = stripHtml(description);
  const patterns = [
    /\b(?:painted|executed|drawn|conceived|created|made|composed|photographed|printed|cast)\s+(?:in\s+|on\s+|circa\s+|c\.\s*|ca\.\s*)?((?:18|19|20)\d{2})\b/i,
    /\bdated\s+((?:18|19|20)\d{2})\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return birthYear ? Math.min(birthYear + 35, 2026) : null;
}

function parseDimensions(description) {
  const text = stripHtml(description);
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*[×xX]\s*(\d+(?:[.,]\d+)?)\s*cm/);
  return match ? `${match[1]} x ${match[2]} cm` : undefined;
}

function inferCategory(name, fallback = 'Contemporary') {
  const text = (name || '').toLowerCase();
  if (/bonnard|monet|renoir|pissarro|sisley|degas|manet|cezanne|cézanne|boudin/.test(text)) return 'Impressionist';
  if (/picasso|braque|matisse|léger|leger|mir[oó]|giacometti|magritte|dal[ií]|duchamp|kandinsky|mondrian|chagall|picabia|brancusi|modigliani/.test(text)) return 'Modern';
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

function getBrowseUrl(url, page) {
  const base = url.replace(/\/(?:overview|browse-lots)\/?$/i, '').replace(/\/$/, '');
  return `${base}/browse-lots${page > 1 ? `?page=${page}` : ''}`;
}

function extractChristiesLotsComponent(html) {
  const legacy = html.match(/window\.chrComponents\.lots\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (legacy) return JSON.parse(legacy[1]);

  const current = html.match(/window\.chrComponents\s*=\s*(\{[\s\S]*?\});\r?\n<\/script>/);
  if (current) return JSON.parse(current[1]).lots;

  throw new Error('missing Christies lots component');
}

async function fetchChristiesLots(sale) {
  let meta = null;
  let total = 0;
  const lotsById = new Map();

  for (let page = 1; page <= 10; page += 1) {
    const html = await fetchText(getBrowseUrl(sale.url, page));
    const component = extractChristiesLotsComponent(html);
    const lots = component.data?.lots || [];
    total = Number(component.data?.total_hits_filtered || lots.length);
    const params = component.data?.lot_search_api_endpoint?.parameters || {};

    if (!meta) {
      meta = {
        saleId: params.saleid || String(sale.url.match(/-(\d+)(?:-[a-z]+)?\/?$/i)?.[1] || page),
        saleNumber: params.salenumber || '',
        saleRoomCode: params.saleroomcode || '',
      };
    }

    const before = lotsById.size;
    for (const lot of lots) {
      lotsById.set(String(lot.object_id || lot.lot_id_txt), lot);
    }

    if (lotsById.size >= total || lotsById.size === before) break;
  }

  if (!meta || lotsById.size === 0) throw new Error('no lots loaded');
  return { meta, lots: [...lotsById.values()], total };
}

function isChristiesSaleComplete(lots) {
  if (lots.length === 0) return false;
  if (lots.every(lot => lot.is_auction_over)) return true;
  if (lots.every(lot => lot.end_date && new Date(lot.end_date).getTime() < Date.now())) return true;
  return lots.every(lot => Number(lot.price_realised || 0) > 0 || lot.lot_withdrawn);
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
  const saleEventId = `${DATASET_PREFIX}${sale.key}-${meta.saleId}`;
  const lotId = `${saleEventId}-${lotKey}`;
  const sold = realised > 0;
  const usdEquivalent = sold ? Math.round(realised * (FX_TO_USD[sale.currency] || 1)) : null;

  return {
    id: lotId,
    saleEventId,
    auctionHouseId: 'christies',
    artistId,
    lotNumber,
    title: stripHtml(raw.title_secondary_txt || 'Untitled').slice(0, 120),
    medium: parseMedium(raw.description_txt),
    year: parseYear(raw.description_txt, artistInfo.birthYear),
    dimensions: parseDimensions(raw.description_txt),
    estimateLow,
    estimateHigh,
    currency: sale.currency,
    lotUrl: raw.url
      ? new URL(raw.url, 'https://www.christies.com').href
      : `https://www.christies.com/en/lot/lot-${raw.object_id}`,
    imageUrl: raw.image?.image_desktop_src || raw.image?.image_src || undefined,
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

function extractSothebysData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('missing __NEXT_DATA__');
  return JSON.parse(match[1]);
}

function countSothebysResultVisibility(html) {
  const visibleResults = [...html.matchAll(/"sold":\{"__typename":"(?:Sold|Unsold)Result"[\s\S]*?\}/g)].length;
  const hiddenResults = [...html.matchAll(/"sold":\{"__typename":"ResultHidden"/g)].length;
  return { visibleResults, hiddenResults };
}

async function auditSothebysResults() {
  let hidden = 0;
  let visible = 0;
  let failed = 0;

  for (const sale of SOTHEBYS_SALES) {
    process.stdout.write(`Sotheby's audit: ${sale.name}... `);
    try {
      const html = await fetchText(sale.url);
      extractSothebysData(html);
      const resultVisibility = countSothebysResultVisibility(html);
      hidden += resultVisibility.hiddenResults;
      visible += resultVisibility.visibleResults;
      console.log(`${resultVisibility.visibleResults} visible results, ${resultVisibility.hiddenResults} hidden results`);
    } catch (error) {
      failed += 1;
      console.log(`failed (${error.message})`);
    }
  }

  return { hidden, visible, failed };
}

async function updateChristies() {
  const path = './src/lib/christies-data.json';
  const data = readJson(path);
  data.saleEvents = data.saleEvents.filter(event => !String(event.id).startsWith(DATASET_PREFIX));
  data.lots = data.lots.filter(lot => !String(lot.id).startsWith(DATASET_PREFIX));
  const resolveArtist = buildArtistResolver(data, 'a');

  let sequence = data.lots.length + 1;
  const skipped = [];
  let savedSales = 0;

  for (const sale of CHRISTIES_SALES) {
    process.stdout.write(`Christie's: ${sale.name}... `);
    try {
      const { meta, lots, total } = await fetchChristiesLots(sale);
      const complete = isChristiesSaleComplete(lots);

      if (!complete) {
        const sold = lots.filter(lot => Number(lot.price_realised || 0) > 0).length;
        skipped.push({ name: sale.name, lots: total, sold });
        console.log(`skipped incomplete sale (${sold}/${total} result prices visible)`);
        continue;
      }

      data.saleEvents.push({
        id: `${DATASET_PREFIX}${sale.key}-${meta.saleId}`,
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
      savedSales += 1;
      console.log(`${mapped.length} lots, ${mapped.filter(lot => lot.result.sold).length} sold`);
    } catch (error) {
      skipped.push({ name: sale.name, error: error.message });
      console.log(`failed (${error.message})`);
    }
  }

  if (savedSales > 0) {
    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  } else {
    console.log('No current Christies sales saved; existing data file left unchanged');
  }

  return {
    lots: savedSales > 0 ? data.lots.filter(lot => String(lot.id).startsWith(DATASET_PREFIX)).length : 0,
    sold: savedSales > 0 ? data.lots.filter(lot => String(lot.id).startsWith(DATASET_PREFIX) && lot.result.sold).length : 0,
    skipped,
  };
}

const christies = await updateChristies();
const sothebys = await auditSothebysResults();

console.log('\nLatest result refresh complete');
console.log(`Christie's current lots saved: ${christies.lots} (${christies.sold} sold/resulted)`);
for (const skipped of christies.skipped) {
  const reason = skipped.error || `${skipped.sold}/${skipped.lots} result prices visible`;
  console.log(`Christie's skipped: ${skipped.name} (${reason})`);
}
console.log(`Sotheby's current audit: ${sothebys.visible} visible result records, ${sothebys.hidden} hidden-result records, ${sothebys.failed} failed pages`);
