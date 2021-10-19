const tickerHandlers = new Map();
// ticker: {
//   updateHandlers: [],
//   errorHandlers: []
// }

const AGGREGATE_INDEX_TYPE = `5`;
const INVALID_SUB = `500`;

const worker = new SharedWorker(`worker.js`).port;
worker.start();

worker.addEventListener(`message`, (event) => {
  const { type, ticker, price, parameter } = event.data;

  if (type !== AGGREGATE_INDEX_TYPE || price === undefined) {
    // #21 Криптономикон: улучшаем API - Vue.js: практика
    // при ошибке будут запускаться слушатели ошибок
    if (type === INVALID_SUB && parameter) {
      const erroredTicket = parameter.split(`~`)[2];
      const errorHandlers = tickerHandlers.get(erroredTicket)?.errorHandlers;
      errorHandlers?.forEach((fn) => fn());
    }

    return;
  }

  const updateHandlers = tickerHandlers.get(ticker).updateHandlers;
  updateHandlers.forEach((fn) => fn(price));
});

const subscribeToTickerOnWs = (ticker) => {
  worker.postMessage({
    type: `SUBSCRIBE`,
    payload: { ticker },
  });
};

const unsubscribeToTickerOnWs = (ticker) => {
  worker.postMessage({
    type: `UNSUBSCRIBE`,
    payload: { ticker },
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

  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickerHandlers.delete(ticker);
  unsubscribeToTickerOnWs(ticker);
};

// START #15 Криптономикон-4 - Самостоятельная работа (валидации)
export const loadDictionary = () =>
  fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true`)
    .then((response) => response.json())
    .then((json) => json.Data);
// END #15 Криптономикон-4 - Самостоятельная работа (валидации)
