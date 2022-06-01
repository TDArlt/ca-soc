
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/VulnDashboard.vue') },
      { path: 'vuln-dashboard', component: () => import('pages/VulnDashboard.vue') },
      { path: 'faz-soc', component: () => import('pages/FAZSOC.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
