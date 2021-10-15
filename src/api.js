import BTC from "./BTC";

const API_KEY = `9563db33341ed2502231935ffbea554d65356f7b8686b709d10d91580682a0b2`;

const tickerHandlers = new Map();
// ticker: {
//   updateHandlers: [],
//   errorHandlers: []
// }

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = `5`;
const INVALID_SUB = `500`;

socket.addEventListener(`message`, (event) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    TOSYMBOL: into,
    PRICE: price,
    PARAMETER: parameter,
  } = JSON.parse(event.data);

  if (type !== AGGREGATE_INDEX || price === undefined) {
    // #21 Криптономикон: улучшаем API - Vue.js: практика
    // при ошибке будут запускаться слушатели ошибок
    if (type === INVALID_SUB && parameter && currency !== `BTC`) {
      const erroredTicket = parameter.split(`~`)[2];
      const errorHandlers = tickerHandlers.get(erroredTicket)?.errorHandlers;
      errorHandlers?.forEach((fn) => fn());
    }

    return;
  }

  let newPrice = price;

  if (into === `BTC`) {
    const btcPrice = new BTC().price;
    newPrice = Number.isNaN(+btcPrice) ? btcPrice : price * btcPrice;
  }

  const updateHandlers = tickerHandlers.get(currency).updateHandlers;
  updateHandlers.forEach((fn) => fn(newPrice));
});

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    `open`,
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};

const subscribeToTickerOnWs = (ticker, into) => {
  sendToWebSocket({
    action: `SubAdd`,
    subs: [`5~CCCAGG~${ticker}~${into}`],
  });
};

const unsubscribeToTickerOnWs = (ticker, into) => {
  sendToWebSocket({
    action: `SubRemove`,
    subs: [`5~CCCAGG~${ticker}~${into}`],
  });
};

export const subscribeToTicker = (ticker, onUpdate, onError = null) => {
  // #21 Криптономикон: улучшаем API - Vue.js: практика
  // Переписал логику так, что есть возможность подписываться на ошибки отдельно, не ломая старый интерфейс
  const subscribers = tickerHandlers.get(ticker.name) || {
    updateHandlers: [],
    errorHandlers: [],
  };

  tickerHandlers.set(ticker.name, {
    updateHandlers: [...subscribers.updateHandlers, onUpdate],
    errorHandlers: onError
      ? [...subscribers.errorHandlers, onError]
      : subscribers.errorHandlers,
  });

  if (ticker.name === ticker.into) return;

  subscribeToTickerOnWs(ticker.name, ticker.into);
};

export const unsubscribeFromTicker = (ticker) => {
  if (ticker.name === `BTC`) return;

  tickerHandlers.delete(ticker.name);
  unsubscribeToTickerOnWs(ticker.name, ticker.into);
};

// START #15 Криптономикон-4 - Самостоятельная работа (валидации)
export const loadDictionary = () =>
  fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true`)
    .then((response) => response.json())
    .then((json) => json.Data);
// END #15 Криптономикон-4 - Самостоятельная работа (валидации)
