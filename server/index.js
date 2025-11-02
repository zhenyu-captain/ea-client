import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// 内存数据存储（实际项目中应使用数据库）
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 28, city: 'Beijing', createdAt: new Date().toISOString() },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 32, city: 'Shanghai', createdAt: new Date().toISOString() }
]

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express 服务器运行正常' })
})

// API 路由
app.get('/api/users', (req, res) => {
  try {
    res.json(users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

app.post('/api/users', (req, res) => {
  try {
    const { name, email, age, city } = req.body
    
    if (!name || !email) {
      return res.status(400).json({ error: '姓名和邮箱是必填项' })
    }

    // 检查邮箱是否已存在
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被使用' })
    }

    // 创建新用户
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name,
      email,
      age: age || null,
      city: city || null,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    console.log(`新用户已创建: ${newUser.name} (${newUser.email})`)
    
    res.status(201).json(newUser)
  } catch (error) {
    console.error('创建用户失败:', error)
    res.status(500).json({ error: '创建用户失败', details: error.message })
  }
})

app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const user = users.find(u => u.id === parseInt(id))
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    
    res.json(user)
  } catch (error) {
    console.error('获取用户失败:', error)
    res.status(500).json({ error: '获取用户失败' })
  }
})

app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, email, age, city } = req.body

    const userIndex = users.findIndex(u => u.id === parseInt(id))
    
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== users[userIndex].email) {
      const existingUser = users.find(u => u.email === email && u.id !== parseInt(id))
      if (existingUser) {
        return res.status(400).json({ error: '该邮箱已被其他用户使用' })
      }
    }

    // 更新用户信息
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      age: age !== undefined ? age : users[userIndex].age,
      city: city !== undefined ? city : users[userIndex].city,
      updatedAt: new Date().toISOString()
    }

    console.log(`用户已更新: ${users[userIndex].name} (ID: ${id})`)
    res.json(users[userIndex])
  } catch (error) {
    console.error('更新用户失败:', error)
    res.status(500).json({ error: '更新用户失败', details: error.message })
  }
})

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const userIndex = users.findIndex(u => u.id === parseInt(id))
    
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const deletedUser = users[userIndex]
    users = users.filter(u => u.id !== parseInt(id))
    
    console.log(`用户已删除: ${deletedUser.name} (ID: ${id})`)
    res.json({ message: `用户 ${deletedUser.name} 已删除`, id: parseInt(id) })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({ error: '删除用户失败', details: error.message })
  }
})

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: 'EA Client Express API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users'
    }
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Express 服务器运行在 http://localhost:${PORT}`)
  console.log(`📡 API 端点: http://localhost:${PORT}/api`)
  console.log(`❤️  健康检查: http://localhost:${PORT}/health`)
})

