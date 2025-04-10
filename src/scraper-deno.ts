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

    // Helper function to find the value for a specific label
    function getValueByLabel(label: string): string {
      const thElements = doc.querySelectorAll("th");
      for (const th of thElements) {
        if (th.textContent.trim() === label) {
          const td = th.nextElementSibling;
          return td?.textContent.trim() || "N/A";
        }
      }
      return "N/A";
    }

    // Extract data
    const title = doc.querySelector("h1")?.textContent.trim() || "N/A";
    const price = getValueByLabel("価格");
    const layout = getValueByLabel("間取り");
    const area = getValueByLabel("専有面積");
    const orientation = getValueByLabel("方位");

    // Create a data object
    const mansionData = {
      title,
      orientation,
      price,
      layout,
      area,
      url: URL,
    };

    // Check if the output file exists
    try {
      const existingData = JSON.parse(await Deno.readTextFile(OUTPUT_FILE));

      // Compare the new data with the existing data
      if (JSON.stringify(existingData) === JSON.stringify(mansionData)) {
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
