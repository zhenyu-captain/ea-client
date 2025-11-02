// SQLite 数据库实例
let db = null
let SQL = null

/**
 * 初始化 SQLite 数据库
 */
export async function initDatabase() {
  try {
    // 动态导入 sql.js 以避免构建时的导入错误
    const sqlJsModule = await import('sql.js').catch(err => {
      console.error('无法导入 sql.js:', err)
      throw new Error('SQL.js 模块加载失败，请确保已运行 npm install')
    })
    
    const initSqlJs = sqlJsModule.default
    
    // 加载 SQL.js
    SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    })

    // 创建新数据库
    db = new SQL.Database()

    // 创建示例表
    db.run(`
      CREATE TABLE IF NOT EXISTS greetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 检查是否已有数据，避免重复插入
    const checkResult = db.exec('SELECT COUNT(*) as count FROM greetings')
    let count = 0
    
    if (checkResult.length > 0 && checkResult[0].values.length > 0) {
      count = checkResult[0].values[0][0]
    }

    if (count === 0) {
      // 插入示例数据
      const stmt = db.prepare('INSERT INTO greetings (message) VALUES (?)')
      stmt.run(['Hello SQLite'])
      stmt.free()
    }

    return db
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

/**
 * 获取问候语
 */
export function getGreeting() {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec('SELECT message FROM greetings ORDER BY id DESC LIMIT 1')
  
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0]
  }
  
  return 'Hello SQLite'
}

/**
 * 添加新的问候语
 */
export function addGreeting(message) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const stmt = db.prepare('INSERT INTO greetings (message) VALUES (?)')
  stmt.run([message])
  stmt.free()
}

/**
 * 获取所有问候语
 */
export function getAllGreetings() {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec('SELECT id, message, created_at FROM greetings ORDER BY id DESC')
  
  if (result.length > 0) {
    return result[0].values.map(row => ({
      id: row[0],
      message: row[1],
      created_at: row[2]
    }))
  }
  
  return []
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  return db
}

