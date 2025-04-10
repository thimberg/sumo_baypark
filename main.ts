#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";
import { exists } from "std/fs/mod.ts";

import type { Word } from "./types.ts";
import { createArchive, createReadme, mergeWords } from "./utils.ts";

const regexp = #cassettearea > div:nth-child(3) > table > tr;

const response = await fetch("https://suumo.jp/library/tf_12/sc_12106/to_1000243956/");

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}

const result: string = await response.text();

const matches = result.matchAll(regexp);

const words: Word[] = Array.from(matches).map((x) => ({
  url: x[1],
  title: x[2],
}));

const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
const yyyy = format(new Date(), "yyyy");
const fullPath = join("raw", `${yyyyMMdd}.json`);

// let wordsAlreadyDownload: Word[] = [];
// if (await exists(fullPath)) {
//   const content = await Deno.readTextFile(fullPath);
//   wordsAlreadyDownload = JSON.parse(content);
// }

// // 保存原始数据
// const queswordsAll = mergeWords(words, wordsAlreadyDownload);
// await Deno.writeTextFile(fullPath, JSON.stringify(queswordsAll));

// // 更新 README.md
// const readme = await createReadme(queswordsAll);
// await Deno.writeTextFile("./README.md", readme);

// // 更新 archives
// const archiveText = createArchive(queswordsAll, yyyyMMdd);
// const archivePath = "archives/" + `${yyyy}` + "/" + `${yyyyMMdd}.md`;
// await Deno.writeTextFile(archivePath, archiveText);
