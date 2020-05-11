<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddClassDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="classList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_delete === false"
            style="color: lightgreen"
          ></i>
          
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <el-button size="small "  type="primary" icon="el-icon-edit"  @click="showEditDialog(scope.row.cat_id)"></el-button>
          <el-button size="small " type="danger" icon="el-icon-delete" @click="removeClass(scope.row.cat_id)"></el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%"
       @close="addDialogClosed">
        <!-- 添加分类的表单  -->
        <el-form
          :model="addClassModle"
          :rules="addClassRules"
          ref="addClassRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addClassModle.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!--options用来指定数据源 -->
            <!--props用来指定配置对象 -->
            <el-cascader          
              v-model="selectKeys"
              :options="parentsClassList"
              :props="cascaderProps"
              @change="parentClassChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addClass">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品分类列表，默认为空
      classList: [],
      //总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //表示把当前列定义为模板列
          type: "template",
          //表示当前列使用的模板名称
          template: "isOK"
        },
        {
          label: "排序",
          //表示把当前列定义为模板列
          type: "template",
          //表示当前列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          //表示把当前列定义为模板列
          type: "template",
          //表示当前列使用的模板名称
          template: "operation"
        }
      ],
      //控制添加分类对话框的显示与隐藏
      addDialogVisible: false,
      //控制修改分类对话框的显示与隐藏
      editDialogVisible: false,
      //添加分类的数据对象
      addClassModle: {
        //名称
        cat_name: "",
        //父级id
        cat_pid: 0,
        //分类等级
        cat_level: 0
      },
      editForm: {
        cat_id: '',
        cat_name:'',
      },
      //添加分类表单的验证规则对象
      addClassRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //修改分类表单的验证规则对象
      addFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //父级分类的数据列表
      parentsClassList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover' ,
        checkStrictly : true   ,     
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //选中的父级分类的Id数组
      selectKeys: []
    };
  },
  created() {
    this.getClassList();
    this.addGetClassListf();
  },
  methods: {
    //获取商品分类数据
    async getClassList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      console.log(res.data);
      //数据列表复制
      this.classList = res.data.result;
      this.total = res.data.total;
    },
     async addGetClassListf() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      //数据列表复制
      this.parentsClassList = res.data;
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getClassList();
    },
    //监听pageNum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getClassList();
    },
    //显示添加框
    showAddClassDialog() {
      this.getParentsClassList();
      this.addDialogVisible = true;
    },
    //获取父级分类的分类列表
    async getParentsClassList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！");
      }
         console.log(res.data)
      this.parentsClassList = res.data;

 
      console.log(this.parentsClassList)
     
    },
    //选择项发生变化时触发
    parentClassChange() {
      //如果selectKeys 数组中的length大于0，证明选中了父级分类
      //反之，就说明没有选中任何父级分类
      if (this.selectKeys.length > 0 ){
        //父级分类的id
        this.addClassModle.cat_pid = this.selectKeys[this.selectKeys.length-1];
         //为当前分类的等级赋值
        this.addClassModle.cat_level = this.selectKeys.length;
        
        return
      }else{
        this.addClassModle.cat_pid = 0;
        this.addClassModle.cat_level = 0;
      }
     
    },
    //提交添加分类
    addClass() {
      this.$refs.addClassRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('categories', this.addClassModle);
        if(res.meta.status !==201) {
          return this.$message.error('添加分类失败!')
        }
        this.$message.success('添加分类成功！')
        this.getClassList();
        this.addDialogVisible = false;
      })
    },
    // 监听对话框的关闭，重置表单数据
    addDialogClosed() {
        this.$refs.addClassRef.resetFields();
        this.selectKeys = [];
        this.addClassModle.cat_pid = 0;
        this.addClassModle.cat_level = 0;
    },
    //删除分类
    async removeClass(id){
       //弹框询问是否删除
     const confirmResults = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //如果用户确认，返回字符串confirm
        //如果用户取消，返回字符串cancel
        if(confirmResults !== "confirm") {
            return this.$message.info('已取消删除！');
        }
       const {data: res} =  await this.$http.delete('categories/' + id);
       if (res.meta.status !== 200){
           return this.$message.error('删除分类失败！');
       }
         this.$message.success('删除分类成功！');
         //刷新用户列表
         this.getClassList();
    },
    //修改分类
   async showEditDialog(id){
 
     const {data: res} = await this.$http.get('categories/'+id)
     console.log(res)
     if (res.meta.status !== 200){
       return this.$message.error("查询分类失败");
     }
    this.editForm = res.data
    this.editDialogVisible = true

    },
    //监控修改对话框的关闭
    editDialogClose(){
       this.$refs.editFormRef.resetFields();
    },
    //修改分类提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        //可以发起添加用户的网络请求
        const { data: res } = await this.$http.put("categories/" + this.editForm.cat_id,{cat_name:this.editForm.cat_name});
        if (res.meta.status !== 200) {
          this.$message.error("修改分类失败");
        }
        //隐藏添加用户的对话框
        this.editDialogVisible = false;
        //重新获取用户列表数据
        this.getClassList();
        this.$message.success("修改分类成功");
      })
    }
  }
};
</script>


<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>