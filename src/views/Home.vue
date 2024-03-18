<template>
  <h1 class="name-header">NAME OF THE APPLICATION</h1>
  <div class="financial-data-container">
    <div class="financial-data">
      <div>
        <h2>Income</h2>
        <p>{{ totalIncome }}</p>
      </div>
      <div class="left-line">
        <div class="balance-expenses">
          <h2>Expenses</h2>
          <p>-{{ totalExpenses }}</p>
        </div>
      </div>
      <div class="left-line">
        <div class="balance-expenses">
          <h2>Balance</h2>
          <p>{{ balance }}</p>
        </div>
      </div>
    </div>
  </div>
  <CustomDialog>
    <RevenueTable @category-selected="setSelectedCategory">
      <div class="desc-amount">
        <label for="description">Record name:</label>
        <input type="text" v-model="name" />
        <label for="description">Note:</label>
        <input type="text" v-model="description" />
        <label for="amount">Amount:</label>
        <input placeholder="0" type="number" v-model="amount" />
        <button type="submit" @click="saveRecord">Save</button>
      </div>
    </RevenueTable>
  </CustomDialog>
  <div class="results-container" v-for="record in records" :key="record.id">
    <div class="date">
      {{
        record.date
          ? new Date(record.date).toLocaleDateString("en-GB")
          : "Date not available"
      }}
    </div>
    <div class="results">
      <div class="left-results">
        <h1>{{ record.name }}</h1>
        <p>{{ record.note }}</p>
      </div>
      <div class="right-results">
        <h2>{{ displayAmount(record.amount, record.category_id) }}</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import CustomDialog from "../components/CustomDialog.vue";
import RevenueTable from "../components/RevenueTable.vue";
import { db, Record } from "../../db";
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";

const description = ref<string>("");
const amount = ref(0);
const selectedCategory = ref<{ id: number } | null>(null);
const name = ref<string>("");

const totalIncome = computed(() => {
  return (
    records.value?.reduce((acc, record) => {
      if (record.category_type === "income") {
        return acc + record.amount;
      }
      return acc;
    }, 0) || 0
  );
});

const totalExpenses = computed(() => {
  return (
    records.value?.reduce((acc, record) => {
      if (record.category_type === "expense") {
        return acc + record.amount;
      }
      return acc;
    }, 0) || 0
  );
});

const balance = computed(() => {
  return totalIncome.value - totalExpenses.value;
});

const records = useObservable<Record[]>(
  liveQuery(async () => {
    const categories = await db.categories.toArray();

    const categoryIds = categories
      .map((cat) => cat.id)
      .filter((id) => id !== undefined) as number[];
    const records = await db.records
      .where("category_id")
      .anyOf(categoryIds)
      .toArray();

    return records
      .map((record) => {
        const category = categories.find(
          (cat) => cat.id === record.category_id
        );
        return {
          ...record,
          category_type: category ? category.type : "Unknown",
        };
      })
      .sort(
        (a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()
      );
  }) as any
);

function displayAmount(amount: number, categoryId: number): string {
  const record = records.value?.find((rec) => rec.category_id === categoryId);
  if (record && record.category_type === "expense") {
    return "-" + amount + " eur";
  } else {
    return amount + " eur";
  }
}

function setSelectedCategory(category: { id: number }) {
  selectedCategory.value = category;
}

function saveRecord() {
  if (!selectedCategory.value) {
    console.log("Please select a category.");
    return;
  }
  if (!name.value || amount.value <= 0) {
    console.log("Please provide description and a valid amount.");
    return;
  }
  const record: Record = {
    name: name.value,
    note: description.value,
    amount: amount.value,
    category_id: selectedCategory.value.id,
    date: new Date().toISOString(),
  };
  db.records
    .add(record)
    .then(() => {
      description.value = "";
      amount.value = 0;
      console.log("Record saved successfully!");
    })
    .catch((error) => {
      console.error("Error saving record:", error);
      console.log("Failed to save record. Please try again.");
    });
}
</script>

<style>
* {
  font-family: Arial, Helvetica, sans-serif;
}
p {
  text-align: center;
}

.results-container {
  margin-top: 50px;
  margin-bottom: 50px;
}

.results {
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-right-radius: 20px;
  margin: 0px 50px 0px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid grey;
}

.left-results {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 10px;
}

.right-results {
  padding: 10px;
}

.date {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-width: 450px;
  align-items: center;
  border: 1px solid grey;
  margin: 0px 60px 0px 50px;
  padding: 8px 15px 8px 15px;
}

.desc-amount {
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
}

.name-header {
  text-align: center;
  background-color: rgb(117, 117, 117);
  color: white;
  font-weight: lighter;
  font-size: 20px;
  padding: 30px;
}

.financial-data {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px;
  border: 1px solid grey;
  border-radius: 20px;
  padding: 35px;
  padding-left: 100px;
  padding-right: 100px;
}

.financial-data-container {
  display: flex;
  justify-content: center;
  max-width: 80%;
  margin: 0 auto;
  margin-top: 70px;
}

.left-line {
  border-left: 1px solid grey;
}

.balance-expenses {
  margin-left: 100px;
}
</style>
