/**
 * Convert Parquet Dictionary to JSON
 * Uses hyparquet for zero-dependency conversion.
 */

import { readFileSync, writeFileSync } from 'fs';
import { parquetRead } from 'hyparquet';

const PARQUET_PATH = 'data/rac-dict.parquet';
const JSON_OUTPUT = 'data/rac-dictionary.json';

async function main() {
    console.log('📄 Converting Parquet to JSON...');

    try {
        const buffer = readFileSync(PARQUET_PATH);
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

        let rowCount = 0;
        const allRows = [];

        await parquetRead({
            file: arrayBuffer,
            onComplete: (rows) => {
                rowCount = rows.length;
                console.log(`✅ Read ${rowCount} rows.`);

                // Map columns based on metadata: word, pos, pro, definition, example
                // hyparquet returns rows as arrays: [word, pos, pro, definition, example]
                for (const row of rows) {
                    allRows.push({
                        w: row[0] || '',
                        p: row[1] || '',
                        i: row[2] || '', // pro -> ipa
                        d: row[3] || '',
                        e: row[4] || ''
                    });
                }
            }
        });

        const filtered = allRows.filter(r => r.w.trim());
        const uniqueWords = new Set(filtered.map(r => r.w.trim()));

        console.log(`📊 Statistics:`);
        console.log(`   - Raw rows: ${rowCount}`);
        console.log(`   - Valid words: ${filtered.length}`);
        console.log(`   - Unique words: ${uniqueWords.size}`);

        writeFileSync(JSON_OUTPUT, JSON.stringify(filtered), 'utf-8');
        console.log(`\n✨ Successfully updated ${JSON_OUTPUT}`);

    } catch (err) {
        console.error('❌ Conversion failed:', err.message);
        process.exit(1);
    }
}

main();
