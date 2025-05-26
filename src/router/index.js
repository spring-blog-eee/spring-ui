import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Pages
const Home = () => import('../views/Home.vue')
const Blog = () => import('../views/Blog.vue')
const BlogDetail = () => import('../views/BlogDetail.vue')
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')
const ResetPassword = () => import('../views/auth/ResetPassword.vue')
const Profile = () => import('../views/user/Profile.vue')
const Dashboard = () => import('../views/admin/Dashboard.vue')
const AdminBlogs = () => import('../views/admin/BlogsManagement.vue')
const AdminComments = () => import('../views/admin/CommentsManagement.vue')
const AdminUsers = () => import('../views/admin/UsersManagement.vue')
const CreateBlog = () => import('../views/admin/CreateBlog.vue')
const EditBlog = () => import('../views/admin/EditBlog.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Home' }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
    meta: { title: 'Blog Posts' }
  },
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: BlogDetail,
    props: true,
    meta: { title: 'Blog Post' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: 'Register', guest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { title: 'Reset Password', guest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: 'My Profile', requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'blogs',
        name: 'AdminBlogs',
        component: AdminBlogs,
        meta: { title: 'Manage Blogs', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: AdminComments,
        meta: { title: 'Manage Comments', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers,
        meta: { title: 'Manage Users', requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  {
    path: '/admin/blog/create',
    name: 'CreateBlog',
    component: CreateBlog,
    meta: { title: 'Create Blog Post', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/blog/edit/:id',
    name: 'EditBlog',
    component: EditBlog,
    props: true,
    meta: { title: 'Edit Blog Post', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Progress bar
NProgress.configure({ showSpinner: false })

router.beforeEach((to, from, next) => {
  // Start progress bar
  NProgress.start()
  
  // Set page title
  document.title = `${to.meta.title || 'Page'} - BlogVue`
  
  const userStore = useUserStore()
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (to.matched.some(record => record.meta.requiresAdmin) && !userStore.isAdmin) {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guest) && userStore.isLoggedIn) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

router.afterEach(() => {
  // Complete progress bar
  NProgress.done()
})

export default router