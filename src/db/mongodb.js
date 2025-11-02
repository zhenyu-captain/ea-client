// LokiJS 数据库实例（类似 MongoDB 的文档型数据库）
let db = null
let usersCollection = null
let Loki = null

/**
 * 初始化 LokiJS 数据库
 * LokiJS 是一个内存文档数据库，支持持久化到 LocalStorage
 */
export async function initDatabase() {
  try {
    // 动态导入 LokiJS
    const lokiModule = await import('lokijs').catch(err => {
      console.error('无法导入 lokijs:', err)
      throw new Error('LokiJS 模块加载失败，请确保已运行 npm install')
    })
    
    Loki = lokiModule.default || lokiModule

    // 创建数据库实例，使用 LocalStorage 持久化
    db = new Loki('ea-client-db', {
      adapter: new Loki.LokiLocalStorageAdapter(),
      autoload: true,
      autosave: true,
      autosaveInterval: 4000 // 每 4 秒自动保存
    })

    // 等待数据库加载完成
    return new Promise((resolve, reject) => {
      db.loadDatabase({}, (err) => {
        if (err) {
          console.error('数据库加载失败:', err)
          reject(err)
          return
        }

        // 获取或创建 users 集合（类似 MongoDB 的 collection）
        usersCollection = db.getCollection('users')
        if (!usersCollection) {
          usersCollection = db.addCollection('users', {
            indices: ['name', 'email'], // 创建索引以提高查询性能
            unique: ['email'] // email 字段唯一
          })
        }

        // 如果集合为空，插入示例数据
        if (usersCollection.count() === 0) {
          usersCollection.insert([
            {
              name: 'Alice',
              email: 'alice@example.com',
              age: 28,
              city: 'Beijing',
              createdAt: new Date()
            },
            {
              name: 'Bob',
              email: 'bob@example.com',
              age: 32,
              city: 'Shanghai',
              createdAt: new Date()
            }
          ])
        }

        resolve(db)
      })
    })
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

/**
 * 获取所有用户
 */
export function getAllUsers() {
  if (!usersCollection) {
    throw new Error('数据库未初始化')
  }
  return usersCollection.find()
}

/**
 * 根据条件查询用户（类似 MongoDB 的 find）
 */
export function findUsers(query = {}) {
  if (!usersCollection) {
    throw new Error('数据库未初始化')
  }
  return usersCollection.find(query)
}

/**
 * 添加新用户（类似 MongoDB 的 insertOne）
 */
export function addUser(user) {
  if (!usersCollection) {
    throw new Error('数据库未初始化')
  }
  const newUser = {
    ...user,
    createdAt: new Date(),
    _id: undefined // LokiJS 会自动生成 _id
  }
  return usersCollection.insert(newUser)
}

/**
 * 更新用户（类似 MongoDB 的 updateOne）
 */
export function updateUser(query, updateData) {
  if (!usersCollection) {
    throw new Error('数据库未初始化')
  }
  const user = usersCollection.findOne(query)
  if (user) {
    Object.assign(user, updateData)
    usersCollection.update(user)
    return user
  }
  return null
}

/**
 * 删除用户（类似 MongoDB 的 deleteOne）
 */
export function deleteUser(query) {
  if (!usersCollection) {
    throw new Error('数据库未初始化')
  }
  const user = usersCollection.findOne(query)
  if (user) {
    usersCollection.remove(user)
    return true
  }
  return false
}

/**
 * 获取用户数量
 */
export function getUserCount() {
  if (!usersCollection) {
    throw new Error('数据库未初始化')
  }
  return usersCollection.count()
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  return db
}

/**
 * 获取集合实例
 */
export function getCollection(name) {
  if (!db) {
    throw new Error('数据库未初始化')
  }
  return db.getCollection(name) || db.addCollection(name)
}

