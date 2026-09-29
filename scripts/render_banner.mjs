import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function render() {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1584, height: 396 },
        deviceScaleFactor: 2
    });

    const bannerPath = path.resolve(__dirname, '../banner.html');
    await page.goto(`file://${bannerPath}`);
    await page.waitForTimeout(500);

    const outputPath = path.resolve(__dirname, '../linkedin-black-banner.png');
    await page.screenshot({
        path: outputPath,
        type: 'png'
    });

    console.log(`✅ Banner successfully rendered to: ${outputPath}`);
    await browser.close();
}

render().catch(err => {
    console.error(err);
    process.exit(1);
});
