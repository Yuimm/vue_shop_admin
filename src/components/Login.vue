<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avater_box">
                <img src="../assets/school.jpg" alt="湖南工业大学">
            </div>
            <!-- 登录表单区域 -->
            <el-form ref="loginFormRef" :model="loginForm"  label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="usernameRule">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-search"></el-input>
                </el-form-item>
                <!-- 密码 -->
                 <el-form-item prop="passwordRule">
                    <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-search"></el-input>
                </el-form-item>
                  <!-- 按钮 -->
                 <el-form-item class="btns">
                     <el-button type="primary" @click="login">登录</el-button>
                     <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //登录表单的数据绑定对象
            loginForm:{
                username: 'admin',
                password: '123456'
            },
            // //表单验证规则,有bug
            //:rules="loginFormRules"
            //  loginFormRules: {
            //     usernameRule: [
            //         { required: true, message: '请输入登录名称', trigger: 'blur' },
            //         { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
            //     ],
            //     passwordRule: [
            //         { required: true, message: '请输入登录密码', trigger: 'blur' },
            //         { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
            //     ]         
            // }
        }
    },
    methods: {
        //点击重置表单
        resetLoginForm(){
            this.$refs.loginFormRef.resetFields();
        },
        login(){
            this.$refs.loginFormRef.validate(async valid => {
                if(!valid) return;
               const {data:res} = await this.$http.post("login",this.loginForm);
               if(res.meta.status !==200 ) return this.$message.error("登录失败! 用户名或密码错误……");
               this.$message.success("登录成功");
               //将登陆成功后的token，保存到客户端的sessionStorage中
               //项目中除了登录之外的其他API接口，必须在登录之后才能访问
               //token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
                window.sessionStorage.setItem('token',res.data.token);
               //通过编程式导航跳转到后台主页，路由地址是 /home
               this.$router.push('/home');
              
            });
        }
    }
}
</script>


<style lang="less" scoped>
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
    }
    .login_box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);

        .avater_box{

            width: 130px;
            height: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;

            img{
                width: 100%;    
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }
    }

.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
}
    
.btns{
    display: flex;
    justify-content: flex-end;
}

</style>