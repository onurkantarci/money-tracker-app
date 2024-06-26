<template>
  <div class="whole-category-list">
    <div class="revenue-table">
      <div class="income-expense-buttons">
        <v-btn
          :class="{ active: showingIncome }"
          variant="text"
          class="income-button"
          size="large"
          @click="showCategories('income')"
          >INCOME</v-btn
        >
        <v-btn
          :class="{ active: showingExpense }"
          variant="text"
          class="expense-button"
          size="large"
          @click="showCategories('expense')"
          >EXPENSE</v-btn
        >
      </div>
      <ConfirmationDialog
        ref="confirmationDialog"
        action="Category"
        associated="Deleting the category will remove all the associated records!"
        @confirmed="handleConfirmationSubmit"
      />
      <div v-if="data.categories.length === 0" class="no-categories">
        Start by adding a category...
      </div>
      <div
        v-else
        @click="selectCategory(category)"
        v-for="category in data.categories"
        :key="category.id"
        :class="{ 'categories-results': true, active: isSelected(category) }"
      >
        <div>{{ category.name }}</div>
        <span class="delete-icon">
          <button @click="showConfirmationDialog()">
            <v-icon size="x-small">mdi-delete</v-icon>
          </button>
        </span>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { liveQuery } from "dexie";
import { reactive, ref, defineEmits, onMounted } from "vue";
import { Category, db } from "../../db";
import ConfirmationDialog from "./ConfirmationDialog.vue";

const emit = defineEmits(["category-selected"]);

const confirmationDialog = ref<typeof ConfirmationDialog | null>(null);

function handleConfirmationSubmit() {
  if (selectedCategory.value) {
    deleteCategory(selectedCategory.value);
  }
}

function deleteCategory(category: Category) {
  if (category && category.id) {
    db.records
      .where({ category_id: category.id })
      .delete()
      .then(() => {
        db.categories.delete(category.id!).then(() => {
          showCategories(showingIncome.value ? "income" : "expense");
        });
      });
  }
}

function showConfirmationDialog() {
  confirmationDialog.value!.showDialog();
}

const data = reactive<{ categories: Category[] }>({ categories: [] });

const selectedCategory = ref<Category | null>(null);

function selectCategory(category: Category) {
  selectedCategory.value = category;
  console.log(selectedCategory);
  emit("category-selected", selectedCategory.value);
}

function selectCategoryById(categoryId: number) {
  const query = liveQuery(() =>
    db.categories.where({ id: categoryId }).toArray()
  );

  query.subscribe((categories) => {
    const category = categories[0];
    const categoryType = category.type;
    if (categoryType) {
      if (category) {
        selectedCategory.value = category;
      }
      showCategories(categoryType);
    }
  });
}

defineExpose({
  selectCategoryById,
});

function isSelected(category: Category) {
  return selectedCategory.value?.id === category.id;
}

const showingIncome = ref(false);
const showingExpense = ref(false);

function showCategories(type: string) {
  const query = liveQuery(() => db.categories.where({ type }).toArray());

  query.subscribe((categories) => {
    data.categories = categories;
  });

  if (type === "income") {
    showingIncome.value = true;
    showingExpense.value = false;
  } else if (type === "expense") {
    showingIncome.value = false;
    showingExpense.value = true;
  }
}

onMounted(() => {
  showCategories("income");
});
</script>

<style scoped>
.no-categories {
  margin-top: 50px;
  color: rgba(255, 255, 255, 0.363);
  display: flex;
  justify-content: center;
  align-items: center;
}
.whole-category-list {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 550px;
  margin: 0 auto;
}

.revenue-table {
  width: 100%;
  margin: 10px;
  background-color: rgb(0, 35, 57);
  backdrop-filter: blur(10px);
  padding: 50px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}

.income-expense-buttons {
  color: white;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  width: 100%;
  margin-bottom: 40px;
}

.income-expense-buttons button {
  border-radius: 20px;
  width: 400px;
}

.categories-results {
  color: white;
  margin-bottom: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 20px;
  background-color: #001a2c5b;
  position: relative;
}

.categories-results:hover .delete-icon {
  display: block;
}

.delete-icon {
  display: none;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.categories-results:hover {
  transition: background-color 200ms;
  background-color: rgba(190, 190, 190, 0.142);
}

.active {
  background-color: #ffffff;
  color: #000000;
}

.active:hover {
  background-color: #ffffff;
  color: #000000;
}

@media (min-width: 640px) {
  .income-expense-buttons {
    color: white;
    display: flex;
    flex-direction: row;
    gap: 30px;
    align-items: center;
    width: 100%;
    margin-bottom: 40px;
  }
  .income-expense-buttons button {
    width: 120px;
  }
}
</style>
