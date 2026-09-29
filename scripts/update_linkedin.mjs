import { chromium } from 'playwright';

// Helper script to launch an interactive browser for LinkedIn profile updating
async function main() {
    console.log('🚀 Launching Chromium browser with Playwright...');
    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: null
    });

    const page = await context.newPage();

    console.log('Navigating to your LinkedIn profile: https://www.linkedin.com/in/john-carlo-cacao-1579762ba/');
    await page.goto('https://www.linkedin.com/in/john-carlo-cacao-1579762ba/');

    console.log('\n======================================================');
    console.log('💡 INSTRUCTIONS:');
    console.log('1. Log into your LinkedIn account in the open browser window.');
    console.log('2. Copy and paste the updated sections from the LinkedIn Profile Guide.');
    console.log('3. When finished, press Ctrl+C in this terminal to close.');
    console.log('======================================================\n');
}

main().catch(err => {
    console.error('Error:', err);
});
