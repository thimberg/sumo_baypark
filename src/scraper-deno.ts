import { ensureDir } from "https://deno.land/std@0.192.0/fs/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

//const URL = "https://suumo.jp/library/tf_12/sc_12106/to_1000243956/";
const URL = "https://suumo.jp/library/tf_12/sc_12106/to_1000243957/";
const OUTPUT_FILE = "output/mansion_data.json";

async function scrapeMansionData() {
  try {
    // Fetch the HTML content of the page
    const response = await fetch(URL);
    const html = await response.text();

    // Parse the HTML
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Extract all rows from the table
    const rows = doc.querySelectorAll(
      "#cassettearea > div.caseBukken.cFix > table > tbody > tr",
    );
    const data: Record<string, string>[] = [];

    console.log("Found rows:", rows.length);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll("td");

      // デバッグ: 各行のセル数を確認
      console.log(`Row ${i} has ${cells.length} cells`);
      if (cells.length > 0) {
        // Extract data from each cell (adjust indices as needed)
        const layout = cells[1]?.textContent.trim() || "N/A"; // 間取り
        const price = cells[2]?.textContent.trim() || "N/A"; // 価格
        const area = cells[3]?.textContent.trim() || "N/A"; // 専有面積
        const orientation = cells[4]?.textContent.trim() || "N/A"; // 方位

        data.push({
          layout,
          area,
          price,
          orientation,
        });

        // デバッグ: 各行のデータを出力
        console.log(`Row ${i} data:`, { layout, area, price, orientation });
      }
    }

    // Create a data object
    const mansionData = {
      url: URL,
      details: data,
      fetchedAt: new Date().toISOString(),
    };

    // Check if the output file exists
    try {
      const existingData = JSON.parse(await Deno.readTextFile(OUTPUT_FILE));

      // Compare the new data with the existing data (excluding fetchedAt)
      const { fetchedAt: _, ...existingDataWithoutDate } = existingData;
      const { fetchedAt: __, ...newDataWithoutDate } = mansionData;

      if (
        JSON.stringify(existingDataWithoutDate) ===
          JSON.stringify(newDataWithoutDate)
      ) {
        console.log("No changes detected. Skipping update.");
        return;
      }
    } catch {
      // File does not exist or is invalid, proceed with saving new data
    }

    // Ensure output directory exists
    await ensureDir("output");

    // Write data to a JSON file
    await Deno.writeTextFile(
      OUTPUT_FILE,
      JSON.stringify(mansionData, null, 2),
    );
    console.log("Data updated and saved to", OUTPUT_FILE);
  } catch (error) {
    console.error("Error scraping mansion data:", error);
  }
}

// Run the scraper
scrapeMansionData();
