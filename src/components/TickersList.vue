<template>
  <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
    <tickers-item
      v-for="t of paginatedTickers"
      :key="t.name"
      :class="{
        'border-4': selectedTicker === t,
        'bg-red-100': t.isErrored,
      }"
      :ticker="t"
      @click="handleSelect"
      @delete="handleDelete"
    />
  </dl>
</template>

<script>
import TickersItem from "./TickersItem.vue";

export default {
  components: {
    TickersItem,
  },

  props: {
    paginatedTickers: {
      type: Array,
      required: true,
    },
    selectedTicker: {
      type: Object,
      required: false,
    },
  },

  emits: {
    select: null,
    delete: null,
  },

  methods: {
    handleSelect(ticker) {
      this.$emit(`select`, ticker);
    },

    handleDelete(ticker) {
      this.$emit(`delete`, ticker);
    },
  },
};
</script>
