/**
 * Download RAC Khmer Dictionary
 * Downloads directly via HuggingFace first_rows + pagination.
 * Run from backend dir: cd backend && node ../scripts/download-dictionary.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'backend', 'data', 'rac-dictionary.json');
const API = 'https://datasets-server.huggingface.co/rows?dataset=seanghay%2Fkhmer-dictionary-44k&config=default&split=train';

async function fetchPage(offset, length) {
    const resp = await fetch(`${API}&offset=${offset}&length=${length}`, {
        headers: { 'User-Agent': 'KhmerSpellingAssistant/1.0' }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} at offset ${offset}`);
    return resp.json();
}

async function main() {
    console.log('🔄 Downloading RAC Khmer Dictionary...');

    const allRows = [];
    const PAGE = 100;

    // Get first page to learn total
    const first = await fetchPage(0, PAGE);
    const total = first.num_rows_total;
    allRows.push(...first.rows.map(r => r.row));
    console.log(`📚 Total: ${total} entries`);

    // Fetch rest sequentially (safe, no 504s)
    for (let offset = PAGE; offset < total; offset += PAGE) {
        try {
            const data = await fetchPage(offset, PAGE);
            allRows.push(...data.rows.map(r => r.row));
        } catch (err) {
            console.warn(`\n⚠️  Retry at ${offset}: ${err.message}`);
            await new Promise(r => setTimeout(r, 3000));
            const data = await fetchPage(offset, PAGE);
            allRows.push(...data.rows.map(r => r.row));
        }

        if (offset % 2000 === 0) {
            const pct = Math.round(allRows.length / total * 100);
            console.log(`   ${pct}% (${allRows.length}/${total})`);
        }

        await new Promise(r => setTimeout(r, 50));
    }

    const dict = allRows.map(r => ({
        w: r.word || '', d: r.definition || '', p: r.pos || '', i: r.ipa || '', e: r.example || ''
    })).filter(e => e.w.trim());

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(dict), 'utf-8');
    console.log(`\n✅ Done! ${dict.length} entries saved.`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
