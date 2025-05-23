import Vue from 'vue'
import Router from 'vue-router'
/* Layout */
import Layout from '@/layout'

Vue.use(Router)

// export default router
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'dashboard',
        meta: {
          title: '统计分析',
          icon: 'dashboard',
          affix: true,
          permissions: ['all', 'resource', 'order']
        }
      }
    ]
  },
  {
    path: '/purchase',
    component: Layout,
    children: [
      {
        path: 'purchase',
        component: () => import('@/views/purchase/index'),
        name: 'purchase',
        meta: {
          title: '订单管理',
          icon: 'tree',
          permissions: ['all', 'order']
        }
      }
    ]
  },
  {
    path: '/resource',
    component: Layout,
    alwaysShow: true,
    name:'resource',
    meta: {
      title: '设备管理',
      icon: 'tree',
      permissions: ['all','resource']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/resource/index'),
        name: 'resource',
        meta: {
          title: '机床管理',
          icon: 'tree',
          permissions: ['all', 'resource']
        }
      },
      {
        path: 'resourceDetail',
        component: () => import('@/views/resource/totalrawmaterials/index.vue'),
        name:'resourceDetail',
        meta: {
          title: '材料管理',
          icon: 'tree',
          permissions: ['all', 'resource']
        }
      }
    ]
  },
  {
    path: '/scheduling',
    component: Layout,
    children: [
      {
        path: 'scheduling',
        component: () => import('@/views/scheduling/index'),
        name: 'scheduling',
        meta: {
          title: '排产',
          icon: 'tree',
          permissions: ['all', 'order', 'resource']
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
