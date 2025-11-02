import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 数据库文件路径
const DATA_DIR = join(__dirname, 'data')
const DB_FILE = join(DATA_DIR, 'ea-client.db')

// 确保数据目录存在
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// 创建数据库连接
const db = new Database(DB_FILE)

// 启用外键约束
db.pragma('foreign_keys = ON')

// 初始化数据库表
function initDatabase() {
  // 创建认证用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建普通用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INTEGER,
      city TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users(username);
    CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `)

  // 插入默认管理员账户（如果不存在）
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM auth_users WHERE username = ?').get('admin')
  if (adminExists.count === 0) {
    db.prepare(`
      INSERT INTO auth_users (username, email, password)
      VALUES (?, ?, ?)
    `).run('admin', 'admin@example.com', 'admin123')
    console.log('默认管理员账户已创建: admin / admin123')
  }

  // 插入示例数据（如果不存在）
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
  if (usersCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, age, city)
      VALUES (?, ?, ?, ?)
    `)
    insertUser.run('Alice', 'alice@example.com', 28, 'Beijing')
    insertUser.run('Bob', 'bob@example.com', 32, 'Shanghai')
    console.log('示例用户数据已创建')
  }

  console.log('数据库初始化完成')
}

// 初始化数据库
initDatabase()

// 导出数据库实例和常用操作
export default db

export const authUsersDB = {
  // 查找所有用户
  findAll: () => {
    return db.prepare('SELECT id, username, email, created_at FROM auth_users ORDER BY id DESC').all()
  },

  // 根据用户名查找用户
  findByUsername: (username) => {
    return db.prepare('SELECT * FROM auth_users WHERE username = ?').get(username)
  },

  // 根据邮箱查找用户
  findByEmail: (email) => {
    return db.prepare('SELECT * FROM auth_users WHERE email = ?').get(email)
  },

  // 根据用户名或邮箱查找用户
  findByUsernameOrEmail: (username, email) => {
    return db.prepare('SELECT * FROM auth_users WHERE username = ? OR email = ?').get(username, email)
  },

  // 根据 ID 查找用户
  findById: (id) => {
    return db.prepare('SELECT id, username, email, created_at FROM auth_users WHERE id = ?').get(id)
  },

  // 创建用户
  create: (username, email, password) => {
    const stmt = db.prepare(`
      INSERT INTO auth_users (username, email, password)
      VALUES (?, ?, ?)
    `)
    const result = stmt.run(username, email, password)
    return result.lastInsertRowid
  },

  // 更新用户
  update: (id, data) => {
    const fields = []
    const values = []
    
    if (data.username) {
      fields.push('username = ?')
      values.push(data.username)
    }
    if (data.email) {
      fields.push('email = ?')
      values.push(data.email)
    }
    if (data.password) {
      fields.push('password = ?')
      values.push(data.password)
    }
    
    if (fields.length === 0) return false
    
    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    
    const sql = `UPDATE auth_users SET ${fields.join(', ')} WHERE id = ?`
    const stmt = db.prepare(sql)
    stmt.run(...values)
    return true
  },

  // 删除用户
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM auth_users WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

export const usersDB = {
  // 查找所有用户
  findAll: () => {
    return db.prepare('SELECT * FROM users ORDER BY id DESC').all()
  },

  // 根据 ID 查找用户
  findById: (id) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  },

  // 根据邮箱查找用户
  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  },

  // 创建用户
  create: (name, email, age, city) => {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, age, city)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(name, email, age || null, city || null)
    return result.lastInsertRowid
  },

  // 更新用户
  update: (id, data) => {
    const fields = []
    const values = []
    
    if (data.name !== undefined) {
      fields.push('name = ?')
      values.push(data.name)
    }
    if (data.email !== undefined) {
      fields.push('email = ?')
      values.push(data.email)
    }
    if (data.age !== undefined) {
      fields.push('age = ?')
      values.push(data.age)
    }
    if (data.city !== undefined) {
      fields.push('city = ?')
      values.push(data.city)
    }
    
    if (fields.length === 0) return false
    
    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
    const stmt = db.prepare(sql)
    stmt.run(...values)
    return true
  },

  // 删除用户
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

