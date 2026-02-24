import { buildUrl } from './request'

const HOT_UPDATE_STORAGE_KEY = 'hot_update_info'

function getPlatform() {
  const platform = uni.getSystemInfoSync().platform
  if (platform === 'android') return 'android'
  if (platform === 'ios') return 'ios'
  return 'android'
}

function getCurrentVersionCode() {
  try {
    const accountInfo = uni.getAccountInfoSync ? uni.getAccountInfoSync() : null
    if (accountInfo && accountInfo.miniProgram) {
      return parseInt(accountInfo.miniProgram.appVersionCode || '100', 10)
    }
  } catch (e) {}
  return 100
}

function getCurrentVersion() {
  try {
    const accountInfo = uni.getAccountInfoSync ? uni.getAccountInfoSync() : null
    if (accountInfo && accountInfo.miniProgram) {
      return accountInfo.miniProgram.appVersion || '1.0.0'
    }
  } catch (e) {}
  return '1.0.0'
}

function getHotUpdateInfo() {
  try {
    const stored = uni.getStorageSync(HOT_UPDATE_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {}
  return {
    lastCheckTime: 0,
    skippedVersion: '',
    installedVersion: ''
  }
}

function saveHotUpdateInfo(info) {
  try {
    uni.setStorageSync(HOT_UPDATE_STORAGE_KEY, JSON.stringify(info))
  } catch (e) {}
}

export async function checkUpdate(silent) {
  // #ifdef H5
  return null
  // #endif

  const platform = getPlatform()
  const versionCode = getCurrentVersionCode()
  const version = getCurrentVersion()

  console.log('[HotUpdate] checking update:', { platform, versionCode, version })

  try {
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: buildUrl(`/api/app-update?platform=${platform}&versionCode=${versionCode}&version=${version}`),
        method: 'GET',
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('Request failed'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })

    if (!response.success || !response.hasUpdate) {
      console.log('[HotUpdate] no update available')
      return null
    }

    const updateInfo = {
      hasUpdate: true,
      updateType: response.updateType || 'normal',
      version: response.version,
      versionCode: response.versionCode,
      updateLog: response.updateLog,
      wgtUrl: response.wgtUrl,
      pkgUrl: response.pkgUrl,
      publishTime: response.publishTime
    }

    const hotUpdateInfo = getHotUpdateInfo()
    if (updateInfo.updateType !== 'forced' && hotUpdateInfo.skippedVersion === updateInfo.version) {
      console.log('[HotUpdate] user skipped this version')
      return null
    }

    hotUpdateInfo.lastCheckTime = Date.now()
    saveHotUpdateInfo(hotUpdateInfo)

    return updateInfo
  } catch (error) {
    console.error('[HotUpdate] check update failed:', error)
    return null
  }
}

export function showUpdateDialog(updateInfo) {
  const isForced = updateInfo.updateType === 'forced'
  
  let content = '发现新版本 ' + updateInfo.version
  if (updateInfo.updateLog) {
    content += '\n\n更新内容：\n' + updateInfo.updateLog
  }

  if (isForced) {
    uni.showModal({
      title: '发现新版本',
      content: content,
      showCancel: false,
      confirmText: '立即更新',
      success: () => {
        doUpdate(updateInfo)
      }
    })
  } else {
    uni.showModal({
      title: '发现新版本',
      content: content,
      showCancel: true,
      cancelText: '稍后再说',
      confirmText: '立即更新',
      success: (res) => {
        if (res.confirm) {
          doUpdate(updateInfo)
        } else {
          const hotUpdateInfo = getHotUpdateInfo()
          hotUpdateInfo.skippedVersion = updateInfo.version
          saveHotUpdateInfo(hotUpdateInfo)
        }
      }
    })
  }
}

export function doUpdate(updateInfo) {
  if (!updateInfo.wgtUrl && !updateInfo.pkgUrl) {
    uni.showToast({ title: '没有可用的更新包', icon: 'none' })
    return
  }

  const downloadUrl = updateInfo.wgtUrl || updateInfo.pkgUrl
  if (!downloadUrl) {
    uni.showToast({ title: '没有可用的更新包', icon: 'none' })
    return
  }

  const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : buildUrl(downloadUrl)

  console.log('[HotUpdate] downloading:', fullUrl)

  uni.showLoading({ title: '正在下载...', mask: true })

  const downloadTask = uni.downloadFile({
    url: fullUrl,
    success: (res) => {
      uni.hideLoading()
      
      if (res.statusCode !== 200) {
        uni.showToast({ title: '下载失败', icon: 'none' })
        return
      }

      console.log('[HotUpdate] download success, temp path:', res.tempFilePath)

      if (updateInfo.wgtUrl) {
        installWgt(res.tempFilePath, updateInfo)
      } else {
        installPkg(res.tempFilePath)
      }
    },
    fail: (err) => {
      uni.hideLoading()
      console.error('[HotUpdate] download failed:', err)
      uni.showToast({ title: '下载失败，请稍后重试', icon: 'none' })
    }
  })

  downloadTask.onProgressUpdate((res) => {
    console.log('[HotUpdate] download progress:', res.progress + '%')
  })
}

function installWgt(filePath, updateInfo) {
  console.log('[HotUpdate] installing wgt:', filePath)
  
  uni.showLoading({ title: '正在安装...', mask: true })

  plus.runtime.install(filePath, {
    force: true
  }, () => {
    uni.hideLoading()
    console.log('[HotUpdate] install success')
    
    const hotUpdateInfo = getHotUpdateInfo()
    hotUpdateInfo.installedVersion = updateInfo.version
    saveHotUpdateInfo(hotUpdateInfo)

    uni.showModal({
      title: '更新成功',
      content: '应用已更新完成，需要重启应用才能生效',
      showCancel: false,
      confirmText: '立即重启',
      success: () => {
        plus.runtime.restart()
      }
    })
  }, (error) => {
    uni.hideLoading()
    console.error('[HotUpdate] install failed:', error)
    uni.showToast({ title: '安装失败，请稍后重试', icon: 'none' })
  })
}

function installPkg(filePath) {
  console.log('[HotUpdate] opening pkg:', filePath)
  
  plus.runtime.openFile(filePath, {}, (error) => {
    console.error('[HotUpdate] open pkg failed:', error)
    uni.showToast({ title: '打开安装包失败', icon: 'none' })
  })
}

export async function checkAndUpdateOnLaunch() {
  // #ifdef H5
  return
  // #endif

  const hotUpdateInfo = getHotUpdateInfo()
  const now = Date.now()
  const oneHour = 60 * 60 * 1000

  if (now - hotUpdateInfo.lastCheckTime < oneHour) {
    console.log('[HotUpdate] checked recently, skip')
    return
  }

  try {
    const updateInfo = await checkUpdate(true)
    if (updateInfo) {
      showUpdateDialog(updateInfo)
    }
  } catch (error) {
    console.error('[HotUpdate] check update on launch failed:', error)
  }
}

export default {
  checkUpdate,
  showUpdateDialog,
  doUpdate,
  checkAndUpdateOnLaunch
}
