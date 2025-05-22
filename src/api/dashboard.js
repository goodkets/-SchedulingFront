import request from '@/utils/request'
export function orderProgress() {
  return request({
    url: '/orderProgress',
    method: 'post'
  })
}
