const API_KEY = `9563db33341ed2502231935ffbea554d65356f7b8686b709d10d91580682a0b2`;
const SUBSCRIPTION_ALREADY_ACTIVE = `SUBSCRIPTION_ALREADY_ACTIVE`;

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const ports = [];

socket.addEventListener(`message`, (event) => {
  const {
    TYPE: type,
    FROMSYMBOL: fsym,
    TOSYMBOL: tsym,
    PRICE: price,
    PARAMETER: parameter,
    MESSAGE: message,
  } = JSON.parse(event.data);

  if (message === SUBSCRIPTION_ALREADY_ACTIVE) return;

  ports.forEach((port) =>
    port.postMessage({
      type,
      ticker: {
        name: fsym,
        currency: tsym,
      },
      price,
      parameter,
      message,
    })
  );
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

const subscribeToTickerOnWs = (name, currency) => {
  sendToWebSocket({
    action: `SubAdd`,
    subs: [`5~CCCAGG~${name}~${currency}`],
  });
};

const unsubscribeToTickerOnWs = (name, currency) => {
  sendToWebSocket({
    action: `SubRemove`,
    subs: [`5~CCCAGG~${name}~${currency}`],
  });
};

const handlers = {
  [`SUBSCRIBE`]: (payload) =>
    subscribeToTickerOnWs(payload.name, payload.currency),
  [`UNSUBSCRIBE`]: (payload) =>
    unsubscribeToTickerOnWs(payload.name, payload.currency),
};

self.addEventListener(`connect`, (connectEvent) => {
  const port = connectEvent.ports[0];
  port.start();

  ports.push(port);

  port.addEventListener(`message`, (event) => {
    const { type, payload } = event.data;

    handlers[type](payload);
  });
});
