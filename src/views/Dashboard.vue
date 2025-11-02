<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </header>

    <div class="dashboard-content">
      <div class="user-info-card">
        <h2>Profile</h2>
        <div class="user-details">
          <div class="detail-item">
            <span class="label">Username:</span>
            <span class="value">{{ user?.username }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Email:</span>
            <span class="value">{{ user?.email }}</span>
          </div>
          <div class="detail-item" v-if="user?.age">
            <span class="label">Age:</span>
            <span class="value">{{ user.age }} years old</span>
          </div>
          <div class="detail-item" v-if="user?.city">
            <span class="label">City:</span>
            <span class="value">{{ user.city }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Registered:</span>
            <span class="value">{{ formatDate(user?.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="actions-card">
        <h2>Actions</h2>
        <div class="action-buttons">
          <button @click="refreshData" class="action-btn">Refresh</button>
          <button @click="goHome" class="action-btn">Go Home</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

onMounted(() => {
  // 从 localStorage 获取用户信息
  const userStr = localStorage.getItem('user')
  const token = localStorage.getItem('token')

  if (!token || !userStr) {
    // 未登录，跳转到登录页
    router.push('/login')
    return
  }

  try {
    user.value = JSON.parse(userStr)
    // 可选：从服务器验证token并获取最新用户信息
    verifyToken()
  } catch (error) {
    console.error('解析用户信息失败:', error)
    router.push('/login')
  }
})

const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    } else {
      // Token 无效，清除并跳转登录
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  } catch (error) {
    console.error('验证token失败:', error)
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const refreshData = () => {
  verifyToken()
}

const goHome = () => {
  router.push('/')
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleString('en-US')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #667eea;
  font-size: 1.8rem;
}

.logout-btn {
  padding: 0.5rem 1.5rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #d32f2f;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.user-info-card,
.actions-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info-card h2,
.actions-card h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
}
</style>

