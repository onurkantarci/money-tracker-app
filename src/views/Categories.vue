<template>
  <div>
    <input
      type="radio"
      name="categoryType"
      v-model="selectedOption"
      value="income"
    />
    <label for="income">Income</label>
  </div>
  <div>
    <input
      type="radio"
      name="categoryType"
      v-model="selectedOption"
      value="expense"
    />
    <label for="expense">Expense</label>
  </div>
  <div class="name-input">
    <label for="name">Name</label>
    <input type="text" v-model="categoriesName" />
  </div>
  <button @click="saveCategory">Save Category</button>

  <RevenueTable />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { db } from "../../db";
import RevenueTable from "../components/RevenueTable.vue";

const categoriesName = ref<string>("");
const selectedOption = ref<string>("income");

async function saveCategory() {
  console.log({ categoryType: selectedOption.value });
  try {
    const id = await db.categories.add({
      name: categoriesName.value,
      type: selectedOption.value,
    });
    console.log(`Category saved with ID: ${id}`);
  } catch (error) {
    console.error(`Error saving category: ${error}`);
  }
}
</script>

<style>
.name-input {
  display: flex;
  flex-direction: column;
  margin: 10px;
}

.name-input input {
  max-width: 100px;
}

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

.results {
  padding: 4px 10px;
}

.active {
  background-color: rgb(202, 199, 199);
}
</style>
