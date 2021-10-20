<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер {{ ticker }}</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <!--#15 Криптономикон-4 - Самостоятельная работа (валидации)-->
          <input
            @input="handleInput"
            v-model="ticker"
            v-on:keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
        </div>
        <!--START #15 Криптономикон-4 - Самостоятельная работа (валидации)-->
        <div
          v-if="autocomplete.length"
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-for="t in autocomplete"
            :key="t.Id"
            @click="handleAutocompleteClick(t.Symbol)"
            class="
              inline-flex
              items-center
              px-2
              m-1
              rounded-md
              text-xs
              font-medium
              bg-gray-300
              text-gray-800
              cursor-pointer
            "
          >
            {{ t.Symbol }}
          </span>
        </div>
        <div v-if="!isValid" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
        <!--END #15 Криптономикон-4 - Самостоятельная работа (валидации)-->
      </div>
    </div>
    <add-button
      @click="add"
      type="button"
      :disabled="disabled"
      class="my-4"
    ></add-button>
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";

export default {
  components: {
    AddButton,
  },

  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    dictionary: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    tickers: {
      type: Array,
      required: true,
    },
  },

  emits: {
    "add-ticker": (value) => typeof value === `string` && !!value,
  },

  data: () => ({
    ticker: ``,
    isValid: true,
    autocomplete: [],
  }),

  methods: {
    add() {
      if (!this.ticker) return;

      this.isValid = this.validate(this.ticker); // #15 Криптономикон-4 - Самостоятельная работа (валидации)

      if (!this.isValid) return; // #15 Криптономикон-4 - Самостоятельная работа (валидации)

      this.$emit(`add-ticker`, this.ticker);
      this.ticker = ``;
    },

    // START #15 Криптономикон-4 - Самостоятельная работа (валидации)
    validate(ticketToValid) {
      return !this.tickers.some((ticket) => ticket.name === ticketToValid);
    },

    handleInput() {
      this.isValid = true;

      if (!this.ticker) return;

      const input = this.ticker.toLowerCase();
      this.autocomplete = Object.values(this.dictionary)
        .filter((item) => {
          const symbol = item.Symbol.toLowerCase();
          const fullName = item.FullName.toLowerCase();

          return symbol.includes(input) || fullName.includes(input);
        })
        .slice(0, 4);
    },

    handleAutocompleteClick(tickerFromAutocomplete) {
      this.ticker = tickerFromAutocomplete;
      this.add();
    },

    // END #15 Криптономикон-4 - Самостоятельная работа (валидации)
  },

  watch: {
    // START #15 Криптономикон-4 - Самостоятельная работа (валидации)
    ticker() {
      if (!this.ticker) this.autocomplete = [];
    },
    // END #15 Криптономикон-4 - Самостоятельная работа (валидации)
  },
};
</script>
