import { ensureDir } from "https://deno.land/std@0.192.0/fs/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const URLS = [
  "https://suumo.jp/library/tf_12/sc_12106/to_1000243957/",
  "https://suumo.jp/library/tf_12/sc_12106/to_1000243956/",
];
const OUTPUT_FILE = `${Deno.cwd()}/output/mansion_data.json`;

async function scrapeMansionData() {
  try {
    // Load existing data if available
    let existingData: { [url: string]: { details: Record<string, string>[] } } = {};
    try {
      existingData = JSON.parse(await Deno.readTextFile(OUTPUT_FILE));
    } catch {
      console.log("No existing data found. Starting fresh.");
    }

    // Ensure output directory exists
    await ensureDir("output");

    // Initialize updated data
    const updatedData: { [url: string]: { details: Record<string, string>[] } } = { ...existingData };

    // Process each URL
    for (const URL of URLS) {
      console.log(`Processing URL: ${URL}`);

      // Fetch the HTML content of the page
      const response = await fetch(URL);
      const html = await response.text();

      // Parse the HTML
      const doc = new DOMParser().parseFromString(html, "text/html");
      if (!doc) {
        console.error(`Failed to parse HTML for URL: ${URL}`);
        continue;
      }

      // Select all rows in the table
      const rows = doc.querySelectorAll(
        "#cassettearea > div.caseBukken.cFix > table > tbody > tr",
      );

      console.log(`Found rows for URL ${URL}:`, rows.length);

      const newData: Record<string, string>[] = [];

      // Skip the first row (title row) and process the rest
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");

        // デバッグ: 各行のセル数を確認
        //console.log(`Row ${i} has ${cells.length} cells`);
        if (cells.length > 0) {
          // Extract data from each cell (adjust indices as needed)
          const layout = cells[0]?.textContent.trim() || "N/A"; // 間取り
          const area = cells[1]?.textContent.trim() || "N/A"; // 専有面積
          const area = cells[3]?.textContent.trim() || "N/A"; // 専有面積
          const orientation = cells[4]?.textContent.trim() || "N/A"; // 方位


      if (cells.length > 0) {
        // Extract data from each cell (adjust indices as needed)
        const layout = cells[1]?.textContent.trim() || "N/A"; // 間取り
        const price = cells[2]?.textContent.trim() || "N/A"; // 価格
        const area = cells[3]?.textContent.trim() || "N/A"; // 専有面積
        const orientation = cells[4]?.textContent.trim() || "N/A"; // 方位

          newData.push({
            layout,
            area,
            price,
            orientation,
          });
        }
      }

      // デバッグ: 各行のデータを出力
      //console.log(`Row ${i} data:`, { layout, area, price, orientation });
      
      // Compare each new entry with existing data for the current URL
      const existingEntries = existingData[URL]?.details || [];
      const updatedEntries = [...existingEntries];
        
      for (const newEntry of newData) {
        const isDuplicate = existingEntries.some(
          (existingEntry) =>
            existingEntry.layout === newEntry.layout &&
            existingEntry.area === newEntry.area &&
            existingEntry.price === newEntry.price &&
            existingEntry.orientation === newEntry.orientation,
        );

        if (!isDuplicate) {
          // Add fetchedAt to new entries
          updatedEntries.push({
            ...newEntry,
            fetchedAt: new Date().toISOString(),
          });
          console.log("New entry added:", newEntry);
        } else {
          console.log("Duplicate entry skipped:", newEntry);
        }
      }
      // Update data for the current URL
      updatedData[URL] = { details: updatedEntries };
    }

    // Write data to a JSON file
    await Deno.writeTextFile(
      OUTPUT_FILE,
      JSON.stringify(updatedData, null, 2),
    );
    console.log("Data updated and saved to", OUTPUT_FILE);
  } catch (error) {
    console.error("Error scraping mansion data:", error);
  }
}

// Run the scraper
scrapeMansionData();
