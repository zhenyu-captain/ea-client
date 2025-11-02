// Prisma 风格的 API（浏览器端实现）
// 使用 LokiJS 作为底层存储，提供类似 Prisma 的 API

import { initDatabase, getCollection, getDatabase } from './mongodb.js'

let initialized = false

/**
 * 初始化 Prisma 风格的数据库
 */
export async function initPrisma() {
  if (initialized) {
    return
  }

  try {
    await initDatabase()
    
    // 确保集合存在并创建索引
    const db = getDatabase()
    let usersCollection = db.getCollection('users')
    let postsCollection = db.getCollection('posts')
    
    if (!usersCollection) {
      usersCollection = db.addCollection('users', {
        indices: ['email'],
        unique: ['email']
      })
    }
    
    if (!postsCollection) {
      postsCollection = db.addCollection('posts')
    }

    // 为 users 集合创建索引
    if (!usersCollection.indices || usersCollection.indices.length === 0) {
      usersCollection.ensureIndex('email')
      usersCollection.ensureUniqueIndex('email')
    }

    initialized = true
    return true
  } catch (error) {
    console.error('Prisma 初始化失败:', error)
    throw error
  }
}

/**
 * Prisma Client 风格的 API
 */
export const prisma = {
  user: {
    // 查找所有用户
    findMany: async (options = {}) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('users')
      
      let results = collection.find(options.where || {})
      
      // 支持 orderBy
      if (options.orderBy) {
        const [field, direction] = Object.entries(options.orderBy)[0]
        results.sort((a, b) => {
          const aVal = a[field]
          const bVal = b[field]
          if (direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
          }
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        })
      }

      // 支持 take (limit)
      if (options.take) {
        results = results.slice(0, options.take)
      }

      // 支持 skip
      if (options.skip) {
        results = results.slice(options.skip)
      }

      return results.map(cleanDocument)
    },

    // 查找单个用户
    findUnique: async (where) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('users')
      const user = collection.findOne(where)
      return user ? cleanDocument(user) : null
    },

    // 查找第一个匹配的用户
    findFirst: async (options = {}) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('users')
      const user = collection.findOne(options.where || {})
      return user ? cleanDocument(user) : null
    },

    // 创建用户
    create: async (data) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('users')
      const newUser = {
        id: generateId(),
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const inserted = collection.insert(newUser)
      return cleanDocument(inserted)
    },

    // 更新用户
    update: async ({ where, data }) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('users')
      const user = collection.findOne(where)
      if (!user) {
        throw new Error('用户不存在')
      }
      
      Object.assign(user, data, { updatedAt: new Date() })
      collection.update(user)
      return cleanDocument(user)
    },

    // 删除用户
    delete: async (where) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('users')
      const user = collection.findOne(where)
      if (!user) {
        throw new Error('用户不存在')
      }
      collection.remove(user)
      return cleanDocument(user)
    },

    // 计数
    count: async (options = {}) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('users')
      if (options.where) {
        return collection.find(options.where).length
      }
      return collection.count()
    }
  },

  post: {
    findMany: async (options = {}) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('posts')
      let results = collection.find(options.where || {})
      
      if (options.orderBy) {
        const [field, direction] = Object.entries(options.orderBy)[0]
        results.sort((a, b) => {
          const aVal = a[field]
          const bVal = b[field]
          if (direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
          }
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        })
      }

      if (options.take) {
        results = results.slice(0, options.take)
      }

      if (options.skip) {
        results = results.slice(options.skip)
      }

      return results.map(cleanDocument)
    },

    findUnique: async (where) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('posts')
      const post = collection.findOne(where)
      return post ? cleanDocument(post) : null
    },

    create: async (data) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('posts')
      const newPost = {
        id: generateId(),
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const inserted = collection.insert(newPost)
      return cleanDocument(inserted)
    },

    update: async ({ where, data }) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('posts')
      const post = collection.findOne(where)
      if (!post) {
        throw new Error('文章不存在')
      }
      
      Object.assign(post, data, { updatedAt: new Date() })
      collection.update(post)
      return cleanDocument(post)
    },

    delete: async (where) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('posts')
      const post = collection.findOne(where)
      if (!post) {
        throw new Error('文章不存在')
      }
      collection.remove(post)
      return cleanDocument(post)
    },

    count: async (options = {}) => {
      await ensureInitialized()
      const db = getDatabase()
      const collection = db.getCollection('posts')
      if (options.where) {
        return collection.find(options.where).length
      }
      return collection.count()
    }
  }
}

/**
 * 确保数据库已初始化
 */
async function ensureInitialized() {
  if (!initialized) {
    await initPrisma()
  }
}

/**
 * 清理文档，移除 LokiJS 的内部字段
 */
function cleanDocument(doc) {
  if (!doc) return null
  const cleaned = { ...doc }
  delete cleaned.$loki
  delete cleaned.meta
  return cleaned
}

/**
 * 生成唯一 ID（类似 Prisma 的 cuid）
 */
function generateId() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

