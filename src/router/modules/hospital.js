import Layout from '@/view/layout/Layout'
const hospitalRouter = {
  path: '/hospital',
  component: Layout,
  alwaysShow: true,
  redirect: '/hospital/hospital-list',
  name:'hospital',
  title: 'title',
  children: [
    {
      path: 'hospital-list',
      component: () => import('@/view/hospital/hospital-list'),
      meta: {
        title: '医院列表'
      }
    },
    {
      path: 'hospital-list/add-renyuan',
      component: () => import('@/view/hospital/add-renyuan'),
      meta: {
        title: '医院增改'
      }
    },
    {
      path: 'hospital-list/add-yisheng',
      component: () => import('@/view/hospital/add-yisheng'),
      meta: {
        title: '医生设置'
      }
    },
    {
      path: 'paihan',
      component: () => import('@/view/hospital/paihan'),
      meta: {
        title: '排班管理'
      }
    },
    {
      path: 'paiban-fenlei',
      component: () => import('@/view/hospital/paiban-fenlei'),
      meta: {
        title: '排班类型'
      }
    },
  ]
}
export default hospitalRouter
