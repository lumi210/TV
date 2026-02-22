# LunaUniApp

LunaTV 移动端应用 - 基于 UniApp 开发，支持编译为 Android、iOS、H5、微信小程序等多端应用。

## 项目说明

本项目是 [LunaTV](https://github.com/lumi210/LunaTV) 的配套 UniApp 移动端应用，需要配合 LunaTV 后端服务使用。

## 功能特性

### 核心功能
- 首页推荐：精选电影、电视剧、综艺、动漫等内容推荐，支持 Hero Banner 轮播
- 影视搜索：支持多类型内容搜索，搜索历史记录
- 视频播放：支持多播放源、多集选择、播放记录保存
- IPTV 直播：支持直播频道观看，多直播源切换
- 短剧专区：短剧内容聚合浏览

### 用户系统
- 登录注册：用户登录注册，支持邀请码
- 收藏功能：收藏喜欢的影视内容
- 历史记录：观看历史记录，支持续播
- 积分系统：积分兑换、邀请好友获取积分
- 会员卡密：卡密充值、会员状态显示

### 设置管理
- 服务器配置：自定义后端服务器地址
- 播放设置：自动播放下一集等
- 缓存管理：清除本地缓存

## 技术栈

- UniApp (Vue 3)
- Pinia 状态管理
- SCSS 样式
- 支持 TypeScript

## 开发环境

### 安装依赖

```bash
npm install
```

### 开发调试

H5 端：
```bash
npm run dev:h5
```

微信小程序：
```bash
npm run dev:mp-weixin
```

APP 端（需使用 HBuilderX）：
```bash
npm run dev:app
```

### 构建打包

H5 端：
```bash
npm run build:h5
```

微信小程序：
```bash
npm run build:mp-weixin
```

APP 端：
```bash
npm run build:app
```

## 项目结构

```
lunauinapp/
├── api/                # API 接口
├── components/         # 公共组件
├── pages/              # 页面文件
│   ├── index/          # 首页
│   ├── search/         # 搜索页
│   ├── play/           # 播放页
│   ├── live/           # 直播页
│   ├── shortdrama/     # 短剧页
│   ├── mine/           # 我的页
│   ├── login/          # 登录页
│   ├── register/       # 注册页
│   ├── favorites/      # 收藏页
│   ├── history/        # 历史记录页
│   ├── settings/       # 设置页
│   ├── points/         # 积分兑换页
│   ├── invitation/     # 邀请好友页
│   ├── cardkey/        # 卡密充值页
│   └── more/           # 更多内容页
├── static/             # 静态资源
├── store/              # 状态管理
├── styles/             # 公共样式
├── utils/              # 工具函数
├── App.vue             # 应用入口
├── main.js             # 主入口
├── manifest.json       # 应用配置
├── pages.json          # 页面配置
└── vite.config.js      # Vite 配置
```

## 配置说明

### 后端项目

本应用需要配合 LunaTV 后端使用：
- GitHub: https://github.com/lumi210/LunaTV

### 服务器配置

在设置页面可以配置后端服务器地址，或者修改 `vite.config.js` 和 `manifest.json` 中的代理配置：

```javascript
proxy: {
  '/api': {
    target: 'http://your-server:3000',
    changeOrigin: true
  }
}
```

### 环境变量

创建 `.env` 文件配置环境变量：

```env
VITE_API_URL=http://your-server:3000
```

## API 接口

本应用使用以下 LunaTV 后端 API：

### 认证相关
- `POST /api/login` - 登录
- `POST /api/register` - 注册
- `POST /api/logout` - 登出
- `GET /api/user` - 获取用户信息

### 内容相关
- `GET /api/douban` - 获取豆瓣内容列表
- `GET /api/search` - 搜索影视内容
- `GET /api/detail/:type/:id` - 获取内容详情

### 播放相关
- `GET /api/playrecords` - 获取播放记录
- `POST /api/playrecords` - 保存播放记录
- `DELETE /api/playrecords` - 删除播放记录

### 收藏相关
- `GET /api/favorites` - 获取收藏列表
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/:id` - 取消收藏
- `GET /api/favorites/check/:id` - 检查是否已收藏

### 直播相关
- `GET /api/live/sources` - 获取直播源列表
- `GET /api/live/channels` - 获取频道列表
- `GET /api/live/epg` - 获取节目单

### 短剧相关
- `GET /api/shortdrama/list` - 获取短剧列表
- `GET /api/shortdrama/detail` - 获取短剧详情
- `GET /api/shortdrama/search` - 搜索短剧

### 用户相关
- `GET /api/points/balance` - 获取积分余额
- `GET /api/points/history` - 获取积分记录
- `GET /api/invitation/info` - 获取邀请信息
- `GET /api/user/cardkey` - 获取卡密信息
- `POST /api/user/cardkey` - 使用卡密充值

## 打包说明

### Android 打包

1. 使用 HBuilderX 打开项目
2. 选择「发行」->「原生App-云打包」
3. 配置 Android 签名证书
4. 提交打包

### iOS 打包

1. 使用 HBuilderX 打开项目
2. 选择「发行」->「原生App-云打包」
3. 配置 iOS 证书和描述文件
4. 提交打包

## 注意事项

1. 本项目需要配合 LunaTV 后端服务使用
2. 打包 APP 需要在 HBuilderX 中进行配置
3. iOS 打包需要 Apple 开发者账号
4. 生产环境部署时请修改默认的服务器地址配置

## License

MIT
