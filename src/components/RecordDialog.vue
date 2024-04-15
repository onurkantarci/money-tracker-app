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
            v-model="selectedCategoryName"
            :items="categoryNames"
            label="Select Category"
            :disabled="!selectedType"
            item-text="name"
          ></v-combobox>
        </div>
        <v-form @submit.prevent="submit">
          <main>
            <div class="desc-amount">
              <v-text-field
                clearable
                required
                :counter="10"
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
                :counter="10"
                label="First name"
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
                :counter="10"
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

const emits = defineEmits(["submit"]);
const props = defineProps(["action", "record"]);
const selectedCategoryName = ref<string>("");
const selectedType = ref<string>("");
const data = reactive<{ categories: Category[] }>({ categories: [] });

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

watch(selectedType, (newValue) => {
  showCategories(newValue);
});

const initialState = {
  id: 0,
  name: "",
  amount: 0,
  date: new Date().toISOString().substring(0, 10),
  note: "",
  category_id: 0,
  category_type: "",
};

const state = reactive({
  ...initialState,
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
};

const v$ = useVuelidate(rules, state);

const dialogVisible = ref(false);

const showDialog = (recordData: Record) => {
  Object.assign(state, recordData);
  state.amount = Math.abs(state.amount) || 0;

  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const getCategoryObject = () => {
  const categoryObject = data.categories.find(
    (category) => category.name === selectedCategoryName.value
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

  if (selectedCategoryObject && selectedCategoryObject.id !== undefined) {
    state.category_id = selectedCategoryObject.id;
  }
  if (props.action === "Add Record") {
    state.amount *= selectedCategoryObject?.type === "expense" ? -1 : 1;
    const { id, ...record } = state;
    db.records
      .add(record)
      .then(() => {
        Object.assign(state, initialState);
        close();
        console.log("Record added successfully");
      })
      .catch((error) => {
        console.error("Error adding record:", error);
      });
  } else if (state.id !== undefined) {
    state.amount *= selectedCategoryObject?.type === "expense" ? -1 : 1;
    const { id, category_type, ...record } = state;
    db.records
      .update(state.id, record)
      .then(() => {
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
</style>
