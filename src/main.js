import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css";
import BTC from "./BTC";

new BTC();
createApp(App).mount("#app");
