const API_KEY = `9563db33341ed2502231935ffbea554d65356f7b8686b709d10d91580682a0b2`;

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const ports = [];

socket.addEventListener(`message`, (event) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    TOSYMBOL: into,
    PRICE: price,
    PARAMETER: parameter,
  } = JSON.parse(event.data);

  ports.forEach((port) =>
    port.postMessage({
      type,
      currency,
      into,
      price,
      parameter,
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

const handlers = {
  [`SUBSCRIBE`]: (payload) =>
    subscribeToTickerOnWs(payload.ticker, payload.into),
  [`UNSUBSCRIBE`]: (payload) =>
    unsubscribeToTickerOnWs(payload.ticker, payload.into),
};

self.addEventListener(`connect`, (connectEvent) => {
  const port = connectEvent.ports[0];
  ports.push(port);

  port.addEventListener(`message`, (event) => {
    const { type, payload } = event.data;

    handlers[type](payload);
  });

  port.start();
});
