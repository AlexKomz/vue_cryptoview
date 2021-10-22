<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!--START #15 Криптономикон-4 - Самостоятельная работа (валидации)-->
    <div
      v-if="!dictionary"
      class="
        fixed
        w-100
        h-100
        opacity-80
        bg-purple-800
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <!--END #15 Криптономикон-4 - Самостоятельная работа (валидации)-->
    <div class="container">
      <div class="w-full my-4" />

      <add-ticker
        @add-ticker="add"
        :disabled="tooManyTickersAdded"
        :dictionary="dictionary"
        :tickers="tickers"
      />

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            class="
              mx-2
              my-4
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
            v-if="page > 1"
            @click="page = +page - 1"
          >
            Назад
          </button>
          <button
            class="
              mx-2
              my-4
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
            v-if="hasNextPage"
            @click="page = +page + 1"
          >
            Вперед
          </button>
          <div>Фильтр: <input v-model="filter" /></div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <tickers-list
          :paginatedTickers="paginatedTickers"
          :selectedTicker="selectedTicker"
          @select="select"
          @delete="handleDelete"
        />
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <ticker-graph
        v-model:graph="graph"
        :selectedTicker="selectedTicker"
        @close="selectedTicker = null"
      />
    </div>
  </div>
</template>

<script>
// H - Homework - домашнее задание
// [x] 6. Наличии в состоянии ЗАВИСИМЫХ ДАННЫХ | Критичность: 5+
// [x] 4. Запросы напрямую внутри компонента (???) | Критичность: 5
// [x] 2. При удалении остается подписка на загрузку тикера | Критичность: 5
// [x] 5. Обработка ошибок API | Критичность: 5
// [x] 3. Количество запросов | Критичность: 4
// [x] 8. При удалении тикера не изменяется localStorage | Критичность: 4
// [x] 1. Одинаковый код в watch | Критичность: 3
// [ ] 9. localStorage и анонимные вкладки | Критичность: 3
// [x] 7. График ужасно выглядит если будет много цен | Критичность: 2
// [ ] 10. Магические строки и числа (URL, 5000 мс задержки, ключ localStorage, количество на странице) | Критичность: 1

// Параллельно
// [x] График сломан если везде одинаковые значения
// [x] При удалении тикера остается выбор

// [x] Выделить график в отдельный компонент!

import {
  loadDictionary,
  subscribeToTicker,
  unsubscribeFromTicker,
} from "./api";

import AddTicker from "./components/AddTicker.vue";
import TickerGraph from "./components/TickerGraph.vue";
import TickersList from "./components/TickersList.vue";

export default {
  name: "App",

  components: {
    AddTicker,
    TickerGraph,
    TickersList,
  },

  data() {
    return {
      ticker: ``,
      filter: ``,

      tickers: [],
      selectedTicker: null,

      graph: [],

      page: 1,
      dictionary: null, // #15 Криптономикон-4 - Самостоятельная работа (валидации)
    };
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    const VALID_KEYS = [`filter`, `page`];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    const tickersData = localStorage.getItem(`cryptonomicon-list`);

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        // #21 Криптономикон: улучшаем API - Vue.js: практика
        // Добавил, что при ошибке будет помечаться ошибочным
        subscribeToTicker(
          ticker.name,
          (newPrice) => this.updateTicker(ticker.name, newPrice)
          // () => this.markErroredTicker(ticker.name, true)
        );

        subscribeToTicker(
          ticker.name,
          () => this.markErroredTicker(ticker.name, false),
          () => this.markErroredTicker(ticker.name, true)
        );
      });
    }
  },

  // START #15 Криптономикон-4 - Самостоятельная работа (валидации)
  mounted() {
    loadDictionary().then((data) => (this.dictionary = data));
  },
  // END #15 Криптономикон-4 - Самостоятельная работа (валидации)

  computed: {
    tooManyTickersAdded() {
      return this.tickers.length > 20;
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) => ticker.name.includes(this.filter));
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    // #21 Криптономикон: улучшаем API - Vue.js: практика
    getFilteredTickersByName(tickerName) {
      return this.tickers.filter((t) => t.name === tickerName);
    },

    updateTicker(tickerName, price) {
      this.getFilteredTickersByName(tickerName).forEach((t) => {
        if (t === this.selectedTicker) {
          this.graph = [...this.graph, price];
        }
        t.price = price;
      });
    },

    // #21 Криптономикон: улучшаем API - Vue.js: практика
    markErroredTicker(tickerName, isErrored) {
      this.getFilteredTickersByName(tickerName).forEach((t) => {
        t.isErrored = isErrored;
      });
    },

    add(ticker) {
      // #21 Криптономикон: улучшаем API - Vue.js: практика
      // add isErrored: false
      const currentTicker = {
        name: ticker,
        price: `-`,
        isErrored: false,
      };

      this.tickers = [...this.tickers, currentTicker];
      this.filter = ``;

      // #21 Криптономикон: улучшаем API - Vue.js: практика
      // Добавил, что при ошибке будет помечаться ошибочным
      subscribeToTicker(currentTicker.name, (newPrice) =>
        this.updateTicker(currentTicker.name, newPrice)
      );

      subscribeToTicker(
        currentTicker.name,
        () => this.markErroredTicker(currentTicker.name, false),
        () => this.markErroredTicker(currentTicker.name, true)
      );
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);

      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }

      unsubscribeFromTicker(tickerToRemove.name);
    },
  },

  watch: {
    tickers() {
      localStorage.setItem(`cryptonomicon-list`, JSON.stringify(this.tickers));
    },

    selectedTicker() {
      this.graph = [];
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>
