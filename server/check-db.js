import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_FILE = join(__dirname, 'data', 'ea-client.db')

try {
  const db = new Database(DB_FILE)
  
  console.log('\n========== SQLite 数据库内容 ==========\n')
  
  // 查询认证用户表
  console.log('📋 认证用户表 (auth_users):')
  const authUsers = db.prepare('SELECT id, username, email, created_at FROM auth_users ORDER BY id').all()
  if (authUsers.length > 0) {
    console.table(authUsers)
  } else {
    console.log('  (暂无数据)')
  }
  
  console.log('\n📋 普通用户表 (users):')
  const users = db.prepare('SELECT id, name, email, age, city, created_at FROM users ORDER BY id').all()
  if (users.length > 0) {
    console.table(users)
  } else {
    console.log('  (暂无数据)')
  }
  
  // 统计信息
  const authCount = db.prepare('SELECT COUNT(*) as count FROM auth_users').get()
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
  
  console.log('\n📊 统计信息:')
  console.log(`  认证用户数: ${authCount.count}`)
  console.log(`  普通用户数: ${usersCount.count}`)
  console.log(`\n数据库文件位置: ${DB_FILE}`)
  console.log('========================================\n')
  
  db.close()
} catch (error) {
  console.error('读取数据库失败:', error.message)
  console.error('数据库文件路径:', DB_FILE)
}

