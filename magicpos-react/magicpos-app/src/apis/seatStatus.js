import axios from 'axios'
axios.defaults.baseURL = "/api"

// 좌석 현황 조회
export const select = () => axios.get('/admin');