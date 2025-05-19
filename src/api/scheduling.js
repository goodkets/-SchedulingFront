import request from '@/utils/request'

export function getSchedulingData(data) {
  return request({
    url: '/getSchedulingData',
    method: 'post',
    data
  })
}
