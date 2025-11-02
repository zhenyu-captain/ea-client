<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Menu</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">
          <span>Home</span>
        </router-link>
        <router-link to="/test" class="nav-item">
          <span>Test Page</span>
        </router-link>
        <router-link to="/dashboard" class="nav-item active">
          <span>Dashboard</span>
        </router-link>
        <div class="nav-item logout-item" @click="handleLogout">
          <span>Logout</span>
        </div>
      </nav>
    </aside>

    <main class="dashboard-main">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <h1>Dashboard</h1>
            <p class="welcome-text">Welcome back, <span class="username">{{ user?.username }}</span></p>
          </div>
          <div class="header-actions">
            <button @click="refreshData" class="header-btn refresh-btn">
              <span class="btn-icon">🔄</span>
              Refresh
            </button>
            <button @click="goHome" class="header-btn home-btn">
              <span class="btn-icon">🏠</span>
              Go Home
            </button>
          </div>
        </div>
      </header>

      <div class="dashboard-content">
        <div class="user-info-card">
          <div class="card-header">
            <span class="card-icon">👤</span>
            <h2>User Information</h2>
          </div>
          <div class="user-details">
            <div class="detail-item">
              <div class="detail-icon">👤</div>
              <div class="detail-content">
                <span class="label">Username</span>
                <span class="value">{{ user?.username }}</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">📧</div>
              <div class="detail-content">
                <span class="label">Email</span>
                <span class="value">{{ user?.email }}</span>
              </div>
            </div>
            <div class="detail-item" v-if="user?.age">
              <div class="detail-icon">🎂</div>
              <div class="detail-content">
                <span class="label">Age</span>
                <span class="value">{{ user.age }} years old</span>
              </div>
            </div>
            <div class="detail-item" v-if="user?.city">
              <div class="detail-icon">📍</div>
              <div class="detail-content">
                <span class="label">City</span>
                <span class="value">{{ user.city }}</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">📅</div>
              <div class="detail-content">
                <span class="label">Registered</span>
                <span class="value">{{ formatDate(user?.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
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
  display: flex;
  background: #0f172a;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
}

.sidebar-header {
  padding: 2.5rem 2rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 10px;
  margin: 0.25rem 0.75rem;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  background: #60a5fa;
  border-radius: 0 4px 4px 0;
  transition: width 0.2s ease, height 0.2s ease;
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #f1f5f9;
}

.nav-item:hover::before {
  width: 3px;
  height: 20px;
}

.nav-item.active {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  font-weight: 600;
}

.nav-item.active::before {
  width: 3px;
  height: 24px;
  background: #60a5fa;
}

.logout-item {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: auto;
  color: #cbd5e1;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* Main Content */
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.dashboard-header {
  background: #ffffff;
  padding: 2.5rem 3rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-left h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.welcome-text {
  margin: 0;
  color: #64748b;
  font-size: 0.9375rem;
}

.username {
  color: #6366f1;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn {
  background: #6366f1;
  color: white;
}

.refresh-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.home-btn {
  background: #8b5cf6;
  color: white;
}

.home-btn:hover {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

.btn-icon {
  font-size: 1rem;
}

.dashboard-content {
  flex: 1;
  padding: 3rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.user-info-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.user-info-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-icon {
  font-size: 1.75rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(4px);
}

.detail-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-content .label {
  font-size: 0.8125rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-content .value {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 968px) {
  .sidebar {
    width: 240px;
  }

  .sidebar-header {
    padding: 2rem 1.5rem;
  }

  .dashboard-header {
    padding: 1.5rem 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-btn {
    flex: 1;
    min-width: 140px;
  }

  .dashboard-content {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 0.75rem 0;
  }

  .nav-item {
    white-space: nowrap;
    min-width: 120px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-item.active {
    border-bottom: 3px solid #60a5fa;
    border-right: 1px solid rgba(148, 163, 184, 0.1);
  }

  .nav-item.active::before {
    width: 100%;
    height: 4px;
    bottom: 0;
    top: auto;
    background: #60a5fa;
  }

  .logout-item {
    border-top: none;
    border-left: 1px solid rgba(148, 163, 184, 0.1);
  }

  .dashboard-content {
    padding: 1.5rem 1rem;
  }

  .user-info-card {
    padding: 1.5rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .detail-content {
    width: 100%;
  }
}
</style>

