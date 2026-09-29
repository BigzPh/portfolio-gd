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

    console.log('\n======================================================');
    console.log('📋 PROFILE DETAILS TO UPDATE:');
    console.log('------------------------------------------------------');
    console.log('1. HEADLINE:');
    console.log(PROFILE_DATA.headline);
    console.log('\n2. ABOUT SECTION:');
    console.log(PROFILE_DATA.about);
    console.log('\n3. EXPERIENCE (PawnHero):');
    console.log(`Role: ${PROFILE_DATA.experience.role}`);
    console.log(`Company: ${PROFILE_DATA.experience.company}`);
    console.log(`Dates: ${PROFILE_DATA.experience.startDate} – Present`);
    console.log('Description:\n' + PROFILE_DATA.experience.description);
    console.log('======================================================\n');
    console.log('💡 TIP: If you see the login screen, log in in the opened browser window.');
    console.log('Your session and login cookies will be saved in your persistent profile permanently.');
    console.log('Keep this script running while you review or update your profile.\n');

    // Wait until browser is closed
    await new Promise(resolve => context.on('close', resolve));
}

main().catch(err => {
    console.error('Error:', err);
});

