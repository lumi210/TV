# LunaUniApp

LunaTV 移动端应用 - 基于 UniApp 开发，支持编译为 Android、iOS、H5、微信小程序等多端应用。

## 功能特性

- 首页推荐：精选电影、电视剧、综艺等内容推荐
- 影视搜索：支持多类型内容搜索
- 视频播放：支持多播放源、多集选择
- IPTV 直播：支持直播频道观看
- 短剧专区：短剧内容聚合
- 用户系统：登录注册、收藏、历史记录
- 设置管理：服务器配置、播放设置、缓存管理

## 技术栈

- UniApp (Vue 3)
- Pinia 状态管理
- SCSS 样式
- 支持 TypeScript

## 开发环境

### 安装依赖

```bash
npm install
# 或
pnpm install
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
│   └── settings/       # 设置页
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

本应用已内置服务器地址，开箱即用，需配合 LunaTV 后端：
- GitHub: https://github.com/lumi210/LunaTV

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

## License

MIT
