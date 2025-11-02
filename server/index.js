import express from 'express'
import cors from 'cors'
import { authUsersDB, usersDB } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

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
    const allUsers = usersDB.findAll()
    res.json(allUsers)
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
    const existingUser = usersDB.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被使用' })
    }

    // 创建新用户
    const userId = usersDB.create(name, email, age, city)
    const newUser = usersDB.findById(userId)
    
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
    const user = usersDB.findById(parseInt(id))
    
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

    const existingUser = usersDB.findById(parseInt(id))
    if (!existingUser) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== existingUser.email) {
      const userWithEmail = usersDB.findByEmail(email)
      if (userWithEmail) {
        return res.status(400).json({ error: '该邮箱已被其他用户使用' })
      }
    }

    // 更新用户信息
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (age !== undefined) updateData.age = age
    if (city !== undefined) updateData.city = city

    usersDB.update(parseInt(id), updateData)
    const updatedUser = usersDB.findById(parseInt(id))
    
    console.log(`用户已更新: ${updatedUser.name} (ID: ${id})`)
    res.json(updatedUser)
  } catch (error) {
    console.error('更新用户失败:', error)
    res.status(500).json({ error: '更新用户失败', details: error.message })
  }
})

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const user = usersDB.findById(parseInt(id))
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const deleted = usersDB.delete(parseInt(id))
    if (!deleted) {
      return res.status(500).json({ error: '删除用户失败' })
    }
    
    console.log(`用户已删除: ${user.name} (ID: ${id})`)
    res.json({ message: `用户 ${user.name} 已删除`, id: parseInt(id) })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({ error: '删除用户失败', details: error.message })
  }
})

// 认证相关路由
// 用户注册
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, email } = req.body
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: '用户名、密码和邮箱都是必填项' })
    }

    // 检查用户名或邮箱是否已存在
    const existingUser = authUsersDB.findByUsernameOrEmail(username, email)
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已被注册' })
    }

    // 创建新用户
    const userId = authUsersDB.create(username, email, password)
    const newUser = authUsersDB.findById(userId)
    
    // 生成简单的 token（实际项目中应该使用 JWT）
    const token = `token_${Date.now()}_${newUser.id}`
    
    console.log(`新用户注册: ${newUser.username} (${newUser.email})`)
    
    res.status(201).json({
      token,
      user: newUser
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({ error: '注册失败', details: error.message })
  }
})

// 用户登录
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必填项' })
    }

    // 查找用户
    const user = authUsersDB.findByUsername(username)
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 验证密码
    if (user.password !== password) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 生成 token
    const token = `token_${Date.now()}_${user.id}`
    
    console.log(`用户登录: ${user.username}`)
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user
    res.json({
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ error: '登录失败', details: error.message })
  }
})

// 获取当前用户信息（需要认证）
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权，请先登录' })
    }

    const token = authHeader.substring(7)
    // 从 token 中提取用户 ID（简单实现）
    const userId = parseInt(token.split('_')[2])
    const user = authUsersDB.findById(userId)
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    res.json({
      user
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ error: '获取用户信息失败', details: error.message })
  }
})

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: 'EA Client Express API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      }
    }
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Express 服务器运行在 http://localhost:${PORT}`)
  console.log(`📡 API 端点: http://localhost:${PORT}/api`)
  console.log(`❤️  健康检查: http://localhost:${PORT}/health`)
})

