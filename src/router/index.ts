import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/LoginLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/pages/auth/LoginPage.vue')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/auth/RegisterPage.vue')
        }
      ]
    },
    {
      path: '/app', 
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'home' }  
        },
        {
          path: 'home',
          name: 'home',
          component: () => import('@/pages/HomePage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'processos',
          name: 'processos',
          component: () => import('@/pages/processos/ProcessosPage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'processos/:id',
          name: 'processo-view',
          component: () => import('@/pages/processos/ProcessoCadastroEdicao.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'processos/novo',
          name: 'processo-form',
          component: () => import('@/pages/processos/ProcessoCadastroEdicao.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('@/pages/clientes/ClientesPage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('@/pages/clientes/ClientesPage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'clientes/:id',
          name: 'cliente-view',
          component: () => import('@/pages/clientes/ClienteCadastroEdicao.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'clientes/novo',
          name: 'cliente-form',
          component: () => import('@/pages/clientes/ClienteCadastroEdicao.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'documentos',
          name: 'documentos',
          component: () => import('@/pages/documentos/DocumentosPage.vue'),
          meta: { requiresAuth: true }
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',  // rota 404
      redirect: { name: 'login' }
    }
  ],
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    return { name: 'login' }
  } else if (!requiresAuth && token && to.name === 'login') {
    return { name: 'home' }
  }

  return true
})

export default router