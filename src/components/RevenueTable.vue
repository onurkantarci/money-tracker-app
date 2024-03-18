<template>
  <div class="revenue-table">
    <button
      @click="showCategories('income')"
      :class="{ active: showingIncome }"
    >
      Income
    </button>
    <button
      @click="showCategories('expense')"
      :class="{ active: showingExpense }"
    >
      Expense
    </button>

    <div
      @click="selectCategory(category)"
      :class="{ active: isSelected(category), default: !isSelected(category) }"
      v-for="category in data.categories"
      :key="category.id"
    >
      {{ category.name }}, {{ category.type }}
    </div>
  </div>

  <slot></slot>
</template>

<script setup lang="ts">
import { liveQuery } from "dexie";
import { reactive, ref, defineEmits, onMounted } from "vue";
import { Category, db } from "../../db";

const emit = defineEmits(["category-selected"]);

const data = reactive<{ categories: Category[] }>({ categories: [] });

const selectedCategory = ref<Category | null>(null);

function selectCategory(category: Category) {
  selectedCategory.value = category;
  emit("category-selected", selectedCategory.value);
}

function isSelected(category: Category) {
  return selectedCategory.value === category;
}

const showingIncome = ref(false);
const showingExpense = ref(false);

function showCategories(type: string) {
  const query = liveQuery(() => db.categories.where({ type }).toArray());

  query.subscribe((categories) => {
    data.categories = categories;
  });
}

onMounted(() => {
  showCategories("income");
});
</script>

<style scoped>
.revenue-table {
  border: 1px solid grey;
  max-width: 400px;
  margin: 10px;
  height: 300px;
}

.revenue-table button {
  width: 200px;
  padding: 10px;
}

.default {
  border: 1px solid grey;
  padding: 10px;
}
.default:hover {
  cursor: pointer;
}

.active {
  border: 1px solid grey;
  padding-left: 10px;
  padding: 10px;
  background-color: rgb(108, 214, 186);
}
</style>
