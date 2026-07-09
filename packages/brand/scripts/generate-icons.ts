import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Icns, IcnsImage } from "@fiahfy/icns";
import { Resvg } from "@resvg/resvg-js";
import PngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];

function getPngBuffer(pngBuffers: Map<number, Buffer>, size: number): Buffer {
  const buffer = pngBuffers.get(size);
  if (!buffer) {
    throw new Error(`PNG buffer for ${size}px was not generated.`);
  }
  return buffer;
}

async function main() {
  // 解析输出目录参数（--out <dir>）
  const args = process.argv.slice(2);
  const outFlagIndex = args.indexOf("--out");
  const defaultOut = resolve(__dirname, "../../desktop/build");
  const outputDir =
    outFlagIndex !== -1 && args[outFlagIndex + 1]
      ? resolve(process.cwd(), args[outFlagIndex + 1])
      : defaultOut;

  console.log(`[generate-icons] Output directory: ${outputDir}`);

  // 读取 SVG 源文件
  const svgPath = resolve(__dirname, "../assets/app-icon.svg");
  const svgBuffer = await readFile(svgPath);

  console.log("[generate-icons] Rasterizing SVG to PNG buffers...");

  // 1. 使用 @resvg/resvg-js 栅格化各尺寸 PNG（全内存）
  const pngBuffers = new Map<number, Buffer>();
  for (const size of SIZES) {
    const resvg = new Resvg(svgBuffer, {
      fitTo: { mode: "width", value: size },
    });
    const rendered = resvg.render();
    const buf = rendered.asPng();
    pngBuffers.set(size, buf);
  }

  console.log("[generate-icons] Generated PNG buffers for sizes:", SIZES);

  // 确保输出目录存在
  await mkdir(outputDir, { recursive: true });

  // 2. icon.png（512×512，Linux）
  const pngPath = join(outputDir, "icon.png");
  await writeFile(pngPath, getPngBuffer(pngBuffers, 512));
  console.log(`[generate-icons] Wrote ${pngPath}`);

  // 3. icon.ico（Windows，16/32/48/64/128/256）
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoBuffers = icoSizes.map((s) => getPngBuffer(pngBuffers, s));
  const icoBuffer = await PngToIco(icoBuffers);
  const icoPath = join(outputDir, "icon.ico");
  await writeFile(icoPath, icoBuffer);
  console.log(`[generate-icons] Wrote ${icoPath}`);

  // 4. icon.icns（macOS）
  const icns = new Icns();
  const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of icnsSizes) {
    const buffer = getPngBuffer(pngBuffers, size);
    const types = Icns.supportedIconTypes.filter((type) => type.size === size);
    for (const { osType } of types) {
      icns.append(IcnsImage.fromPNG(buffer, osType));
    }
  }
  const icnsPath = join(outputDir, "icon.icns");
  await writeFile(icnsPath, icns.data);
  console.log(`[generate-icons] Wrote ${icnsPath}`);

  console.log("[generate-icons] Done. All icons generated successfully.");
}

main().catch((err) => {
  console.error("[generate-icons] Error:", err);
  process.exit(1);
});
