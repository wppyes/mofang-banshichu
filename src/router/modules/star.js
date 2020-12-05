import Layout from '@/view/layout/Layout'
const starRouter = {
  path: '/star',
  component: Layout,
  alwaysShow: true,
  redirect: '/star/star-list',
  name:'star',
  title: 'title',
  children: [
    {
      path: 'star-list',
      component: () => import('@/view/star/star-list'),
      meta: {
        title: '明星人员管理'
      }
    },
    {
      path: 'star-biglist',
      component: () => import('@/view/star/star-biglist'),
      meta: {
        title: '明星列表'
      }
    },
    {
      path: 'star-list/add-star',
      component: () => import('@/view/star/add-star'),
      meta: {
        title: '明星增改'
      }
    },
    {
      path: 'star-biglist/set-renyuan',
      component: () => import('@/view/star/set-renyuan'),
      meta: {
        title: '人员设置'
      }
    },
  ]
}
export default starRouter
