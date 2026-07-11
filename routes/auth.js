const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const initialUsers = require('../fixtures/users.json');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的完整規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// state（module 層級、這個 router 獨用）
// ───────────────────────────────────────────────────────────
// 複製 initialUsers，不改外部陣列。
// 預填管理員：{ id: 1, email: 'leo@gym.com', password: <bcrypt hash of '1q2w3e4r'> }
const users = [...initialUsers];
let nextId = initialUsers.length + 1;

const router = express.Router();

// ───────────────────────────────────────────────────────────
// TODO 任務二：POST /register
// ───────────────────────────────────────────────────────────

// POST /register
// - 輸入：body = { email, password }
// - 輸出：201 + { status: 'success', message: '註冊成功' }，或 400 + { status: 'false', message: '...' }
// - 提示：
//   1. email、password 缺少任何一個欄位，或 email 已存在（使用陣列方法檢查）→ return 400 跟對應輸出訊息
//   2. 密碼加密可使用 bcrypt 的 genSalt 與 hash 
//   3. 加密完成後，將新使用者（包含 id、email、加密後 password）存進 users，並 return 201 跟對應輸出訊息
// - 注意：handler 是 async function
/* 作答區
router.METHOD('PATH', async (req, res) => { ... });
*/
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // 1. 必要欄位
  if (!email || !password) {
    return res.status(400).json({
      status: 'false',
      message: '缺少必要欄位'
    });
  }

  // 2. Email 格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'false',
      message: 'Email 格式不正確'
    });
  }

  // 3. Email 是否已存在
  if (users.some(u => u.email === email)) {
    return res.status(400).json({
      status: 'false',
      message: 'Email 已被註冊'
    });
  }

  // 4. 密碼加密
  const hashedPassword = await bcrypt.hash(password, 10);
  // 5. 新增使用者
  const newUser = { id: nextId++, email: email, password: hashedPassword };
  users.push(newUser);
  return res.status(201).json({
    status: 'success',
    message: '註冊成功'
  });
});
// ───────────────────────────────────────────────────────────
// TODO 任務三：POST /login
// ───────────────────────────────────────────────────────────

// POST /login
// - 輸入：body = { email, password }
// - 輸出：200 + { status: 'success', token }，或 401 + { status: 'false', message: '帳號或密碼錯誤' }
// - 提示：
//   1. 從 users 找出 email 符合的使用者，如果找不到 → return 401 跟對應輸出訊息
//   2. 用 bcrypt.compare 比對密碼，如果不符合 → return 401 跟對應輸出訊息（兩種失敗回覆同樣訊息，避免帳號探測）
//   3. 用 jwt.sign 簽出 token，payload 帶入使用者的 id 和 email，secret 使用 process.env.JWT_SECRET，有效期設為 30 天
//   4. token 簽出後，回應 200 跟對應輸出訊息
// - 注意：handler 是 async function
/* 作答區
router.METHOD('PATH', async (req, res) => { ... });
*/
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. 找出 email 符合的使用者
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      status: 'false',
      message: '帳號或密碼錯誤'
    });
  }

  // 2. 比對密碼
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      status: 'false',
      message: '帳號或密碼錯誤'
    });
  }

  // 3. 簽出 token
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

  // 4. 回應 token
  return res.status(200).json({
    status: 'success',
    token
  });
});

// ───────────────────────────────────────────────────────────
// TODO 任務四：GET /me（受保護）
// ───────────────────────────────────────────────────────────

// GET /me
// - 保護：路由第二個參數掛上 verifyToken 守門員（驗過後會將使用者資料掛到 req.user）
// - 輸出：200 + { status: 'success', user: ... }
/* 作答區
router.METHOD('PATH', middleware, (req, res) => { ... });
*/
router.get('/me', verifyToken, (req, res) => {
  return res.status(200).json({
    status: 'success',
    user: req.user
  });
});

module.exports = router;
