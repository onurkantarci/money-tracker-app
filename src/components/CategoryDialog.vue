<template>
  <v-dialog v-model="dialogVisible" max-width="500px">
    <v-card class="dialog-card">
      <v-card-title class="dialog-header">
        <h1 class="headline white--text">Category Dialog</h1>
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
        <div class="whole-categories-container">
          <v-form @submit.prevent="saveCategory">
            <div class="radio-buttons">
              <v-radio-group label="Category Type" v-model="selectedOption">
                <v-radio
                  color="primary"
                  label="Income"
                  value="income"
                ></v-radio>
                <v-radio
                  color="primary"
                  label="Expense"
                  value="expense"
                ></v-radio>
              </v-radio-group>
            </div>
            <div class="name-input">
              <v-text-field
                :error-messages="
                  v$.name.$errors?.map((e) => e.$message).join(', ')
                "
                clearable
                @blur="v$.name.$touch"
                @input="v$.name.$touch"
                label="Category Name"
                v-model="state.name"
              ></v-text-field>
            </div>
            <div class="bottom-buttons">
              <v-btn
                color="rgb(12, 56, 84)"
                size="small"
                type="button"
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="rgb(12, 56, 84)"
                size="small"
                type="submit"
                @click="v$.$validate"
              >
                Save Category
              </v-btn>
            </div>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineExpose, reactive } from "vue";
import { db } from "../../db";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

const selectedOption = ref<string>("income");
const dialogVisible = ref(false);

const initialState = {
  name: "",
};

const state = reactive({
  ...initialState,
});

const rules = {
  name: { required },
};

const v$ = useVuelidate(rules, state);

async function saveCategory() {
  if (v$.value.$invalid) {
    console.log("Validation failed, not saving category.");
    return;
  }

  try {
    await db.categories.add({
      name: state.name,
      type: selectedOption.value,
    });
    v$.value.$reset();
    Object.assign(state, initialState);
    close();
  } catch (error) {
    console.error(`Error saving category: ${error}`);
  }
}

const showDialog = () => {
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
  v$.value.$reset();
};

defineExpose({
  showDialog,
  close,
});
</script>

<style scoped>
.dialog-card {
  background-color: #001e45;
  color: white;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 30px;
  border-bottom: 1px solid black;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.18);
}

.whole-categories-container {
  color: white;
  padding: 50px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.name-input {
  margin-bottom: 40px;
}

.radio-buttons {
  width: 300px;
}

.bottom-buttons {
  display: flex;
  gap: 100px;
}

.v-btn {
  color: white;
}
</style>
