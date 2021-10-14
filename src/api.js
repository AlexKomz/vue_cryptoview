const API_KEY = `9563db33341ed2502231935ffbea554d65356f7b8686b709d10d91580682a0b2`;

const tickerHandlers = new Map();

// TODO: refactor to use URLSearchParams
const loadTickers = () => {
  if (!tickerHandlers.size) return;

  return fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickerHandlers.keys(),
    ].join(`,`)}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickerHandlers.get(currency);
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, callback) => {
  const subscribers = tickerHandlers.get(ticker) || [];
  tickerHandlers.set(ticker, [...subscribers, callback]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickerHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);

// START #15 Криптономикон-4 - Самостоятельная работа (валидации)
export const loadDictionary = () =>
  fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true`)
    .then((response) => response.json())
    .then((json) => json.Data);
// END #15 Криптономикон-4 - Самостоятельная работа (валидации)
