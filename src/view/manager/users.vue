<template>
  <div class="user boxright">
    <div class="filter-container">
        <el-button type="primary" class="filter-item" @click="handleadd('增加角色',true)">
          <i class="el-icon-circle-plus"></i> 增加用户
        </el-button>
        <el-input
          placeholder="请输入名称"
          v-model="listQuery.name"
          style="width: 150px;"
          class="filter-item"
          clearable
        /> 
        <el-select
          v-model="listQuery.status"
          placeholder="状态"
          clearable
          style="width: 150px"
          class="filter-item"
        >
          <el-option v-for="item in StatusList" :label="item.Text" :value="item.Value" :key="item.Value"></el-option>
        </el-select> 
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button> 
     
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="登录名" prop="Login" align="center"></el-table-column>
      <el-table-column label="用户名" prop="Name" align="center"></el-table-column>
      <el-table-column label="角色" prop="RoleName" align="center"></el-table-column>
      <el-table-column label="社区" prop="OCName" align="center"></el-table-column>
      <el-table-column label="状态" align="center" width="200px" class="tdspan">
        <template slot-scope="scope">
          <span v-if="scope.row.Status==0" class="maincolor">启用</span>
          <span v-if="scope.row.Status==1" class="orangecolor">禁用</span>
          <el-button size="mini" type="warn" @click="updatastatus(scope.row)">
            <i class="el-icon-edit"></i> 点击修改
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="reset(scope.row)">重置密码</el-button>
          <el-button size="mini" type="primary" @click="handleditor(scope.row,'修改用户',false)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button size="mini" type="danger" @click="handledel(scope.row)">
            <i class="el-icon-delete"></i>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      small
      :total="total"
      :page.sync="listQuery.pageIndex"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="550px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="100px"
        style="width: 400px; "
      >
        <el-form-item label="登录名" prop="Login">
          <el-input v-model="temp.Login" placeholder="请填写登录名" :disabled="temp.Id>0"/>
        </el-form-item>
        <el-form-item label="姓名" prop="Name">
          <el-input v-model="temp.Name" placeholder="请填写姓名"/>
        </el-form-item>
        <el-form-item label="角色" prop="RoleId">
          <el-select v-model="temp.RoleId" placeholder="请选择角色" @change="getroletype">
            <el-option v-for="item in rolelist" :label="item.Name" :key="item.Id" :value="item.Id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=" 社区" prop="OCId" v-if="roletype==2">
          <el-select v-model="temp.OCId" placeholder="请选择社区" clearable>
            <el-option v-for="item in shequlist" :label="item.Name" :key="item.Id" :value="item.Id"></el-option>
          </el-select>
          <!-- <div style="color:#f00">需要网格员必选，其它情况可以不选择</div> -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="iscreate?createData():updataData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import request from "@/utils/request";
import Pagination from "@/components/Pagination";
export default {
  components: { Pagination },
  name: "user",
  data() {
    return {
      list: null,
      listLoading: true,
      rolelist: [], //角色列表
      roletype:'',
      temp: {
        Id: 0,
        Login: "",
        Name: "",
        RoleId: '',
        OCId:''
      },
      total:0,//总数量
      listQuery: {
        pageIndex: 1,
        pageSize: 11,
        name:'',
        status:''
      },
      shequlist:[],
      StatusList:[],
      dialogStatus: "", //面板标题
      dialogFormVisible: false, //面板是否展示
      iscreate: false, //是否是添加
      rules: {
        Login: [
          { required: true, message: "登录名必须填写！", trigger: "blur" }
        ],
        Name: [
          { required: true, message: "用户名必须填写！", trigger: "blur" }
        ],
        RoleId: [{ required: true, message: "角色必须选择！", trigger: "change" }],
        OCId: [
          { required: true, message: "社区必须填写！", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    request({
      url: "Users/UserList",
      method: "get",
      params: {}
    }).then(response => { 
      if(response.Status==1){ 
        this.rolelist = response.RoleList;
        this.StatusList = response.StatusList;
        this.shequlist=response.List;
      }
    });
    this.getList();
  },
  methods: {
    getroletype(){
        for(let i in this.rolelist){
            if(this.rolelist[i].Id==this.temp.RoleId){
                this.roletype=this.rolelist[i].Type;
                return
            }
            
        }
    },
    getList(){
      this.listLoading = true;
      request({
        url: "Users/GetEmployeeList",
        method: "get",
        params: this.listQuery
      }).then(response => {
        if (response.Status == 1) {
          this.list = response.List;
          this.total = response.PageCount;
          this.listLoading = false;
        }
      });
    },
    handleFilter() {
      this.listQuery.pageIndex = 1;
      this.getList();
    }, 
    handleditor(row, title, creat) {
      this.temp = {
        Id: row.Id,
        Login: row.Login,
        Name: row.Name,
        RoleId: row.Role
      };
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.iscreate = creat;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updatastatus(row){
      this.$confirm("确定要修改状态吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          var statu = 0;
          row.Status == 0?statu = 1:statu = 0;
          var data = this.$qs.stringify({ Id: row.Id,Status: statu});
          request({
            url: "Users/ChangeStatus",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              row.Status = statu;
              this.$message({
                message: response.Msg,
                type: "success"
              });
            }
          });
        })
        .catch(() => {});
    },
    reset(row){
      var data = this.$qs.stringify({ Id: row.Id });
      this.$confirm("确定要重置密码吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "Users/ResetPwd",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.$message({
                message: response.Msg,
                type: "success"
              });
            }
          });
        })
        .catch(() => {});
    },
    handledel(row) {
      var data = this.$qs.stringify({ Id: row.Id });
      this.$confirm("确定要删除用户吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "Users/DelUser",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.$message({
                message: response.Msg,
                type: "success"
              });
              this.$bus.$emit("userschange");
              const index = this.list.indexOf(row);
              this.list.splice(index, 1);
            }
          });
        })
        .catch(() => {});
    },
    handleadd(title, creat) {
      this.temp = {
        Id: 0,
        Login: "",
        Name: "",
        RoleId: ''
      };
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.iscreate = creat;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          var data = this.$qs.stringify(this.temp);
          request({
            url: "Users/CreatUser",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.$bus.$emit("userschange");
              this.getList()
              this.dialogFormVisible = false;
              this.$message({
                message: response.Msg,
                type: "success"
              });
            }
          });
        }
      });
    },
    updataData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          var data = this.$qs.stringify(this.temp);
          request({
            url: "Users/Modify",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {   
              this.getList()
              this.dialogFormVisible = false;
              this.$message({
                message: response.Msg,
                type: "success"
              });
            }
          });
        }
      });
    },
    getrolename(id){
        for(let i in this.rolelist){
            if(this.rolelist[i].Id==id){
                return this.rolelist[i].Name
            }
        }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
.user .tdspan span {
  margin-right: 10px;
}
</style>
