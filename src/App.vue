<template>
  <div id="app">
    <header>
      <h1>EA Client</h1>
      <p>Vue 3 应用程序</p>
    </header>
    <main>
      <div class="card">
        <h2>欢迎使用 Vue 3</h2>
        
        <!-- SQLite 问候语 -->
        <div class="sqlite-section">
          <h3>SQLite 集成</h3>
          <div class="greeting" v-if="greeting">
            {{ greeting }}
          </div>
          <div class="loading" v-else>
            正在初始化数据库...
          </div>
        </div>

        <!-- MongoDB 风格的文档数据库 -->
        <div class="mongodb-section">
          <h3>MongoDB 风格数据库 (LokiJS)</h3>
          <div v-if="usersLoading" class="loading">
            正在加载用户数据...
          </div>
          <div v-else>
            <div class="user-count">
              用户总数: {{ userCount }}
            </div>
            <div class="users-list">
              <div 
                v-for="user in users" 
                :key="user.$loki" 
                class="user-item"
              >
                <div class="user-name">{{ user.name }}</div>
                <div class="user-details">
                  <span>📧 {{ user.email }}</span>
                  <span>🎂 {{ user.age }} 岁</span>
                  <span>📍 {{ user.city }}</span>
                </div>
              </div>
            </div>
            <div class="user-actions">
              <button @click="addRandomUser" class="action-btn">添加随机用户</button>
              <button @click="refreshUsers" class="action-btn">刷新列表</button>
            </div>
          </div>
        </div>

        <div class="counter-section">
          <p>当前计数: {{ count }}</p>
          <div class="buttons">
            <button @click="increment">增加</button>
            <button @click="decrement">减少</button>
            <button @click="reset">重置</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)
const greeting = ref('正在加载...')
const users = ref([])
const usersLoading = ref(true)
const userCount = ref(0)

// 刷新用户列表
async function refreshUsers() {
  try {
    const { getAllUsers, getUserCount } = await import('./db/mongodb.js')
    users.value = getAllUsers()
    userCount.value = getUserCount()
    usersLoading.value = false
  } catch (error) {
    console.error('获取用户失败:', error)
    usersLoading.value = false
  }
}

// 添加随机用户
async function addRandomUser() {
  try {
    const { addUser } = await import('./db/mongodb.js')
    const names = ['Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
    const cities = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Chengdu']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomCity = cities[Math.floor(Math.random() * cities.length)]
    const randomAge = Math.floor(Math.random() * 30) + 20
    
    addUser({
      name: randomName,
      email: `${randomName.toLowerCase()}@example.com`,
      age: randomAge,
      city: randomCity
    })
    
    await refreshUsers()
  } catch (error) {
    console.error('添加用户失败:', error)
  }
}

// 初始化 SQLite 数据库
onMounted(async () => {
  try {
    // 动态导入以避免阻塞整个应用
    const { initDatabase, getGreeting } = await import('./db/sqlite.js')
    await initDatabase()
    greeting.value = getGreeting()
  } catch (error) {
    console.error('数据库初始化失败:', error)
    greeting.value = 'Hello SQLite'
  }

  // 初始化 MongoDB 风格的数据库
  try {
    const { initDatabase } = await import('./db/mongodb.js')
    await initDatabase()
    await refreshUsers()
  } catch (error) {
    console.error('MongoDB 风格数据库初始化失败:', error)
    usersLoading.value = false
  }
})

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}

const reset = () => {
  count.value = 0
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  font-size: 2.5rem;
  color: #42b983;
  margin-bottom: 0.5rem;
}

header p {
  color: #666;
  font-size: 1.1rem;
}

main {
  width: 100%;
  max-width: 600px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
  color: #333;
}

.sqlite-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.sqlite-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: white;
}

.greeting {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

.loading {
  text-align: center;
  padding: 1rem;
  font-style: italic;
  opacity: 0.9;
}

.mongodb-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 8px;
  color: white;
}

.mongodb-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: white;
}

.user-count {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.users-list {
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  backdrop-filter: blur(10px);
}

.user-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.user-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.counter-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.counter-section p {
  font-size: 1.5rem;
  margin: 1.5rem 0;
  font-weight: bold;
  color: #42b983;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

button:hover {
  background: #35a372;
}

button:active {
  transform: scale(0.98);
}
</style>

