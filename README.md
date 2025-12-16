# Find Friends H5 (Next.js 14 + Supabase)

面向真实用户的移动端 H5 抽取应用，前后端同仓，可部署到 Vercel。安全优先，不在前端暴露任何数据库密钥。

## 功能
- `/`：填写昵称、年龄、性别、微信号，提交写库
- `/draw`：2 秒 loading、防重复提交，调用抽取接口
- `/result`：展示匹配到的异性信息，一键复制微信
- API：`POST /api/submit` 写入用户；`POST /api/draw` 抽取异性 + 频率限制

## 环境变量（仅服务端）
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```
可复制 `env.example` 并填写。

## 本地运行
1) 安装依赖
```
npm install
```
2) 配置环境变量
```
cp env.example .env.local
# 填写 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
```
3) 启动开发
```
npm run dev
```

## Supabase 配置
执行 `supabase.sql`：
```
psql "$SUPABASE_DB_URL" -f supabase.sql
```
或在 Supabase SQL 编辑器直接运行文件内容。确保已启用 `pgcrypto` 扩展。

## 部署到 Vercel
1) 新建 Vercel 项目，导入该仓库
2) 在 Project Settings -> Environment Variables 设置：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`（选择 Encrypted）
3) Framework 选择 Next.js，保持默认构建命令
4) 部署完成后，即可通过分配域名访问

## 生成访问二维码
- 本地：`npx qrcode-terminal https://your-domain.vercel.app`
- 或在任意二维码工具中输入线上地址，适配微信扫码。

## 风控与安全设计
- Supabase 只用服务端的 Service Role，前端无密钥、无直连
- 所有写库/抽取均为服务端 API
- 年龄、性别、微信必填且强校验，错误码统一 JSON
- 抽取接口：同一 `user_id` 30 秒内仅允许一次；记录 `match_logs` + 可选 `ip_hash`
- 不提供用户搜索/列表接口，结果只返回必要字段（昵称/年龄/微信）

## 目录结构
```
app/
  page.tsx           # 填写页
  draw/page.tsx      # 抽取中
  result/page.tsx    # 结果展示
  api/
    submit/route.ts  # 提交信息
    draw/route.ts    # 抽取异性
lib/                 # 环境、Supabase 客户端与类型
supabase.sql         # 数据表 & 索引
env.example          # 环境变量模板
```

## 注意事项
- 生产环境请在 Supabase 打开审计日志，必要时开启 RLS 结合 Service Key 访问
- 若需更强防刷，可在 `match_logs` 中记录 IP hash 并延长冷却时间或接入验证码
- 微信号仅在结果页展示一次，可视需要在 `/draw` 中增加一次性 token 校验

