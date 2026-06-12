const axios = require('axios');

async function test(name) {
  const slug = name.replace(/\s+/g, '_');
  console.log(`\nTest: "${name}" → slug: "${slug}"`);

  try {
    const r = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        titles: slug,
        prop: 'revisions',
        rvprop: 'content',
        rvslots: 'main',
        format: 'json',
        redirects: 1
      },
      timeout: 12000,
      headers: { 'User-Agent': 'Foot-Doku/1.0' }
    });

    const pages = r.data.query.pages;
    const page  = Object.values(pages)[0];
    console.log('  pageid:', page.pageid);
    console.log('  title:', page.title);

    if (page.pageid === -1) {
      console.log('  → PAGE INEXISTANTE');
      return;
    }

    const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
    console.log('  wikitext length:', wikitext.length);

    // Cherche les clubs
    const clubMatches = [...wikitext.matchAll(/\|\s*clubs(\d+)\s*=\s*([^\n|]+)/g)];
    console.log('  clubs trouvés:', clubMatches.length);
    clubMatches.slice(0, 5).forEach(m => console.log('   ', m[0].trim()));

  } catch (e) {
    console.log('  ERREUR:', e.message);
  }
}

async function main() {
  await test("N'Golo Kanté");
  await test("Achraf Hakimi");
  await test("Marcus Holmgren Pedersen");
}

main();
