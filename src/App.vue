<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/" class="router-link"> Home </RouterLink>
        <RouterLink to="/categories" class="router-link">
          Categories
        </RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  position: fixed;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  background-color: #00406c;
  backdrop-filter: blur(10px);
  font-weight: lighter;
  z-index: 999;
  max-height: 50px;
  width: 100%;
}

nav {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
}

.router-link {
  font-weight: 200;
  color: white;
  text-decoration: none;
  margin-top: 10px;
  margin-bottom: 0px;
}

nav a.router-link-exact-active {
  color: white;
  font-weight: bold;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav .v-tab {
  color: white;
}
</style>
