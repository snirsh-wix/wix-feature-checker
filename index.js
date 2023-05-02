const puppeteer = require('puppeteer');

const { hasRepeater } = require("./utils");

const urls = [
  "https://www.wix.com/demone2/five-28",
  "https://www.wix.com/demone2/elis-braxton",
  "https://www.wix.com/demone2/talisa-kidd",
  "https://www.wix.com/demone2/tommy-laredo",
  "https://www.wix.com/demone2/ame-weddings",
  "https://www.wix.com/demone2/nina-adams",
  "https://www.wix.com/demone2/raw-agency",
  "https://www.wix.com/demone2/spazio",
  "https://www.wix.com/demone2/robert-montado",
  "https://www.wix.com/demone2/culinary-consultant",
  "https://www.wix.com/demone2/catapult",
  "https://www.wix.com/demone2/elena-su",
  "https://www.wix.com/demone2/jean-le",
  "https://www.wix.com/demone2/barbaro-brand-studio",
  "https://www.wix.com/demone2/hellomate",
  "https://www.wix.com/demone2/sparke",
  "https://www.wix.com/demone2/sweet-harmony",
  "https://www.wix.com/demone2/yonder",
  "https://www.wix.com/demone2/sandstorm-studios",
  "https://www.wix.com/demone2/richmond-co",
  "https://www.wix.com/demone2/simply",
  "https://www.wix.com/demone2/synthy",
  "https://www.wix.com/demone2/volt-studio",
  "https://www.wix.com/demone2/my-stolen-t-shirt",
  "https://www.wix.com/demone2/scientia",
  "https://www.wix.com/demone2/bookings",
  "https://www.wix.com/demone2/enigma-vulture",
  "https://www.wix.com/demone2/je-suis-pare",
  "https://www.wix.com/demone2/nomads-and-places",
  "https://www.wix.com/demone2/highlite",
  "https://www.wix.com/demone2/saas-company",
  "https://www.wix.com/demone2/yogpulse",
  "https://www.wix.com/demone2/gaming-startup",
  "https://www.wix.com/demone2/pwr-product-landi",
  "https://www.wix.com/demone2/sole-mgmt",
  "https://www.wix.com/demone2/panoramix",
  "https://www.wix.com/demone2/codyx",
  "https://www.wix.com/demone2/alloy-beauty",
  "https://www.wix.com/demone2/feuille",
  "https://www.wix.com/demone2/recent",
  "https://www.wix.com/demone2/walker-construction",
  "https://www.wix.com/demone2/peca",
  "https://www.wix.com/demone2/mollard",
  "https://www.wix.com/demone2/fro-moi"
];

const displayProgressBar = (completed, total) => {
    const percentage = Math.round((completed / total) * 100);
    const progressBar = Array(percentage).fill('█').join('');
    const emptyBar = Array(100 - percentage).fill('░').join('');
    process.stdout.write(`\r[${progressBar}${emptyBar}] ${percentage}%`);
    if (completed === total)
      process.stdout.write('\n')
}

(async () => {
  const browser = await puppeteer.launch();
  const maxConcurrency = 20; // Adjust this value based on your system's capabilities

  const processUrl = async (url) => {
    const page = await browser.newPage();
    await page.goto(`${url}?debug`);
    await page.waitForFunction(() => typeof window.debugApi !== 'undefined');
    const successSelector = '#renderIndicator > span > span > span:nth-child(1)';
    await page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector);
          return element && element.textContent.includes('Success');
        },
        {},
        successSelector
    );

    // !!REPLACE WITH YOUR OWN FEATURE CHECKER FUNCTION!!
    const containsFeature = await page.evaluate(hasRepeater);
    await page.close();
    return { url, containsFeature };
  };

  const processUrlsInChunks = async (urls) => {
    const results = [];
    let completed = 0
    const total = urls.length
    while (urls.length > 0) {
      const chunk = urls.splice(0, maxConcurrency);
      const promises = chunk.map((url) => processUrl(url));
      const wrappedPromises = promises.map((promise) => promise.then((value) => {
          completed++
          displayProgressBar(completed, total)
          return value
        })
      )

      const chunkResults = await Promise.all(wrappedPromises);
      results.push(...chunkResults);
    }
    return results;
  };

  const featureResults = await processUrlsInChunks(urls);
  await browser.close();

  console.log("Using feature:");
  for (const result of featureResults) {
    console.log(result.containsFeature ? 'V' : '\t');
  }
})();
