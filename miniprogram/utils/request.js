// 统一封装后端请求。失败不抛错给页面，由后端保证 fallback；网络彻底失败时本地兜底。
const app = getApp();

function post(path, data) {
  const baseUrl = app.globalData.baseUrl;
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + path,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: data || {},
      timeout: 25000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
          resolve(res.data);
        } else {
          reject(new Error('HTTP ' + res.statusCode));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

module.exports = { post };
