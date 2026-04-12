import https from "https";

const url =
  "https://medialib.qlgd.edu.vn/Uploads/THU_VIEN/shn/1/1917/UserFiles/downloadsachmienphi.com-An-Tu-82a17acf-9b00-4b13-80c6-1be3e1d2340f.pdf";

function fetchBuffer(u: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(u, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location));
      }
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });
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
      if (pageCount === 7) {
        const content = await pageData.getTextContent({ normalizeWhitespace: true });
        for (let i = 0; i < Math.min(20, content.items.length); i++) {
          const item = content.items[i];
          console.log(
            `[${i}] str: '${item.str}', fontHeight: ${item.height}, transform: ${JSON.stringify(item.transform)}`,
          );
        }
      }
      return "";
    },
  });
}
run();
