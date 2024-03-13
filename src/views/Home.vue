<template>
  <fieldset>
    <legend>Add new transaction</legend>
    <label>
      Description:
      <input v-model="transactionDescription" type="text" />
    </label>
    <br />
    <label>
      Amount:
      <input v-model="transactionAmount" type="number" />
    </label>
    <br />
    <button @click="addTransaction">Add Transaction</button>
    <p>{{ status }}</p>
  </fieldset>
</template>

<script setup lang="ts">
import { db } from "../../db";

const defaultAmount: number = 0;

let status: string = "";
let transactionDescription: string = "";
let transactionAmount: number = defaultAmount;

async function addTransaction() {
  try {
    const id = await db.transactions.add({
      description: transactionDescription,
      amount: transactionAmount,
    });

    status = `Transaction ${transactionDescription} successfully added. Got id ${id}`;

    // Reset form:
    transactionDescription = "";
    transactionAmount = defaultAmount;
  } catch (error) {
    status = `Failed to add ${transactionDescription}: ${error}`;
  }
}
</script>
