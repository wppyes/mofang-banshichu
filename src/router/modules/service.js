

import Layout from '@/view/layout/Layout'
const serviceRouter = {
  path: '/service',
  component: Layout,
  alwaysShow: true,
  redirect: '/service/advise',
  name:'service',
  title: 'title',
  children: [
    {
      path: 'advise',
      component: () => import('@/view/service/advise'),
      meta: {
        title: '民呼必应'
      }
    },
    {
      path: 'tousu',
      component: () => import('@/view/service/tousu'),
      meta: {
        title: '物业投诉建议'
      }
    },
    {
      path: 'tousu-wangge',
      component: () => import('@/view/service/tousu-wangge'),
      meta: {
        title: '物业投诉建议（网格员）'
      }
    },
    {
      path: 'advise/huifu',
      component: () => import('@/view/service/huifu'),
      meta: {
        title: '反馈详情'
      }
    },    
    {
      path: 'fenlei',
      component: () => import('@/view/service/fenlei'),
      meta: {
        title: '服务分类'
      }
    },
    {
      path: 'list',
      component: () => import('@/view/service/list'),
      meta: {
        title: '服务列表'
      }
    },
    {
      path: 'list/add',
      component: () => import('@/view/service/add-list'),
      meta: {
        title: '服务列表'
      }
    },
  ]
}
export default serviceRouter
