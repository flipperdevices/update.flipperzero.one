
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        props: (route) => {
          if (!route.query.url) {
            return null
          }
          try {
            const url = new URL(route.query.url)
            return {
              customSource: {
                url: url.toString(),
                channel: route.query.channel,
                version: route.query.version
              }
            }
          } catch (e) {
            console.log(e)
          }
        },
        component: () => import('pages/Index.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
