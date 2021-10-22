const tickerHandlers = new Map();
// ticker: {
//   updateHandlers: [],
//   errorHandlers: []
// }

const AGGREGATE_INDEX_TYPE = `5`;
const INVALID_SUB = `INVALID_SUB`;
const TOO_MANY_SOCKETS = `TOO_MANY_SOCKETS_MAX_1_PER_CLIENT`;

const BTC = {
  NAME: `BTC`,
  price: `-`,
  loaded: false,
};

const USD = `USD`;

const crossConverted = new Map();

const worker = new SharedWorker(`worker.js`).port;
worker.start();

const tickerFromString = (str) => {
  const splitedString = str.split(`~`);

  return {
    name: splitedString[2],
    currency: splitedString[3],
  };
};

worker.addEventListener(`message`, (event) => {
  const { type, ticker, price, parameter, message } = event.data;

  if (message === TOO_MANY_SOCKETS) {
    const errorHandler = tickerHandlers.entries().next().value[1]
      .errorHandlers[0];
    errorHandler(
      `У вас уже открыто приложение в другом браузере или анонимной вкладке!`
    );
    return;
  }

  // #21 Криптономикон: улучшаем API - Vue.js: практика
  // при ошибке будут запускаться слушатели ошибок
  if (message === INVALID_SUB) {
    const erroredTicket = tickerFromString(parameter);

    if (erroredTicket.currency !== USD) {
      const errorHandlers = tickerHandlers.get(
        erroredTicket.name
      )?.errorHandlers;
      errorHandlers?.forEach((fn) => fn());
    } else {
      crossConverted.set(erroredTicket.name, true);
      subscribeToTickerOnWs(erroredTicket.name, BTC.NAME);
      BTC.loaded || subscribeToTickerOnWs(BTC.NAME, erroredTicket.currency);
    }
  }

  if (type !== AGGREGATE_INDEX_TYPE || price === undefined) return;

  if (ticker.name === BTC.NAME) {
    if (!BTC.loaded) BTC.loaded = true;

    BTC.price = price;
  }

  let newPrice = price;

  if (ticker.currency === BTC.NAME) {
    newPrice = BTC.loaded ? price * BTC.price : BTC.price;
  }

  const updateHandlers = tickerHandlers.get(ticker.name)?.updateHandlers;
  updateHandlers?.forEach((fn) => fn(newPrice));
});

const subscribeToTickerOnWs = (ticker, currency) => {
  worker.postMessage({
    type: `SUBSCRIBE`,
    payload: { name: ticker, currency },
  });
};

const unsubscribeToTickerOnWs = (ticker, currency) => {
  worker.postMessage({
    type: `UNSUBSCRIBE`,
    payload: { name: ticker, currency },
  });
};

export const subscribeToTicker = (ticker, onUpdate, onError = null) => {
  // #21 Криптономикон: улучшаем API - Vue.js: практика
  // Переписал логику так, что есть возможность подписываться на ошибки отдельно, не ломая старый интерфейс
  const isSubscribedTicker = tickerHandlers.has(ticker);

  const subscribers = tickerHandlers.get(ticker) || {
    updateHandlers: [],
    errorHandlers: [],
  };

  tickerHandlers.set(ticker, {
    updateHandlers: [...subscribers.updateHandlers, onUpdate],
    errorHandlers: onError
      ? [...subscribers.errorHandlers, onError]
      : subscribers.errorHandlers,
  });

  if (isSubscribedTicker) return;

  subscribeToTickerOnWs(ticker, USD);
};

export const unsubscribeFromTicker = (ticker) => {
  tickerHandlers.delete(ticker);

  if (crossConverted.has(ticker)) {
    crossConverted.delete(ticker);
    unsubscribeToTickerOnWs(ticker, BTC.NAME);

    if (!tickerHandlers.has(BTC.NAME) && !crossConverted.size) {
      unsubscribeToTickerOnWs(BTC.NAME, USD);
    }

    return;
  }

  if (ticker === BTC.NAME && crossConverted.size) return;

  unsubscribeToTickerOnWs(ticker, USD);
};

// START #15 Криптономикон-4 - Самостоятельная работа (валидации)
export const loadDictionary = () =>
  fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true`)
    .then((response) => response.json())
    .then((json) => json.Data);
// END #15 Криптономикон-4 - Самостоятельная работа (валидации)
