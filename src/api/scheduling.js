import request from '@/utils/request'
//排产
export function getSchedulingData(data) {
  return request({
    url: '/getSchedulingData',
    method: 'post',
    data
  })
}
//排产状态修改
export function updateSchedulingData(data) {
  return request({
    url: '/updateSchedulingData',
    method: 'post',
    data
  })
}
