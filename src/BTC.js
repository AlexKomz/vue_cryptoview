import { subscribeToTicker } from "./api";

class BTC {
  constructor() {
    if (typeof BTC._instance === `object`) {
      return BTC._instance;
    }

    this.ticker = {
      name: `BTC`,
      into: `USD`,
      price: `-`,
    };

    this._updatePrice = this._updatePrice.bind(this);
    subscribeToTicker(this.ticker, (value) => this._updatePrice(value));

    BTC._instance = this;
    return this;
  }

  get price() {
    return this.ticker.price;
  }

  _updatePrice(value) {
    this.ticker.price = value;
  }
}

export default BTC;
