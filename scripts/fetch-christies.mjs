// Christie's 실제 데이터 fetch 스크립트
const SALES = [
  { saleid: '30991', salenumber: '24180', name: '20th/21st Century: London Evening Sale', date: '2026-03-05', city: 'London' },
  { saleid: '30992', salenumber: '24181', name: 'The Art of the Surreal Evening Sale', date: '2026-03-05', city: 'London' },
  { saleid: '31311', salenumber: '24750', name: 'Modern Visionaries - Evening Sale', date: '2026-03-05', city: 'London' },
  { saleid: '30994', salenumber: '24183', name: 'Impressionist & Modern Art Day Sale', date: '2026-03-06', city: 'London' },
  { saleid: '31312', salenumber: '24751', name: 'Modern Visionaries - Day Sale', date: '2026-03-06', city: 'London' },
  { saleid: '30993', salenumber: '24182', name: 'Post-War & Contemporary Art Day Sale', date: '2026-03-07', city: 'London' },
  { saleid: '30937', salenumber: '23970', name: 'Spellbound: The Hegewisch Collection', date: '2026-03-07', city: 'London' },
];

function parseArtist(titlePrimary) {
  const m = titlePrimary?.match(/^(.+?)\s*\((\d{4})[-–]?(\d{4})?\)$/);
  if (m) return { name: toTitleCase(m[1].trim()), birthYear: parseInt(m[2]), deathYear: m[3] ? parseInt(m[3]) : undefined };
  return { name: toTitleCase((titlePrimary || 'Unknown').trim()), birthYear: 1950, deathYear: undefined };
}

function toTitleCase(str) {
  return str.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
}

function parseMedium(desc) {
  const d = (desc || '').replace(/<[^>]+>/g, ' ').toLowerCase();
  if (/oil on (canvas|board|panel|linen)/.test(d)) return 'Painting';
  if (/acrylic|tempera/.test(d)) return 'Painting';
  if (/watercolour|watercolor|gouache|pastel/.test(d)) return 'Works on Paper';
  if (/charcoal|chalk|pencil|ink|crayon/.test(d)) return 'Works on Paper';
  if (/print|lithograph|etching|screenprint|silkscreen/.test(d)) return 'Prints';
  if (/bronze|marble|ceramic|terracotta|plaster/.test(d)) return 'Sculpture';
  if (/photograph/.test(d)) return 'Photography';
  if (/mixed media|collage/.test(d)) return 'Mixed Media';
  return 'Painting';
}

function parseYear(desc, birthYear) {
  const d = (desc || '').replace(/<[^>]+>/g, ' ');
  const patterns = [
    /[Pp]ainted?\s+(?:in\s+)?(\d{4})/,
    /[Ee]xecuted?\s+(?:in\s+|circa\s+|c\.\s*)?(\d{4})/,
    /[Cc]omposed?\s+(?:in\s+)?(\d{4})/,
    /\b((?:19|20)\d{2})\b/,
  ];
  for (const p of patterns) {
    const m = d.match(p);
    if (m) { const y = parseInt(m[1]); if (y >= 1850 && y <= 2025) return y; }
  }
  return Math.min(birthYear + 30, 2020);
}

function parseDimensions(desc) {
  const d = (desc || '').replace(/<[^>]+>/g, ' ');
  const m = d.match(/(\d+(?:[.,]\d+)?)\s*[×xX]\s*(\d+(?:[.,]\d+)?)\s*cm/);
  if (m) return `${m[1]} × ${m[2]} cm`;
  return undefined;
}

function inferCategory(name) {
  const n = name.toLowerCase();
  if (/monet|renoir|pissarro|sisley|degas|manet/.test(n)) return 'Impressionist';
  if (/picasso|braque|matisse|léger|leger|delaunay|miro|mirò/.test(n)) return 'Modern';
  if (/giacometti|ernst|magritte|dalí|dali|duchamp/.test(n)) return 'Modern';
  if (/warhol|lichtenstein|hockney|basquiat|richter/.test(n)) return 'Contemporary';
  if (/banksy/.test(n)) return 'Street Art';
  return 'Contemporary';
}

async function fetchSaleLots(sale) {
  const url = `https://www.christies.com/api/discoverywebsite/auctionpages/lotsearch?language=en&pagesize=120&geocountrycode=US&saleid=${sale.saleid}&salenumber=${sale.salenumber}&saleroomcode=CKS&page=1&sortby=lot_number_asc&saletype=Sale`;
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = await r.json();
  return d.lots || [];
}

const artistMap = {};
const saleEvents = [];
const allLots = [];

for (const sale of SALES) {
  process.stdout.write(`Fetching sale ${sale.salenumber} (${sale.name})... `);
  try {
    const lots = await fetchSaleLots(sale);
    console.log(`${lots.length} lots`);
    const saleId = `s${SALES.indexOf(sale) + 1}`;
    saleEvents.push({ id: saleId, auctionHouseId: 'christies', name: sale.name, city: sale.city, date: sale.date, category: 'Contemporary' });

    for (const lot of lots) {
      const estLow = parseFloat(lot.estimate_low || '0');
      const estHigh = parseFloat(lot.estimate_high || '0');
      if (!estLow && !estHigh) continue;

      const artistInfo = parseArtist(lot.title_primary_txt);
      const key = artistInfo.name.toLowerCase();
      if (!artistMap[key]) {
        artistMap[key] = {
          id: `a${Object.keys(artistMap).length + 1}`,
          name: artistInfo.name,
          nationality: '',
          birthYear: artistInfo.birthYear,
          deathYear: artistInfo.deathYear,
          category: inferCategory(artistInfo.name),
        };
      }

      const lotSeq = allLots.length + 1;
      const lotId = `lot-${lotSeq}`;
      const realised = parseFloat(lot.price_realised || '0');
      const sold = realised > 0;

      allLots.push({
        id: lotId,
        saleEventId: saleId,
        auctionHouseId: 'christies',
        artistId: artistMap[key].id,
        lotNumber: parseInt(lot.lot_id_txt) || lotSeq,
        title: (lot.title_secondary_txt || 'Untitled').substring(0, 80),
        medium: parseMedium(lot.description_txt),
        year: parseYear(lot.description_txt, artistInfo.birthYear),
        dimensions: parseDimensions(lot.description_txt),
        estimateLow: estLow,
        estimateHigh: estHigh,
        currency: 'GBP',
        lotUrl: lot.url || `https://www.christies.com/en/lot/lot-${lot.object_id}`,
        result: {
          id: `res-${lotSeq}`,
          lotId,
          hammerPrice: sold ? Math.round(realised / 1.26) : null,
          premiumPrice: sold ? realised : null,
          currency: 'GBP',
          usdEquivalent: sold ? Math.round(realised * 1.27) : null,
          sold,
          saleDate: sale.date,
        }
      });
    }
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
  }
}

const artists = Object.values(artistMap);
const output = { artists, saleEvents, lots: allLots };

import { writeFileSync } from 'fs';
writeFileSync('./src/lib/christies-data.json', JSON.stringify(output, null, 2));
console.log(`\n✓ Saved christies-data.json`);
console.log(`  Artists: ${artists.length}`);
console.log(`  Sales:   ${saleEvents.length}`);
console.log(`  Lots:    ${allLots.length} (sold: ${allLots.filter(l => l.result.sold).length})`);
