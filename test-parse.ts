import fs from "fs";
import https from "https";

const url = "https://thuviensach.vn/img/pdf/1478-dien-bien-phu-diem-hen-lich-su-thuviensach.vn.pdf";

function fetchBuffer(u: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(u, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location));
      }
      const chunks: Buffer[] = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function run() {
  const buf = await fetchBuffer(url);
  const mod = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = mod.default ?? mod;
  
  let pageCount = 0;
  await pdfParse(buf, {
    pagerender: async (pageData: any) => {
      pageCount++;
      if (pageCount === 7) { // Chapter 1 starts on page 6 or 7 according to the images
        const content = await pageData.getTextContent({ normalizeWhitespace: false });
        console.log("Raw items length:", content.items.length);
        console.log(content.items.slice(0, 30).map((it:any) => it.str));
      }
      return "";
    }
  });
}
run().catch(console.error);
