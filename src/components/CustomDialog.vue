<template>
  <div>
    <button class="plus-button" @click="showDialog">+</button>
    <div v-if="visible" class="overlay">
      <div class="dialog">
        <div class="content">
          <slot></slot>
        </div>
        <button class="close-button" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const visible = ref(false);

const showDialog = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};
</script>

<style scoped>
.close-button {
  margin-top: 30px;
}

.plus-button {
  font-size: 20px;
  margin-left: 80px;
  width: 50px;
  height: 50px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

button {
  margin-top: 10px;
}
</style>
