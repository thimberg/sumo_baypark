import axios from "axios";
import * as fs from "fs";
import * as cheerio from "cheerio";

const URL = "https://suumo.jp/library/tf_12/sc_12106/to_1000243956/";
const OUTPUT_FILE = "output/mansion_data.json";

async function scrapeMansionData() {
  try {
    // Fetch the HTML content of the page
    const { data: html } = await axios.get(URL);
    const $ = cheerio.load(html);

    // Extract data (modify selectors as needed)
    const title = $("h1").text().trim();
    const address = $('th:contains("所在地")').next("td").text().trim();
    const price = $('th:contains("価格")').next("td").text().trim();
    const layout = $('th:contains("間取り")').next("td").text().trim();
    const area = $('th:contains("専有面積")').next("td").text().trim();

    // Create a data object
    const mansionData = {
      title,
      address,
      price,
      layout,
      area,
      url: URL,
    };

    // Ensure output directory exists
    fs.mkdirSync("output", { recursive: true });

    // Write data to a JSON file
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(mansionData, null, 2),
      "utf-8",
    );
    console.log("Data saved to", OUTPUT_FILE);
  } catch (error) {
    console.error("Error scraping mansion data:", error);
  }
}

// Run the scraper
scrapeMansionData();
