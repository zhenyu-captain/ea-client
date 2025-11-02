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
                :key="user.$loki || user.id" 
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

        <!-- Express API -->
        <div class="express-section">
          <h3>Express 后端 API</h3>
          <div v-if="expressLoading" class="loading">
            正在连接 Express 服务器...
          </div>
          <div v-else>
            <div class="express-stats">
              <div class="stat-item">
                <span class="stat-label">后端用户数:</span>
                <span class="stat-value">{{ expressUserCount }}</span>
              </div>
              <div class="stat-item" :class="{ 'status-ok': expressConnected, 'status-error': !expressConnected }">
                <span class="stat-label">连接状态:</span>
                <span class="stat-value">{{ expressConnected ? '✅ 已连接' : '❌ 未连接' }}</span>
              </div>
            </div>
            <div v-if="!expressConnected" class="express-warning">
              <p>⚠️ Express 服务器未启动</p>
              <p class="help-text">请在终端运行: <code>npm run server</code> 或 <code>npm run dev:all</code></p>
            </div>
            <div class="express-users">
              <h4>Express 用户列表:</h4>
              <div class="users-list">
                <div 
                  v-for="user in expressUsers" 
                  :key="user.id" 
                  class="user-item"
                >
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-details">
                    <span>📧 {{ user.email }}</span>
                    <span v-if="user.age">🎂 {{ user.age }} 岁</span>
                    <span v-if="user.city">📍 {{ user.city }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="express-actions">
              <button @click="addExpressUser" class="action-btn">添加 Express 用户</button>
              <button @click="refreshExpress" class="action-btn">刷新列表</button>
            </div>
          </div>
        </div>

        <!-- Prisma 风格的 ORM -->
        <div class="prisma-section">
          <h3>Prisma 风格 ORM</h3>
          <div v-if="prismaLoading" class="loading">
            正在初始化 Prisma...
          </div>
          <div v-else>
            <div class="prisma-stats">
              <div class="stat-item">
                <span class="stat-label">用户数:</span>
                <span class="stat-value">{{ prismaUserCount }}</span>
              </div>
            </div>
            <div class="prisma-users">
              <h4>Prisma 用户列表:</h4>
              <div class="users-list">
                <div 
                  v-for="user in prismaUsers" 
                  :key="user.id" 
                  class="user-item"
                >
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-details">
                    <span>📧 {{ user.email }}</span>
                    <span v-if="user.age">🎂 {{ user.age }} 岁</span>
                    <span v-if="user.city">📍 {{ user.city }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="prisma-actions">
              <button @click="addPrismaUser" class="action-btn">添加 Prisma 用户</button>
              <button @click="refreshPrisma" class="action-btn">刷新列表</button>
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

// Prisma 相关状态
const prismaLoading = ref(true)
const prismaUsers = ref([])
const prismaUserCount = ref(0)

// Express API 相关状态
const expressLoading = ref(true)
const expressUsers = ref([])
const expressUserCount = ref(0)
const expressConnected = ref(false)

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

  // 初始化 Prisma 风格的数据库
  try {
    const { initPrisma, prisma } = await import('./db/prisma.js')
    await initPrisma()
    await refreshPrisma()
  } catch (error) {
    console.error('Prisma 初始化失败:', error)
    prismaLoading.value = false
  }

  // 初始化 Express API 连接
  await checkExpressConnection()
  await refreshExpress()
})

// 刷新 Prisma 数据
async function refreshPrisma() {
  try {
    const { prisma } = await import('./db/prisma.js')
    prismaUsers.value = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    prismaUserCount.value = await prisma.user.count()
    prismaLoading.value = false
  } catch (error) {
    console.error('刷新 Prisma 数据失败:', error)
    prismaLoading.value = false
  }
}

// 添加 Prisma 用户
async function addPrismaUser() {
  try {
    const { prisma } = await import('./db/prisma.js')
    const names = ['David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy']
    const cities = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Chengdu']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomCity = cities[Math.floor(Math.random() * cities.length)]
    const randomAge = Math.floor(Math.random() * 30) + 20
    
    await prisma.user.create({
      data: {
        name: randomName,
        email: `${randomName.toLowerCase()}@prisma.example.com`,
        age: randomAge,
        city: randomCity
      }
    })
    
    await refreshPrisma()
  } catch (error) {
    console.error('添加 Prisma 用户失败:', error)
  }
}

// 检查 Express 服务器连接
async function checkExpressConnection() {
  try {
    const response = await fetch('/api/health', {
      signal: AbortSignal.timeout(2000) // 2秒超时
    })
    if (response.ok) {
      expressConnected.value = true
      return true
    } else {
      expressConnected.value = false
      return false
    }
  } catch (error) {
    console.warn('Express 服务器未启动，请运行: npm run server 或 npm run dev:all')
    expressConnected.value = false
    return false
  }
}

// 刷新 Express 用户列表
async function refreshExpress() {
  try {
    expressLoading.value = true
    const response = await fetch('/api/users', {
      signal: AbortSignal.timeout(2000) // 2秒超时
    })
    if (response.ok) {
      expressUsers.value = await response.json()
      expressUserCount.value = expressUsers.value.length
      expressConnected.value = true
    } else {
      expressConnected.value = false
    }
    expressLoading.value = false
  } catch (error) {
    if (error.name === 'AbortError' || error.message.includes('ECONNREFUSED')) {
      console.warn('Express 服务器未启动，请运行: npm run server')
      expressConnected.value = false
    } else {
      console.error('获取 Express 用户失败:', error)
      expressConnected.value = false
    }
    expressLoading.value = false
  }
}

// 添加 Express 用户
async function addExpressUser() {
  try {
    const names = ['Jack', 'Kelly', 'Leo', 'Mia', 'Noah', 'Olivia']
    const cities = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Chengdu']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomCity = cities[Math.floor(Math.random() * cities.length)]
    const randomAge = Math.floor(Math.random() * 30) + 20

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: randomName,
        email: `${randomName.toLowerCase()}@express.example.com`,
        age: randomAge,
        city: randomCity
      }),
      signal: AbortSignal.timeout(5000) // 5秒超时
    })

    if (response.ok) {
      const newUser = await response.json()
      console.log('用户创建成功:', newUser)
      await refreshExpress()
    } else {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }))
      console.error('添加用户失败:', errorData.error || '服务器错误')
      alert(`添加用户失败: ${errorData.error || '服务器错误'}`)
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('请求超时')
      alert('添加用户超时，请检查网络连接')
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('Express 服务器未启动')
      alert('Express 服务器未启动，请运行: npm run server')
    } else {
      console.error('添加 Express 用户失败:', error)
      alert(`添加用户失败: ${error.message}`)
    }
  }
}


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

.express-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 8px;
  color: white;
}

.express-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: white;
}

.express-section h4 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
  color: white;
  opacity: 0.9;
}

.express-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.status-ok {
  background: rgba(76, 175, 80, 0.3) !important;
}

.status-error {
  background: rgba(244, 67, 54, 0.3) !important;
}

.express-users {
  margin-bottom: 1rem;
}

.express-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.express-warning {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.express-warning p {
  margin: 0.5rem 0;
}

.help-text {
  font-size: 0.85rem;
  opacity: 0.9;
}

.help-text code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.prisma-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8px;
  color: white;
}

.prisma-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: white;
}

.prisma-section h4 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
  color: white;
  opacity: 0.9;
}

.prisma-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  backdrop-filter: blur(10px);
}

.stat-label {
  margin-right: 0.5rem;
  opacity: 0.9;
}

.stat-value {
  font-weight: bold;
  font-size: 1.1rem;
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

