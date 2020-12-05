import Layout from '@/view/layout/Layout'
const rangeRouter = {
  path: '/range',
  component: Layout,
  alwaysShow: true,
  redirect: '/range/range-list',
  name:'range',
  title: 'title',
  children: [
    {
      path: 'range-list/range-biglist',
      component: () => import('@/view/range/range-list'),
      meta: {
        title: '设置人员'
      }
    },
    {
      path: 'range-list',
      component: () => import('@/view/range/range-biglist'),
      meta: {
        title: '积分排行榜'
      }
    },
    {
      path: 'range-list/set-range',
      component: () => import('@/view/range/set-range'),
      meta: {
        title: '设置人员'
      }
    },
  ]
}
//换链接了 range-list和range-biglist
export default rangeRouter
