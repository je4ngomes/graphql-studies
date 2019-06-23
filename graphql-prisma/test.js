const cheerio = require('cheerio');
const rp = require('request-promise');

const defaultOptions = {
    transform: function (body) {
        return cheerio.load(body);
    }
};

const getPrice = (query) => 
    rp({ uri: `http://www.bing.com/search?q=${query}`, ...defaultOptions })
        .then(htmlLoaded => htmlLoaded('#getPrice').getText())
        .catch(error => console.error(error));


app.get('/', (req, res) => {
    getPrice(req.body.name)
        .then(price => {
            render(price);
        });
});