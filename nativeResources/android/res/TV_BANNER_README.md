# Android TV 横幅图标说明

需要在以下位置添加 Android TV 启动横幅图标:

## 横幅图标规格

- 尺寸: 320 x 180 像素 (xhdpi)
- 格式: PNG
- 内容: 应用 Logo + 应用名称
- 背景: 深色背景,与应用主题一致

## 文件位置

将横幅图标放置到以下目录:

```
nativeResources/android/res/drawable-xhdpi/app_banner.png
```

## 设计建议

1. 使用与应用主题一致的深色背景 (#0f0f1a)
2. Logo 居中放置
3. 应用名称 "LunaTV" 清晰显示
4. 确保在电视大屏幕上清晰可读
5. 避免使用过多细节,保持简洁

## 多分辨率支持

可以提供多个分辨率的横幅图标:

- drawable-hdpi: 240 x 135
- drawable-xhdpi: 320 x 180
- drawable-xxhdpi: 480 x 270
- drawable-xxxhdpi: 640 x 360

## 参考示例

创建一个简单的横幅图标:
- 背景: #0f0f1a (深色)
- 文字: "LunaTV" (白色,居中,大号字体)
- 可选: 添加播放图标或影视相关图标
