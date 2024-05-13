import axios from 'axios';

import { GET_STARRED_PROJECT_FROM_GITHUB } from './api';
import { token } from '@/token';

const instance = axios.create({
  baseURL: 'https://api.github.com', // 设置基本的 API 地址
  headers: {
    'Authorization': `Bearer ${ token }` // 设置 Authorization 头部
  }
});

export const getProjectList = async () => {
  return await instance.get(GET_STARRED_PROJECT_FROM_GITHUB);
};
