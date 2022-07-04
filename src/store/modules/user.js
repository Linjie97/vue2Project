import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter,anyRoutes,asyncRoutes,constantRoutes } from '@/router'
import router from '@/router';
import cloneDeep from 'lodash/cloneDeep'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    routes:[],//菜单权限标记
    buttons:[],//按钮权限标记
    roles:[],//用户角色信息
    // 对比之后【项目中已有的异步路由，与服务器返回的标记信息进行对比最终需要展示的路由】
    resultAsyncRoutes:[],
    // 用户最终需要展示全部路由
    resultAllRoutes:[],
  }
}

const state = getDefaultState()

const mutations = {
  // 重置state
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  // 存储state
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // // 存储用户名
  // SET_NAME: (state, name) => {
  //   state.name = name
  // },
  // // 存储用户头像
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // }
  // 存储用户信息
  SET_USERINFO:(state,userInfo)=>{
    state.name = userInfo.name;//用户名
    state.avatar = userInfo.avatar;//用户头像
    state.routes = userInfo.routes;//菜单权限标记
    state.buttons = userInfo.buttons;//按钮权限标记
    state.roles = userInfo.roles;//用户角色信息
  },
  // 最终计算出来的异步路由
  SET_RESULTASYNCROUTES:(state,asyncRoutes)=>{
    // vuex保存当前用户的异步路由，但注意：用户还需要常量和任意路由
    state.resultAsyncRoutes = asyncRoutes;
    // 计算用户需要展示的所有路由
    state.resultAllRoutes = constantRoutes.concat(state.resultAsyncRoutes,anyRoutes);
    // 给路由器引入新的路由
    router.addRoutes(state.resultAllRoutes);
  }
}
// 定义一个函数：两个数组比对，对比出当前用户需要显示哪些异步路由
const computedAsyncRoutes = (asyncRoutes,routes)=>{
  // 过滤当前用户（超级管理员|普通员工）需要展示的异步路由
   return asyncRoutes.filter(item=>{
    if(routes.indexOf(item.name) != -1){
      // 这里需要考虑到多级路由的情况，因此需要使用递归
      if(item.children && item.children.length){
        item.children = computedAsyncRoutes(item.children,routes);
      }
      return true;
    }
  })
}

const actions = {
  // 处理登录业务
  // user login
  async login({commit}, userInfo){
    const { username, password } = userInfo; //解构用户名和密码
    let result = await login({ username: username.trim(), password: password });
    // console.log(result);
    // 因为这里一开始用的是mock数据，给的code是20000
    if(result.code==20000){
      commit('SET_TOKEN', result.data.token);
      setToken(result.data.token);
      return 'ok';
    }else{
      return Promise.reject(new Error(error.message))
    }
  },
  // 当初没有async await 所以用的是promise then
  // login({ commit }, userInfo) {
  //   const { username, password } = userInfo; //解构用户名和密码
  //   return new Promise((resolve, reject) => {
  //     login({ username: username.trim(), password: password }).then(response => {
  //       const { data } = response
  //       commit('SET_TOKEN', data.token)
  //       setToken(data.token)
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        // 获取用户信息：返回数据包含：用户名name、用户头像avatar、routes[返回标志：不同用户应该展示哪些菜单的标记]、roles（用户角色信息）、buttons[按钮的信息：按钮权限用的标记]
        const { data } = response;
        // 不止存这几个数据
        // if (!data) {
        //   return reject('Verification failed, please Login again.')
        // }
        // const { name, avatar } = data
        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)

        // vuex存储全部用户信息
        commit('SET_USERINFO',data);
        commit('SET_RESULTASYNCROUTES',computedAsyncRoutes(cloneDeep(asyncRoutes),data.routes));
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}



export default {
  namespaced: true,
  state,
  mutations,
  actions
}

