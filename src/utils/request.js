import axios from 'axios';
import { Dialog, Toast } from 'vant';

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  timeout: 5000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    if (!config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${window.localStorage.getItem('Mall-Authorization') || ''
        }`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// response interceptor
service.interceptors.response.use(
  (response) => {

    if (response.data == null) {
      response.data = {
        data: null,
        errno: response.status || 0,
        errmsg: response.statusText || '失败',
      };
    } else if (response.data.data == null || Object.keys(response.data.data).length === 0) {
      response.data = {
        data: response.data,
        errno: response.data.code || 0,
        errmsg: response.data.message || '成功',
      };
    }
    const res = response.data;

    if (res.errno === 501) {
      Toast.fail('请登录');
      setTimeout(() => {
        window.location = '#/login/';
      }, 1500);
      return Promise.reject('error');
    } else if (res.errno === 502) {
      Toast.fail('网站内部错误，请联系网站维护人员');
      return Promise.reject('error');
    }
    if (res.errno === 401) {
      Toast.fail('参数不对');
      return Promise.reject('error');
    }
    if (res.errno === 402) {
      Toast.fail('参数值不对');
      return Promise.reject('error');
    } else if (res.errno !== 0) {
      // 非5xx的错误属于业务错误，留给具体页面处理
      return Promise.reject(response);
    } else {
      return response;
    }
  },
  (error) => {
    console.log('err' + error); // for debug
    const code = error.response.data.code;
    if (code === 401 || code === 402) {
      Toast.fail(error.response.data.message || '请登录');
      setTimeout(() => {
        window.location = '#/login/';
      }, 1500);
      return Promise.reject('error');
    }
    if (error.response.data.message) {
      Dialog.alert({
        title: '警告',
        message: error.response.data.message,
      });
    } else {
      Dialog.alert({
        title: '警告',
        message: '登录连接超时',
      });
    }
    return Promise.reject(error);
  }
);

export default service;
