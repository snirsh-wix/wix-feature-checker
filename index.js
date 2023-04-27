const puppeteer = require('puppeteer');
const tqdm = require(`tqdm`);

const {hasWixDropdownMenu, hasPlatform, hasPGOnFold} = require("./utils");

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
];
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const usingFeature = []

  for (const url of tqdm(urls)) {
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
    const ddMenu = await page.evaluate(hasPGOnFold)
    if (ddMenu) {
        usingFeature.push(url)
    }
  }
  await browser.close();
  for (const url of urls) {
    console.log(usingFeature.includes(url) ? 'V' : ' ')
  }
})();

