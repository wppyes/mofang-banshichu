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
      path: 'range-list',
      component: () => import('@/view/range/range-list'),
      meta: {
        title: '排行榜列表'
      }
    },
  ]
}
export default rangeRouter
