<template>
  <div class="categories-container">
    <CategoryList />
    <v-btn
      variant="elevated"
      color="#56CFE1"
      icon="mdi-plus"
      class="add-category-button"
      @click="showAddCategoryDialog()"
    ></v-btn>
  </div>

  <CategoryDialog ref="categoryDialog" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import CategoryDialog from "../components/CategoryDialog.vue";
import CategoryList from "../components/CategoryList.vue";

const categoryDialog = ref<typeof CategoryDialog | null>(null);

function showAddCategoryDialog() {
  categoryDialog.value!.showDialog();
}
</script>

<style scoped>
.categories-container {
  max-width: 650px;
  position: relative;
  margin: 0 auto;
  margin-top: 39px;
}

.add-category-button {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 20px;
}

@media (min-width: 640px) {
  .add-category-button {
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 58px;
    margin-right: 110px;
  }
}
</style>
