<template>
  <div
    class="
      absolute
      top-0
      left-0
      right-0
      bg-red-400 bg-opacity-50
      border-2 border-red-300
      z-10
    "
  >
    <div class="relative py-5 px-5 justify-center w-full h-full flex">
      <p class="m-0 self-center font-bold text-white">
        {{ errorMessage }}
      </p>
      <button
        @click="$emit(`close`)"
        class="
          absolute
          top-1
          right-1
          leading-none
          text-white
          font-bold
          text-xl
          cursor-pointer
          hover:text-gray-200
        "
      >
        X
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    errorMessage: {
      type: String,
      required: true,
    },
  },

  emits: {
    close: null,
  },
};
</script>
