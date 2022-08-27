const YelpScraper = require("./yelp-scraper.js");
const YelpParser = require("./yelp-parser.js");
const fs = require("fs");
const zip = require("./zip.json");
const axios = require("axios");
const axiosRetry = require("axios-retry");
const url =
  "https://www.yelp.com/search?find_desc=Restaurants&find_loc=90003&start=0";

const main = async () => {
  try {
    const yelpScraper = new YelpScraper();
    const yelpParser = new YelpParser();

    // const firstPageListingHTML = await yelpScraper.scrape(url);
    // const numberOfPages = yelpParser.getPagesAmount(firstPageListingHTML);

    var scrapedData = [];
    for (let j = 0; j < zip.length; j++) {
      axiosRetry(axios, { retries: 5 });
      const firstPageListingHTML = await axios
        .get(
          `https://www.yelp.com/search?find_desc=Restaurants&find_loc=${zip[j]}&start=0`
        )
        .then((result) => {
          return result; // 'ok'
        });
      console.log();
      const numberOfPages = yelpParser.getPagesAmount(
        firstPageListingHTML.data
      );
      for (let i = 0; i < numberOfPages; i++) {
        const link = `https://www.yelp.com/search?find_desc=Restaurants&find_loc=${
          zip[j]
        }&start=${i * 10}`;
        console.log(link);
        const listingPage = await axios.get(link).then((result) => {
          return result; // 'ok'
        });
        const businessesLinks = yelpParser.getBusinessLinks(listingPage.data);
        businessesLinks.push(`paginationPage:${link}`);
        scrapedData.push(businessesLinks);
        let data = JSON.stringify(scrapedData);

        // write JSON string to a file
        fs.writeFile("user.json", data, (err) => {
          if (err) {
            throw err;
          }
          console.log("JSON data is saved.");
        });
        // for (let k = 0; k < businessesLinks.length; k++) {
        //   const businessesLink = businessesLinks[k];
        //   console.log(`https://www.yelp.com${businessesLink}`);
        //   const businessPageHtml = await yelpScraper.scrape(
        //     `https://www.yelp.com${businessesLink}`
        //   );

        //   const extractedInformation = yelpParser.extractBusinessInformation(
        //     businessPageHtml,
        //     businessesLink
        //   );

        // }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

main();
