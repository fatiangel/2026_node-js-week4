const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const authRouter = require('./routes/auth');
const swaggerDoc = require('./fixtures/swagger.json');

const app = express();

// ───────────────────────────────────────────────────────────
// TODO 任務五：將 middleware、router、守門員依序掛上 app
// ───────────────────────────────────────────────────────────
// 1. cors()
// 2. express.json()
// 3. Swagger UI /docs（已預先提供如下，同學不需調整）
// 4. /auth router
// 5. 404 守門員（無此路由資訊）
// 6. 錯誤處理守門員（⚠️ 4 個參數、最後一個）
//    回傳 status 500，body 包含兩個欄位：
//    - err：錯誤的類別名稱（例如 'SyntaxError'）
//    - message：錯誤訊息
//
// ⚠️ **最後不需呼叫 app.listen()** — 這個部分交由 server.js 負責（分離「組裝」跟「啟動」，這樣 test.js 可以 supertest 直接戳 app、不佔 port）。
const corsOptions = {
  // 開發環境固定指向本機 3000（同 server 埠號），僅作示範用途；
  // 正式環境應改為實際前端網域，或改由環境變數帶入，避免寫死。
  // 註：npm test 只檢查有沒有回應此 header，不檢查其值，
  // 因此這裡的值不影響 GitHub Actions（若日後有加回）的測試結果。
  origin: 'http://localhost:3000',// 只允許此網域
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204, // 針對舊版瀏覽器的相容設定
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/auth', authRouter);
app.use((req, res, next) => {
  res.status(404).json({
    status: 'false',
    message: '無此路由資訊'
  });
});
app.use((err, req, res, next) => {
  res.status(500).json({
    err: err.applicationError || err.name,
    message: err.message,
  });
});

module.exports = app;
