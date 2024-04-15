<template>
  <v-dialog class="v-dialog" v-model="dialogVisible" max-width="500px">
    <v-card class="v-card">
      <v-card-title class="dialog-header">
        <h1 style="color: white" class="headline white--text">
          Delete {{ action }}
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
      <v-card-text style="color: white">
        <div class="text-confirmation">
          <h4>
            Are you sure you want to delete this {{ action.toLowerCase() }}?
          </h4>
        </div>
        <h6 class="associated">{{ associated }}</h6>
        <div class="delete-record">
          <v-btn
            style="background-color: #fa3e3e"
            class="trash-button"
            @click="confirmed()"
            >Delete</v-btn
          >
          <v-btn
            variant="outlined"
            click="close"
            class="trash-button"
            @click="close"
            >Cancel</v-btn
          >
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, defineExpose } from "vue";

const emits = defineEmits(["confirmed"]);
defineProps(["action", "associated"]);

const dialogVisible = ref(false);

const showDialog = () => {
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const confirmed = () => {
  emits("confirmed");
  close();
};

defineExpose({
  showDialog,
  close,
});
</script>

<style scoped>
.v-dialog {
  max-width: 700px;
}

.text-confirmation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.associated {
  color: rgb(173, 173, 173);
  margin-top: 10px;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
}

.trash-button {
  color: white;
}
</style>
