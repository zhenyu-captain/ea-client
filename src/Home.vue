<template>
  <div class="home-page">
    <header class="home-header">
      <h1>Hello vue</h1>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/test" class="nav-link">Test Page</router-link>
        <router-link to="/login" class="nav-link">Login/Register</router-link>
        <router-link v-if="isLoggedIn" to="/dashboard" class="nav-link">Dashboard</router-link>
      </div>
    </header>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 检查是否已登录
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.home-header {
  text-align: center;
}

.home-header h1 {
  font-size: 4rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease-in;
  margin-bottom: 2rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.nav-link {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
