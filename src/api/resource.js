import request from '@/utils/request'
//设备管理
export function getResourceData(data) {
  return request({
    url: '/getResourceData',
    method: 'post',
    data
  })
}

export function updateResourceStatus(data) {
  return request({
    url: '/updateResourceStatus',
    method: 'post',
    data
  })
}

export function updateRowStatus(data) {
  return request({
    url: '/updateRowStatus',
    method: 'post',
    data
  })
}
export function updateWorkerNum(data) {
  return request({
    url: '/updateWorkerNum',
    method: 'post',
    data
  })
}

export function updateResourceAndWorkerStatus(data) {
  return request({
    url: '/updateResourceAndWorkerStatus',
    method: 'post',
    data
  })
}

export function addWorker(data) {
  return request({
    url: '/addWorker',
    method: 'post',
    data
  })
}

export function deleteWorker(data) {
  return request({
    url: '/deleteWorker',
    method: 'post',
    data
  })
}

export function getRawMaterialCount(data) {
  return request({
    url: '/getRawMaterialCount',
    method: 'post',
    data
  })
}

export function updateRawMaterialCount(data) {
  return request({
    url: '/updateRawMaterialCount',
    method: 'post',
    data
  })
}
