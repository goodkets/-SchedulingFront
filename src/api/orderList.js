import request from '@/utils/request'
//订单
export function orderList(data) {
  return request({
    url: '/orderList',
    method: 'post',
    data
  })
}

export function addPurchaseData(data) {
  return request({
    url: '/addPurchaseData',
    method: 'post',
    data
  })
}
export function deletePurchaseData(data) {
  return request({
    url: '/deletePurchaseData',
    method: 'post',
    data
  })
}

export function editPurchaseData(data) {
  return request({
    url: '/editPurchaseData',
    method: 'post',
    data
  })
}
