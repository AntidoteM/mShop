<template>
  <div class="loginContainer">
    <div class="loginInner">
      <div class="login_header">
        <h2 class="login_logo">硅谷外卖</h2>
        <div class="login_header_title">
          <a href="javascript:;" :class="{on: isPhoneLogin}" @click="isPhoneLogin=true">短信登录</a>
          <a href="javascript:;" :class="{on: !isPhoneLogin}" @click="isPhoneLogin=false">密码登录</a>
        </div>
      </div>
      <div class="login_content">
        <form @submit.prevent="login">
          <div :class="{on: isPhoneLogin}" @click="isPhoneLogin=true">
            <section class="login_message">
              <input type="tel" maxlength="11" placeholder="手机号" v-model="phone">
              <button :disabled="!rightPhone || sent" class="get_verification" @click.prevent="getCode">{{computeTime>0?`已发送(${computeTime}s)` :'获取验证码'}}</button>
            </section>
            <section class="login_verification">
              <input type="text" placeholder="验证码" v-model="code">
            </section>
            <section class="login_hint">
              温馨提示：未注册硅谷外卖帐号的手机号，登录时将自动注册，且代表已同意
              <a href="javascript:;">《用户服务协议》</a>
            </section>
          </div>
          <div :class="{on: !isPhoneLogin}" @click="isPhoneLogin=false">
            <section>
              <section class="login_message">
                <input type="text" placeholder="手机/邮箱/用户名" v-model="name">
              </section>
              <section class="login_verification">
                <input type="password" placeholder="密码" v-if="!showPwd" v-model="pwd">
                <input type="text" placeholder="密码" v-else v-model="pwd">
                <div class="switch_button off" :class="showPwd?'on':'off'" @click="showPwd=!showPwd">
                  <div class="switch_circle" :class="{right: showPwd}"></div>
                  <span class="switch_text">{{showPwd ? 'abc' : '...'}}</span>
                </div>
              </section>
              <section class="login_message">
                <input type="text" maxlength="11" placeholder="验证码" v-model="captcha">
                <img ref="captcha" class="get_verification" src="http://localhost:4000/captcha" alt="captcha" @click="getCaptcha">
              </section>
            </section>
          </div>
          <button class="login_submit">登录</button>
        </form>
        <a href="javascript:;" class="about_us">关于我们</a>
      </div>
      <a href="javascript:" class="go_back" @click="$router.back()">
        <i class="iconfont icon-jiantou2"></i>
      </a>
    </div>
    <AlertTip :alertText='alertText' v-show="showAlert" @closeTip="closeTip"/>
  </div>
</template>

<script>
import AlertTip from '../../components/AlertTip/AlertTip'
import {reqPwdLogin, reqSendCode, reqSmsLogin} from '../../api'
export default {
  data () {
    return {
      isPhoneLogin: true,
      computeTime: 0,
      sent: false,
      showPwd: false,
      alertText: '',
      showAlert: false,
      name: '',
      pwd: '',
      phone: '',
      code: '',
      captcha: ''
    }
  },
  computed: {
    rightPhone () {
      return /^1\d{10}$/.test(this.phone)
    }
  },
  components: {
    AlertTip
  },
  methods: {
    async getCode () {
      this.computeTime = 30
      this.sent = true
      this.timer = setInterval(() => {
        this.computeTime--
        if (this.computeTime <= 0) {
          this.sent = false
          clearInterval(this.timer)
        }
      }, 1000)
      // 发送ajax请求(向指定手机号发送验证码短信)
      const result = await reqSendCode(this.phone)
      if(result.code===1) {
        // 显示提示
        this.showAlert(result.msg)
        // 停止计时
        if(this.computeTime) {
          this.computeTime = 0
          clearInterval(this.intervalId)
          this.intervalId = undefined
        }
      }
    },
    getCaptcha () {
      this.$refs.captcha.src = 'http://localhost:4000/captcha?' + Date.now()
    },
    alertShow (alertText) {
      this.alertText = alertText
      this.showAlert = true
    },
    closeTip () {
      this.alertText = ''
      this.showAlert = false
    },
    async login () {
      let result
      if (this.isPhoneLogin) {
        const {rightPhone, phone, code} = this
        if (!rightPhone) {
          this.alertShow('手机号不正确')
          return
        } else if (!/^\d{6}$/.test(code)) {
          this.alertShow('验证码必须是6位数字')
          return
        }
        result = await reqSmsLogin(phone, code)
      } else {
        const {name, pwd, captcha} = this
        if (!name) {
          this.alertShow('用户必须输入')
          return
        } else if (!pwd) {
          this.alertShow('密码必须输入')
          return
        } else if (!captcha) {
          this.alertShow('验证码必须输入')
          return
        }
        result = await reqPwdLogin({name, pwd, captcha})
      }
      if (this.computeTime) {
        clearInterval(this.timer)
        this.timer = 0
      }
      if (result.code === 0) {
        const user = result.data
        this.$store.dispatch('recordUser', user)
        this.$router.replace('/profile')
      } else {
        const msg = result.msg
        this.alertShow(msg)
        this.getCaptcha()
      }
    }
  }
}
</script>

<style lang="stylus" rel='stylesheet/stylus'>
  @import '../../common/stylus/mixins.styl'
  .loginContainer
    width 100%
    height 100%
    background #fff
    .loginInner
      padding-top 60px
      width 80%
      margin 0 auto
      .login_header
        .login_logo
          font-size 40px
          font-weight bold
          color #02a774
          text-align center
        .login_header_title
          padding-top 40px
          text-align center
          >a
            color #333
            font-size 14px
            padding-bottom 4px
            &:first-child
              margin-right 40px
            &.on
              color #02a774
              font-weight 700
              border-bottom 2px solid #02a774
      .login_content
        >form
          >div
            display none
            &.on
              display block
            input
              width 100%
              height 100%
              padding-left 10px
              box-sizing border-box
              border 1px solid #ddd
              border-radius 4px
              outline 0
              font 400 14px Arial
              &:focus
                border 1px solid #02a774
            .login_message
              position relative
              margin-top 16px
              height 48px
              font-size 14px
              background #fff
              .get_verification
                position absolute
                top 50%
                right 10px
                transform translateY(-50%)
                border 0
                font-size 14px
                background transparent
            .login_verification
              position relative
              margin-top 16px
              height 48px
              font-size 14px
              background #fff
              .switch_button
                font-size 12px
                border 1px solid #ddd
                border-radius 8px
                transition background-color .3s,border-color .3s
                padding 0 6px
                width 30px
                height 16px
                line-height 16px
                color #fff
                position absolute
                top 50%
                right 10px
                transform translateY(-50%)
                &.off
                  background #fff
                  .switch_text
                    color #ddd
                &.on
                  background #02a774
                >.switch_circle
                  position absolute
                  top -1px
                  left -1px
                  width 16px
                  height 16px
                  border 1px solid #ddd
                  border-radius 50%
                  background #fff
                  box-shadow 0 2px 4px 0 rgba(0,0,0,.1)
                  transition transform .3s
                  &.right
                    transform translateX(30px)
            .login_hint
              margin-top 12px
              color #999
              font-size 14px
              line-height 20px
              >a
                color #02a774
          .login_submit
            display block
            width 100%
            height 42px
            margin-top 30px
            border-radius 4px
            background #4cd96f
            color #fff
            text-align center
            font-size 16px
            line-height 42px
            border 0
        .about_us
          display block
          font-size 12px
          margin-top 20px
          text-align center
          color #999
      .go_back
        position absolute
        top 5px
        left 5px
        width 30px
        height 30px
        >.iconfont
          font-size 20px
          color #999
</style>
