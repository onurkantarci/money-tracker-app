<template>
  <v-dialog class="v-dialog" v-model="dialogVisible" max-width="1000px">
    <v-card class="v-card">
      <v-card-title class="dialog-header">
        <h1 style="color: white" class="headline white--text">
          {{ action }}
        </h1>
        <v-btn
          style="background-color: #00193b; color: white"
          size="x-small"
          icon
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div class="category-inputs">
          <v-select
            class="v-select"
            style="color: white"
            v-model="selectedType"
            :items="['income', 'expense']"
            label="Select Type"
          ></v-select>
          <v-combobox
            class="v-combobox"
            style="color: white"
            v-model="state.selectedCategoryName"
            :items="categoryNames"
            label="Select Category"
            :disabled="!selectedType"
            item-text="name"
            @blur="v$.selectedCategoryName.$touch"
            @input="v$.selectedCategoryName.$touch"
            :error-messages="
              v$.selectedCategoryName.$errors.map((e) => e.$message)
            "
          ></v-combobox>
        </div>
        <div v-if="state.errorMessage" class="error-message">
          {{ state.errorMessage }}
        </div>
        <v-form @submit.prevent="submit">
          <main>
            <div class="desc-amount">
              <v-text-field
                clearable
                required
                @blur="v$.amount.$touch"
                @input="v$.amount.$touch"
                label="Amount"
                v-model.number="state.amount"
                :error-messages="v$.amount.$errors.map((e) => e.$message)"
              ></v-text-field>
              <v-text-field
                clearable
                :error-messages="v$.name.$errors.map((e) => e.$message)"
                v-model="state.name"
                @blur="v$.name.$touch"
                @input="v$.name.$touch"
                label="Name"
                required
              ></v-text-field>
              <v-text-field
                clearable
                required
                :error-messages="v$.date.$errors.map((e) => e.$message)"
                @blur="v$.date.$touch"
                @input="v$.date.$touch"
                type="date"
                label="Date"
                v-model="state.date"
              ></v-text-field>
              <v-text-field
                clearable
                label="Note(Optional)"
                v-model="state.note"
              ></v-text-field>
            </div>
          </main>
          <footer>
            <div class="submit-container">
              <v-btn class="submit-button" type="submit" @click="v$.$validate"
                >Submit</v-btn
              >
            </div>
          </footer>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineExpose, reactive } from "vue";
import { Category, db, Record } from "../../db";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { watch } from "vue";
import { liveQuery } from "dexie";
import { computed } from "vue";
import { onMounted } from "vue";

const emits = defineEmits(["submit"]);
const props = defineProps(["action", "record"]);
const data = reactive<{ categories: Category[] }>({ categories: [] });
const selectedType = ref("");

function showCategories(type: string) {
  const query = liveQuery(() => db.categories.where({ type }).toArray());

  query.subscribe((categories) => {
    data.categories = categories;
    console.log("Categories:", categories);
  });
}

const categoryNames = computed(() => {
  return data.categories.map((category) => category.name);
});

const initialState = {
  id: 0,
  name: "",
  amount: 0,
  date: new Date().toISOString().substring(0, 10),
  note: "",
  category_id: 0,
  category_type: "",
  category_name: "",
  selectedCategoryName: "",
};

const state = reactive({
  ...initialState,
  errorMessage: "",
});

const rules = {
  name: { required },
  amount: {
    required,
    notZero(value: number) {
      return value !== 0;
    },
  },
  date: {
    required,
  },
  selectedCategoryName: { required },
};

const v$ = useVuelidate(rules, state);

const initializeCategoryNames = () => {
  if (selectedType) {
    showCategories(selectedType.value);
  }
};

const handleTypeChange = () => {
  state.selectedCategoryName = "";
};

watch(selectedType, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleTypeChange();
  }
});

watch(selectedType, () => {
  initializeCategoryNames();
});

onMounted(initializeCategoryNames);

const dialogVisible = ref(false);

const showDialog = (recordData: Record) => {
  Object.assign(state, recordData);
  state.amount = Math.abs(state.amount) || 0;

  selectedType.value = state.category_type;

  showCategories(selectedType.value);

  setTimeout(() => {
    state.selectedCategoryName = state.category_name;
  }, 1);

  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
  v$.value.$reset();
};

const getCategoryObject = () => {
  const categoryObject = data.categories.find(
    (category) => category.name === state.selectedCategoryName
  );
  console.log("Category Object:", categoryObject);
  return categoryObject;
};

const submit = async () => {
  const result = await v$.value.$validate();
  if (!result) {
    console.log("Validation failed");
    return;
  }

  const selectedCategoryObject = getCategoryObject();

  if (!selectedCategoryObject) {
    state.errorMessage = "Category is required.";
    console.log("Selected category not found");
    return;
  } else {
    state.errorMessage = "";
  }

  if (selectedCategoryObject.id !== undefined) {
    state.category_id = selectedCategoryObject.id;
  } else {
    console.error("Category object does not contain id property");
    return;
  }

  const isExpense =
    selectedType.value === "expense" &&
    selectedCategoryObject.type === "expense" &&
    selectedCategoryObject.name === state.selectedCategoryName;

  state.amount = isExpense ? -Math.abs(state.amount) : Math.abs(state.amount);

  if (props.action === "Add Record") {
    const {
      id,
      selectedCategoryName,
      category_type,
      category_name,
      ...record
    } = state;
    db.records
      .add(record)
      .then(() => {
        v$.value.$reset();
        Object.assign(state, initialState);
        close();
        console.log("Record added successfully");
      })
      .catch((error) => {
        console.error("Error adding record:", error);
      });
  } else if (state.id !== undefined) {
    const {
      id,
      selectedCategoryName,
      category_type,
      category_name,
      ...record
    } = state;
    db.records
      .update(state.id, record)
      .then(() => {
        v$.value.$reset();
        close();
        console.log("Record edited successfully");
      })
      .catch((error) => {
        console.error("Error editing record:", error);
      });
  }

  emits("submit");
};

defineExpose({
  showDialog,
  close,
});
</script>

<style scoped>
.category-inputs {
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-select {
  max-width: 130px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.v-combobox {
  margin-bottom: 5px;
}

.v-dialog {
  max-width: 500px;
  margin: 0 auto;
}

.v-card {
  background-color: #001e45;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 30px;
  border-bottom: 1px solid black;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.18);
}

.desc-amount {
  color: white;
}

.submit-button {
  background-color: #00193b;
  color: white;
}

.submit-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.error-message {
  color: rgb(194, 0, 0);
  margin-top: -10px;
  margin-bottom: 10px;
  margin-left: 10px;
  font-size: 15px;
}
</style>
