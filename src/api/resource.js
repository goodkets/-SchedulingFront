import request from '@/utils/request'
//设备管理
export function getResourceData(data) {
  return request({
    url: '/getResourceData',
    method: 'post',
    data
  })
}
