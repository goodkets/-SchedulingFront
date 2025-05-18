<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
        :key="permissionsKey"
      >
        <sidebar-item v-for="route in filteredRoutes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import { constantRoutes } from '@/router'

// 递归过滤路由
function filterRoutes(routes, permissions) {
  return routes.filter(route => {
    if (route.meta && route.meta.permissions) {
      const hasPermission = permissions === 'all' || route.meta.permissions.some(perm => permissions.includes(perm))
      if (hasPermission && route.children) {
        route.children = filterRoutes(route.children, permissions)
      }
      return hasPermission
    }
    if (route.children) {
      route.children = filterRoutes(route.children, permissions)
    }
    return true
  })
}

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar',
      'user'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    // 过滤后的路由
    filteredRoutes() {
      // 检查 this.user 是否存在
      const permissions = this.$store.state.user.permissions
      if (permissions) {
        return filterRoutes(constantRoutes, permissions)
      }
      return constantRoutes
    },
    permissionsKey() {
      return JSON.stringify(this.$store.state.user.permissions)
    }
  }
}
</script>
