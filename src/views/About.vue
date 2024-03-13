<template>
  <ul>
    <li v-for="transaction in transactions" :key="transaction.id">
      {{ transaction.description }}, {{ transaction.amount }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import { db } from "../../db";

interface Transaction {
  id?: number;
  description: string;
  amount: number;
  date?: Date;
}

const transactions: Transaction[] = useObservable(
  liveQuery(() => db.transactions.toArray())
);
</script>
