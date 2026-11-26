import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/auth/sign-in',
      component: () => import('@/views/AuthCallback.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/auth/callback',
      name: 'AuthCallback',
      component: () => import('@/views/AuthCallback.vue'),
      meta: { requiresAuth: false }
    },

    {
      path: '/account',
      redirect: '/account/materials',
      component: () => import('@/views/account/Account.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Account',
          redirect: '/account/materials'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/account/Dashboard.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'materials',
          name: 'OfflineMaterials',
          component: () => import('@/views/account/OfflineMaterials.vue')
        },
        {
          path: 'downlines',
          name: 'Downlines',
          component: () => import('@/views/account/Downlines.vue')
        },
        {
          path: 'earnings',
          name: 'Earnings',
          component: () => import('@/views/account/Earnings.vue')
        },
        {
          path: 'coupons',
          name: 'Coupons',
          component: () => import('@/views/account/Coupons.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'history',
          name: 'History',
          component: () => import('@/views/account/History.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/account/Profile.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/',
      redirect: '/account/materials'
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    },
  ]
})

// 路由守卫
router.beforeEach((to, _, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore.userInfo) {
    redirectToSsoLogin('growth')
    return next(false)
  } else {
    next()
  }
})

export default router
