import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const PROFILE_DIR = path.join(os.homedir(), '.config', 'playwright-mcp-profile');

const PROFILE_DATA = {
    headline: "Mobile Developer | Computer Science Student | Android & iOS (Flutter, Kotlin, Swift) | Backend Developer Intern @ PawnHero",
    about: `Results-oriented Mobile Developer and Computer Science undergraduate with hands-on experience shipping production-grade applications across Android and iOS, alongside backend service engineering in fintech (PawnHero).

Key Competencies:
• Mobile Engineering: Flutter, Dart, Kotlin, Jetpack Compose, Swift, SwiftUI, MVVM, MVI
• Backend & Cloud: Node.js, Express, Go, REST APIs, SQL, PostgreSQL, Supabase, Firebase
• On-Device ML & Concurrency: Google ML Kit, Gemini API, Kotlin Coroutines, Dart Isolates
• Hardware & Widgets: Native Android & iOS home/lock-screen widgets, background location services

Experience:
• Backend Developer Intern — PawnHero (June 2026 – Present)
  Developing backend services, core financial transaction pipelines, and RESTful API integrations in a high-compliance fintech environment.
• Service Crew — McDonald's (April 2025 – May 2026)

Awards & Honors:
• Champion — Inter-Collegiate Mobile Hackathon 2025
• Finalist — Regional Software Innovation Cup 2025

Portfolio: https://github.com/BigzPh
Contact: johncarlozcacao@gmail.com`,
    experience: {
        company: "PawnHero",
        role: "Backend Developer Intern",
        startDate: "June 2026",
        description: `• Developing backend services, core financial transaction pipelines, and RESTful API integrations in a high-compliance fintech environment.
• Engineering and optimizing relational database operations with SQL to support operational dashboard tooling and high-concurrency requests.
• Collaborating in cross-functional agile sprints, peer code reviews, and system reliability testing to ensure low-latency performance.`
    }
};

async function main() {
    console.log('🚀 Launching Chromium browser with persistent profile...');
    console.log(`📁 Profile directory: ${PROFILE_DIR}`);

    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
        headless: false,
        viewport: null,
        args: ['--start-maximized']
    });

    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    console.log('\nNavigating to your LinkedIn profile: https://www.linkedin.com/in/john-carlo-cacao-1579762ba/');
    await page.goto('https://www.linkedin.com/in/john-carlo-cacao-1579762ba/');

    // Check if redirected to login
    if (page.url().includes('login') || page.url().includes('uas')) {
        console.log('\n🔑 ACTION REQUIRED: Please log into your LinkedIn account in the browser window.');
        console.log('Waiting for login completion...');
        
        // Wait until navigation leaves the login page
        await page.waitForURL(url => !url.href.includes('login') && !url.href.includes('uas') && (url.href.includes('/in/') || url.href.includes('/feed/')), {
            timeout: 180000
        });
        console.log('✅ Login detected!');
        await page.waitForTimeout(3000);
    }

    // Step 1: Update Headline / Intro
    console.log('\n⏳ Navigating to Edit Intro form...');
    await page.goto('https://www.linkedin.com/in/john-carlo-cacao-1579762ba/edit/forms/intro/detail/');
    await page.waitForLoadState('domcontentloaded');

    try {
        console.log('Looking for Headline field...');
        const headlineField = page.locator('input[id*="headline"], textarea[id*="headline"], input[name="headline"], textarea[name="headline"], [aria-label*="Headline" i]').first();
        await headlineField.waitFor({ timeout: 10000 });
        
        await headlineField.click();
        await headlineField.fill(PROFILE_DATA.headline);
        console.log('✅ Headline entered!');

        const saveButton = page.locator('button:has-text("Save"), footer button.artdeco-button--primary, button[data-view-name*="save"]').first();
        if (await saveButton.isVisible()) {
            await saveButton.click();
            console.log('✅ Intro changes saved!');
            await page.waitForTimeout(3000);
        }
    } catch (e) {
        console.log('⚠️ Could not auto-fill intro form:', e.message);
    }

    // Step 2: Update About / Summary
    console.log('\n⏳ Navigating to Edit About form...');
    await page.goto('https://www.linkedin.com/in/john-carlo-cacao-1579762ba/edit/forms/summary/detail/');
    await page.waitForLoadState('domcontentloaded');

    try {
        console.log('Looking for About / Summary field...');
        const summaryField = page.locator('textarea[id*="summary"], textarea[name="summary"], textarea[aria-label*="Summary" i], textarea[aria-label*="About" i], textarea').first();
        await summaryField.waitFor({ timeout: 10000 });
        
        await summaryField.click();
        await summaryField.fill(PROFILE_DATA.about);
        console.log('✅ About summary entered!');

        const saveButton = page.locator('button:has-text("Save"), footer button.artdeco-button--primary, button[data-view-name*="save"]').first();
        if (await saveButton.isVisible()) {
            await saveButton.click();
            console.log('✅ About changes saved!');
            await page.waitForTimeout(3000);
        }
    } catch (e) {
        console.log('⚠️ Could not auto-fill about form:', e.message);
    }

    // Step 3: View updated profile
    console.log('\n🎉 Finished! Navigating to updated profile...');
    await page.goto('https://www.linkedin.com/in/john-carlo-cacao-1579762ba/');
    console.log('Review your profile in the open browser.');
    console.log('Closing in 15 seconds...');
    await page.waitForTimeout(15000);
    await context.close();
}

main().catch(err => {
    console.error('Error:', err);
});

