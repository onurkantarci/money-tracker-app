<template>
  <div class="whole-content-container">
    <div class="add-record-container">
      <v-btn
        variant="elevated"
        color="#56CFE1"
        icon="mdi-plus"
        class="add-record-button"
        @click="showAddRecordDialog()"
      ></v-btn>
    </div>
    <div class="header">
      <div class="img-container">
        <img :src="monthlySvg" alt="month-background" />
        <div class="financial-data-container">
          <div class="financial-data">
            <div>
              <h2>Income</h2>
              <p style="color: #66ff99">{{ totalIncome }}</p>
            </div>
            <div class="left-line">
              <div class="balance-expenses">
                <h2>Expenses</h2>
                <p style="color: #ff6666">{{ totalExpenses }}</p>
              </div>
            </div>
            <div class="left-line">
              <div class="balance-expenses">
                <h2>Balance</h2>
                <p
                  :style="{
                    color: balance >= 0 ? '#66ff99' : ' #ff6666',
                  }"
                >
                  {{ balance }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="search-input">
          <v-text-field
            clearable
            append-inner-icon="mdi-magnify"
            density="compact"
            hide-details
            single-line
            label="Search a record..."
            v-model="searchQuery"
          ></v-text-field>
        </div>
        <div class="month-selector">
          <v-text-field
            class="month-input"
            color="#FFFFFF"
            type="month"
            hide-details
            v-model="selectedMonth"
            @change="loadRecords"
          />
        </div>
      </div>
    </div>

    <RecordDialog
      ref="addRecordDialog"
      action="Add Record"
      :record="newRecord"
      @submit="handleRecordSubmit"
    />
    <RecordDialog
      ref="editRecordDialog"
      action="Edit Record"
      @submit="handleRecordSubmit"
    />
    <ConfirmationDialog
      ref="confirmationDialog"
      action="Record"
      associated="This action is permanent and cannot be undone."
      :record="recordToDelete"
      @confirmed="handleConfirmationSubmit"
    />

    <div v-if="groupedRecords.length === 0" class="empty-search-container">
      <img class="empty-img" src="/public/questionmark.svg" alt="No Records" />
      <p style="color: white">No records available for the selected month.</p>
    </div>

    <div v-else class="main-content">
      <div class="main-content-background">
        <template v-for="group in groupedRecords" :key="group.date">
          <div class="date-container">
            <div class="date" style="margin-top: 30px">
              <div class="day-and-dayOfWeek">
                <span class="day-of-month">{{
                  getDayOfMonth(group.date)
                }}</span>
                <span class="day-of-week">{{ getDayOfWeek(group.date) }}</span>
              </div>
              <div class="month-and-year">{{ getMonthYear(group.date) }}</div>
            </div>
            <div class="daily-amount-sum">
              <p>{{ getDailyAmountSum(group.records) }}</p>
            </div>
          </div>

          <div class="results-container">
            <div
              class="results"
              v-for="record in group.records"
              :key="record.id"
              @contextmenu="handleContextMenu($event, record)"
            >
              <div class="left-results">
                <h3>{{ record.name }}</h3>
                <p>{{ record.note }}</p>
              </div>
              <div class="right-results">
                <h3
                  :style="{
                    color:
                      record.category_type === 'expense'
                        ? '#e74c3c'
                        : '#66ff99',
                  }"
                >
                  {{ record.amount }}
                </h3>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div
        v-if="contextMenu.visible && contextMenu.record"
        :style="{
          top: contextMenu.top + 'px',
          left: contextMenu.left + 'px',
        }"
        class="context-menu"
      >
        <div
          class="context-select"
          @click="showEditRecordDialog(contextMenu.record)"
        >
          <v-icon size="small" style="margin-right: 5px">mdi-pencil</v-icon>
          Edit
        </div>
        <div
          class="context-select"
          @click="showConfirmationDialog(contextMenu.record)"
        >
          <v-icon size="small" style="margin-right: 5px">mdi-delete</v-icon>
          Remove
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import RecordDialog from "../components/RecordDialog.vue";
import ConfirmationDialog from "../components/ConfirmationDialog.vue";
import { db, Record } from "../../db";
import { monthlySvgs } from "../constants/monthly-svg";

const editRecordDialog = ref<typeof RecordDialog | null>(null);
const confirmationDialog = ref<typeof ConfirmationDialog | null>(null);
const addRecordDialog = ref<typeof RecordDialog | null>(null);
const selectedMonth = ref<string>(new Date().toISOString().substring(0, 7));
console.log({ selectedMonth });
const records = ref<Record[]>([]);
const recordToDelete = ref<Record | null>(null);
const searchQuery = ref<string>("");

const getDailyAmountSum = (records: Record[]) => {
  return records.reduce((sum, record) => sum + record.amount, 0);
};

const filteredRecords = computed(() => {
  if (!searchQuery?.value) {
    return records.value;
  }

  return records.value.filter(
    (record) =>
      record.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (record.note &&
        record.note.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

const groupedRecords = computed(() => {
  const grouped: { [key: string]: { date: string; records: Record[] } } = {};
  for (const record of filteredRecords.value) {
    const date = record.date;
    if (typeof date === "string") {
      if (!grouped[date]) {
        grouped[date] = { date, records: [] };
      }
      grouped[date].records.push(record);
    }
  }
  return Object.values(grouped);
});

const currentMonth = new Date().getMonth();
const monthlySvg = monthlySvgs.find((item) =>
  item.months.includes(currentMonth)
)?.svg;
console.log({ monthlySvg });

const contextMenu = ref<{
  visible: boolean;
  top: number;
  left: number;
  record: Record | null;
}>({
  visible: false,
  top: 0,
  left: 0,
  record: null,
});
function handleContextMenu(event: MouseEvent, record: Record) {
  event.preventDefault();
  contextMenu.value.visible = true;
  contextMenu.value.top = event.clientY;
  contextMenu.value.left = event.clientX;
  contextMenu.value.record = record;
}

document.body.addEventListener("click", () => {
  if (contextMenu.value.visible) {
    contextMenu.value.visible = false;
  }
});

const getDayOfMonth = (dateString: string | undefined) => {
  if (!dateString) return "Day not available";
  const date = new Date(dateString);
  return date.getDate();
};

const getDayOfWeek = (dateString: string | undefined) => {
  if (!dateString) return "Day not available";
  const date = new Date(dateString);
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][date.getDay()];
};

const getMonthYear = (dateString: string | undefined) => {
  if (!dateString) return "Date not available";
  const date = new Date(dateString);
  return `${
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][date.getMonth()]
  } ${date.getFullYear()}`;
};

const handleRecordDeletion = (record: Record) => {
  if (!record || record.id === undefined) {
    console.error("Invalid record ID");
    return;
  }

  db.records
    .delete(record.id)
    .then(() => {
      loadRecords();
    })
    .catch((error) => {
      console.error("Error deleting record:", error);
    });
};

const handleConfirmationSubmit = () => {
  if (recordToDelete.value) {
    handleRecordDeletion(recordToDelete.value);
  } else {
    console.error("No record selected for deletion");
  }
};

const handleRecordSubmit = () => {
  loadRecords();
};

const totalIncomeAndExpenses = computed(() => {
  return (
    records.value?.reduce(
      (acc, record) => {
        if (record.category_type === "income") {
          acc.income += record.amount;
        } else if (record.category_type === "expense") {
          acc.expenses += record.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    ) || { income: 0, expenses: 0 }
  );
});

const totalIncome = computed(() => totalIncomeAndExpenses.value.income);
const totalExpenses = computed(() => totalIncomeAndExpenses.value.expenses);
const balance = computed(() => {
  return totalIncome.value + totalExpenses.value;
});

const newRecord = ref<Record>({
  name: "",
  note: "",
  date: new Date().toISOString().substring(0, 10),
  amount: 0,
  category_id: 0,
});

function showAddRecordDialog() {
  newRecord.value = {
    name: "",
    note: "",
    date: new Date().toISOString().substring(0, 10),
    amount: parseFloat("0"),
    category_id: 0,
  };

  addRecordDialog.value!.showDialog();
}

function showEditRecordDialog(record: Record | null) {
  newRecord.value = {
    name: "",
    note: "",
    date: new Date().toISOString().substring(0, 10),
    amount: 0,
    category_id: 0,
  };
  editRecordDialog.value!.showDialog(record);
}

function showConfirmationDialog(record: Record | null) {
  recordToDelete.value = record;
  confirmationDialog.value!.showDialog(record);
}
async function loadRecords() {
  const categories = await db.categories.toArray();

  const [year, month] = selectedMonth.value.split("-").map(Number);

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
  firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1);
  const adjustedFirstDayOfMonth = firstDayOfMonth.toISOString();

  const lastDayOfMonth = new Date(Date.UTC(year, month - 1, lastDay));
  lastDayOfMonth.setDate(lastDayOfMonth.getDate() + 1);
  const adjustedLastDayOfMonth = lastDayOfMonth.toISOString();

  const fetchedRecords = await db.records
    .where("date")
    .between(adjustedFirstDayOfMonth, adjustedLastDayOfMonth)
    .toArray();

  records.value = fetchedRecords
    .map((record) => {
      const category = categories.find((cat) => cat.id === record.category_id);
      return {
        ...record,
        category_type: category ? category.type : "Unknown",
        category_name: category ? category.name : "Unknown",
      };
    })
    .sort((a, b) => b.id! - a.id!);
}
onMounted(loadRecords);
</script>

<style>
* {
  font-family: "Poppins", sans-serif;
  box-sizing: border-box;
  font-size: 16px;
}

body {
  background-color: #001523;
}

.daily-amount-sum {
  margin-top: 50px;
  color: #aaaaaaa5;
}

.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 500px;
  background-color: #00253e;
}

.month-selector {
  background-color: rgba(0, 65, 108, 0.16);
  backdrop-filter: blur(10px);
  color: white;
  margin-top: 30px;
  position: absolute;
  margin-left: 25px;
}

.search-input {
  color: white;
  margin-top: 30px;
}

.header img {
  padding: 10px;
  max-height: 250px;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
}

.main-content {
  background-color: #001a2c;
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
}

.main-content-background {
  margin-top: 20px;
  margin-bottom: 10px;
  background-color: #00253ebf;
  border-radius: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-bottom: 20px;
}

.financial-data-container {
  position: absolute;
  margin-top: -60px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
}

.financial-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 50px;
  background-color: #00111c62;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 20px 40px 20px 40px;
  color: #f5f5f5;
}

.financial-data h2 {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.context-menu {
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  background-color: #002657;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  padding: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.context-select {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.context-select:hover {
  background-color: #012b61;
  border-radius: 6px;
}

.empty-img {
  margin-top: 30px;
  margin-bottom: 10px;
  max-width: 60%;
}

.add-record-container {
  position: fixed;
  margin-left: 800px;
  bottom: 0;
  right: 0;
  margin: 20px;
  border-radius: 100%;
  z-index: 1;
}

.whole-content-container {
  margin-top: 40px;
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.results-container {
  width: 80%;
  padding-top: 0.5rem;
}

.results {
  color: white;
  max-width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: 0.5rem;
}

.results:hover {
  margin-inline: -1rem;
  padding-inline: 1rem;
  transition: background-color 200ms;
  background-color: rgba(190, 190, 190, 0.142);
  border-radius: 0.5rem;
}

p {
  text-align: center;
}

.delete-record {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 30px;
}

.trash-button {
  border: none;
  background-color: transparent;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.trash-button:hover {
  background-color: rgba(0, 149, 255, 0.1);
}

.edit-trash {
  display: flex;
  align-items: center;
}

.date-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  border-bottom: 1px solid #e0e0e0;
  width: 80%;
}

.date {
  color: #aaa;
  font-weight: bold;
  padding: 8px 8px 8px 0px;
}

.day-of-month {
  font-size: 1rem;
  line-height: 1.5rem;
  margin-right: 5px;
  color: #aaaaaaa5;
}

.day-of-week {
  font-size: 1rem;
  line-height: 1.5rem;
  color: #aaaaaa9c;
}

.empty-search-container {
  background-color: #001a2c;
  width: 100%;
  padding: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.month-and-year {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #aaaaaa7b;
}

.desc-amount {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.left-line {
  border-left: none;
}

.balance-expenses {
  margin-left: 0px;
}

::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

@media (min-width: 640px) {
  ::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
  .main-content-background {
    padding: 0px 40px 40px 40px;
  }
  .add-record-container {
    position: fixed;
    border-radius: 100%;
    z-index: 1;
  }
  .empty-search-container {
    background-color: #001a2c;
    width: 100%;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .empty-img {
    margin-top: 80px;
    margin-bottom: 10px;
    max-width: 40%;
  }
  .search-input {
    right: 0;
    bottom: 0;
    color: white;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36%;
  }
  .month-selector {
    background-color: rgba(0, 65, 108, 0.16);
    backdrop-filter: blur(10px);
    left: 0;
    margin-left: 0;
    bottom: 0;
    color: white;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .header {
    padding-top: 60px;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    background-color: #00253e;
  }
  .whole-content-container {
    margin-top: 49px;
    max-width: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-left: auto;
    margin-right: auto;
    position: relative;
  }
  .header img {
    padding: 30px;
    height: 350px;
    width: 100%;
    top: 0;
    left: 0;
    right: 0;
  }
  .financial-data-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  .financial-data {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 50px;
    background-color: #00111c62;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px 40px 20px 40px;
    color: #f5f5f5;
  }

  .left-line {
    border-left: 1px solid #024d7e;
  }

  .balance-expenses {
    margin-left: 50px;
  }
}
</style>
