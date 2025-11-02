<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Exam center</h2>
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
            <button @click="showProfile" class="header-btn userinfo-btn">
              <span class="btn-icon">👤</span>
              UserInfo
            </button>
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
        <!-- 顶部 - 2个图表 -->
        <div class="chart-section">
          <div class="chart-card">
            <v-chart :option="chartOption1" class="chart" />
          </div>
          <div class="chart-card">
            <v-chart :option="chartOption2" class="chart" />
          </div>
        </div>

        <!-- D3 图表区域 -->
        <div class="chart-section">
          <div class="chart-card d3-chart-card">
            <h3 class="d3-chart-title">Monthly Revenue (D3 Bar Chart)</h3>
            <div ref="d3Chart1" class="d3-chart"></div>
          </div>
          <div class="chart-card d3-chart-card">
            <h3 class="d3-chart-title">Data Distribution (D3 Scatter Plot)</h3>
            <div ref="d3Chart2" class="d3-chart"></div>
          </div>
        </div>
      </div>
    </main>

    <!-- Profile Information Modal -->
    <div v-if="showProfileModal" class="modal-overlay" @click="closeProfile">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Profile Information</h2>
          <button class="close-btn" @click="closeProfile">×</button>
        </div>
        <div class="modal-body">
          <div class="profile-detail-item">
            <div class="profile-detail-icon">👤</div>
            <div class="profile-detail-content">
              <span class="profile-label">Username</span>
              <span class="profile-value">{{ user?.username }}</span>
            </div>
          </div>
          <div class="profile-detail-item">
            <div class="profile-detail-icon">📧</div>
            <div class="profile-detail-content">
              <span class="profile-label">Email</span>
              <span class="profile-value">{{ user?.email }}</span>
            </div>
          </div>
          <div class="profile-detail-item" v-if="user?.age">
            <div class="profile-detail-icon">🎂</div>
            <div class="profile-detail-content">
              <span class="profile-label">Age</span>
              <span class="profile-value">{{ user.age }} years old</span>
            </div>
          </div>
          <div class="profile-detail-item" v-if="user?.city">
            <div class="profile-detail-icon">📍</div>
            <div class="profile-detail-content">
              <span class="profile-label">City</span>
              <span class="profile-value">{{ user.city }}</span>
            </div>
          </div>
          <div class="profile-detail-item">
            <div class="profile-detail-icon">📅</div>
            <div class="profile-detail-content">
              <span class="profile-label">Registered</span>
              <span class="profile-value">{{ formatDate(user?.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as d3 from 'd3'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 提供主题（可选）
provide(THEME_KEY, 'default')

const router = useRouter()
const user = ref(null)
const showProfileModal = ref(false)
const d3Chart1 = ref(null)
const d3Chart2 = ref(null)

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

  // 初始化 D3 图表
  nextTick(() => {
    if (d3Chart1.value) {
      initD3BarChart()
    }
    if (d3Chart2.value) {
      initD3ScatterPlot()
    }
  })
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

const showProfile = () => {
  showProfileModal.value = true
}

const closeProfile = () => {
  showProfileModal.value = false
}

// 图表配置
const chartOption1 = ref({
  title: {
    text: 'Sales Trend',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Sales',
      type: 'line',
      data: [120, 132, 101, 134, 90, 230],
      smooth: true,
      itemStyle: {
        color: '#6366f1'
      }
    }
  ]
})

const chartOption2 = ref({
  title: {
    text: 'Product Distribution',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      name: 'Product',
      type: 'pie',
      radius: '60%',
      data: [
        { value: 1048, name: 'Product A' },
        { value: 735, name: 'Product B' },
        { value: 580, name: 'Product C' },
        { value: 484, name: 'Product D' },
        { value: 300, name: 'Product E' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// D3 图表初始化函数
const initD3BarChart = () => {
  // 清空容器
  d3.select(d3Chart1.value).selectAll('*').remove()

  // 数据
  const data = [
    { month: 'Jan', value: 4500 },
    { month: 'Feb', value: 5200 },
    { month: 'Mar', value: 4800 },
    { month: 'Apr', value: 6100 },
    { month: 'May', value: 5800 },
    { month: 'Jun', value: 7200 }
  ]

  // 设置尺寸和边距
  const margin = { top: 40, right: 30, bottom: 50, left: 60 }
  const width = d3Chart1.value.clientWidth - margin.left - margin.right
  const height = 280 - margin.top - margin.bottom

  // 创建 SVG
  const svg = d3.select(d3Chart1.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 创建比例尺
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([0, width])
    .padding(0.2)

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) * 1.1])
    .nice()
    .range([height, 0])

  // 创建渐变色
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'bar-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#6366f1')

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#8b5cf6')

  // 添加网格线
  svg.selectAll('.grid-line')
    .data(yScale.ticks(5))
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', '#e2e8f0')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3')

  // 添加条形
  const bars = svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.month))
    .attr('width', xScale.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('fill', 'url(#bar-gradient)')
    .attr('rx', 4)

  // 添加动画
  bars.transition()
    .duration(800)
    .delay((d, i) => i * 100)
    .attr('y', d => yScale(d.value))
    .attr('height', d => height - yScale(d.value))

  // 添加数值标签
  svg.selectAll('.bar-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => xScale(d.month) + xScale.bandwidth() / 2)
    .attr('y', d => yScale(d.value) - 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .attr('fill', '#64748b')
    .text(d => d.value)
    .attr('opacity', 0)
    .transition()
    .delay(1000)
    .attr('opacity', 1)

  // 添加 X 轴
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .attr('class', 'axis')
    .selectAll('text')
    .attr('font-size', '11px')
    .attr('fill', '#64748b')

  // 添加 Y 轴
  svg.append('g')
    .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`))
    .attr('class', 'axis')
    .selectAll('text')
    .attr('font-size', '11px')
    .attr('fill', '#64748b')

  // 移除默认的轴样式
  svg.selectAll('.axis line, .axis path')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 1)

  svg.selectAll('.axis .tick line')
    .attr('stroke', '#cbd5e1')
}

const initD3ScatterPlot = () => {
  // 清空容器
  d3.select(d3Chart2.value).selectAll('*').remove()

  // 生成随机数据
  const data = Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    value: Math.random() * 1000 + 100
  }))

  // 设置尺寸和边距
  const margin = { top: 40, right: 30, bottom: 50, left: 60 }
  const width = d3Chart2.value.clientWidth - margin.left - margin.right
  const height = 280 - margin.top - margin.bottom

  // 创建 SVG
  const svg = d3.select(d3Chart2.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 创建比例尺
  const xScale = d3.scaleLinear()
    .domain([0, 100])
    .nice()
    .range([0, width])

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .nice()
    .range([height, 0])

  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.value)])
    .range([3, 15])

  // 创建颜色比例尺
  const colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain([0, d3.max(data, d => d.value)])

  // 添加网格线
  const xTicks = xScale.ticks(5)
  const yTicks = yScale.ticks(5)

  svg.selectAll('.grid-line-x')
    .data(xTicks)
    .enter()
    .append('line')
    .attr('class', 'grid-line-x')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#e2e8f0')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3')

  svg.selectAll('.grid-line-y')
    .data(yTicks)
    .enter()
    .append('line')
    .attr('class', 'grid-line-y')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', '#e2e8f0')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3')

  // 添加散点
  const dots = svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 0)
    .attr('fill', d => colorScale(d.value))
    .attr('opacity', 0.7)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)

  // 添加动画
  dots.transition()
    .duration(1000)
    .delay((d, i) => i * 20)
    .attr('r', d => radiusScale(d.value))
    .attr('opacity', 0.8)

  // 添加交互效果
  dots.on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', radiusScale(d.value) * 1.3)
        .attr('opacity', 1)
        .attr('stroke-width', 3)

      // 显示工具提示
      const tooltip = svg.append('g')
        .attr('class', 'tooltip')
        .attr('transform', `translate(${xScale(d.x)},${yScale(d.y)})`)

      tooltip.append('rect')
        .attr('x', -40)
        .attr('y', -25)
        .attr('width', 80)
        .attr('height', 20)
        .attr('fill', 'rgba(0, 0, 0, 0.8)')
        .attr('rx', 4)

      tooltip.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -10)
        .attr('fill', '#fff')
        .attr('font-size', '11px')
        .text(`Value: ${Math.round(d.value)}`)
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', radiusScale(d.value))
        .attr('opacity', 0.8)
        .attr('stroke-width', 2)

      svg.select('.tooltip').remove()
    })

  // 添加 X 轴
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .attr('class', 'axis')
    .selectAll('text')
    .attr('font-size', '11px')
    .attr('fill', '#64748b')

  // 添加 Y 轴
  svg.append('g')
    .call(d3.axisLeft(yScale))
    .attr('class', 'axis')
    .selectAll('text')
    .attr('font-size', '11px')
    .attr('fill', '#64748b')

  // 移除默认的轴样式
  svg.selectAll('.axis line, .axis path')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 1)

  // 添加轴标签
  svg.append('text')
    .attr('transform', `translate(${width / 2}, ${height + 40})`)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#64748b')
    .text('X Axis')

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -45)
    .attr('x', -height / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#64748b')
    .text('Y Axis')
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

.userinfo-btn {
  background: #10b981;
  color: white;
}

.userinfo-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-icon {
  font-size: 1rem;
}

.dashboard-content {
  flex: 1;
  padding: 2rem 3rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow-y: auto;
}

.chart-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  height: 350px;
}

.chart-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.chart {
  width: 100%;
  height: 100%;
}

.d3-chart-card {
  display: flex;
  flex-direction: column;
}

.d3-chart-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
}

.d3-chart {
  flex: 1;
  width: 100%;
  min-height: 320px;
}

.d3-chart svg {
  width: 100%;
  height: 100%;
}

.d3-chart .bar:hover {
  opacity: 0.9;
  cursor: pointer;
}

.d3-chart .dot:hover {
  cursor: pointer;
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
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .chart-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .chart-card {
    height: 300px;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 2.5rem;
}

.profile-detail-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.profile-detail-item:last-child {
  margin-bottom: 0;
}

.profile-detail-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(4px);
}

.profile-detail-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.profile-detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-label {
  font-size: 0.8125rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.profile-value {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }
}
</style>

