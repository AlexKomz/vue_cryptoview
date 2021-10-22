<template>
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
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
      "
      v-if="page > 1"
      @click="$emit(`click`, page - 1)"
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
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
      "
      v-if="hasNextPage"
      @click="$emit(`click`, page + 1)"
    >
      Вперед
    </button>
    <div>Фильтр: <input v-model="inputValue" @input="handleChange" /></div>
  </div>
</template>

<script>
export default {
  data: () => ({
    inputValue: ``,
  }),

  created() {
    this.inputValue = this.filter;
  },

  props: {
    filter: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    hasNextPage: {
      type: Boolean,
      required: true,
    },
  },

  emits: {
    click: null,
    "update:filter": null,
  },

  methods: {
    handleChange() {
      this.$emit(`update:filter`, this.inputValue);
    },
  },
};
</script>
