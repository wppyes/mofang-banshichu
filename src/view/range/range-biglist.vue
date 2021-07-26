<template>
  <div class="rangebiglist boxright">
    <div class="filter-container">
      <div class="filter-item" style="margin-right:20px;">
        <el-button type="primary" @click="handleadd('增加榜单',true)">
          <i class="el-icon-circle-plus"></i> 增加榜单
        </el-button>
      </div>
      <el-input
        placeholder="请输入名称"
        v-model="listQuery.title"
        style="width: 150px;"
        class="filter-item"
        clearable
      />  
      <el-select
        v-model="listQuery.status"
        placeholder="选择状态"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option v-for="item in Model" :label="item.Text" :value="item.Value" :key="item.Value"></el-option>
      </el-select> 
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button> 
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="标题" prop="Title" align="center"></el-table-column>
      <el-table-column label="状态" prop="Status" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.Status==0" class="status0">正常</span>
          <span v-if="scope.row.Status==1" class="status1">已上线</span>
          <span v-if="scope.row.Status==2" class="status2">已下线</span>
          <span v-if="scope.row.Status==3" class="status3">已删除</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleditor(scope.row,'修改',false)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button size="mini" type="primary" v-if="scope.row.Status==2 || scope.row.Status==0 " @click="handledel(scope.row,1,'上线')">
            上线
          </el-button>
          <el-button size="mini" type="danger" v-if="scope.row.Status==1 || scope.row.Status==0 " @click="handledel(scope.row,2,'下线')">
            下线
          </el-button>
          <el-button size="mini" type="danger" v-if="scope.row.Status!=3 " @click="handledel(scope.row,3,'删除')">
            <i class="el-icon-delete"></i>
          </el-button>
          <el-button size="mini" type="danger" v-if="scope.row.Status==3 " @click="handledel(scope.row,0,'恢复')">
            恢复
          </el-button>
          <el-button size="mini" type="primary" @click="renyan(scope.row)">
            设置人员
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
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="标题" prop="Title">
          <el-input v-model="temp.Title" placeholder="请填写标题"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createData">确定</el-button>
      </div>
    </el-dialog> 
  </div>
</template>
<script>
import request from "@/utils/request";
import Pagination from "@/components/Pagination";
export default {
  name: "user",
  components: { Pagination },
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 15,
        title:''
      },
      Model:[],
      total:0,//总数量
      temp: {
        Id: 0,
        Title: ""
      },
      dialogStatus: "", //面板标题
      dialogFormVisible: false, //面板是否展示
      dialogwuliuVisible:false,
      iscreate: false, //是否是添加
      rules: {
        Title: [
          { required: true, message: "标题必须填写！", trigger: "blur" }
        ],
      },
    };
  },
  created() {
    this.getList();    
    request({
      url: "RankingColumn/GetDDL",
      method: "get",
      params: {}
    }).then(response => {
      if (response.Status == 1) {
        this.Model = response.List;
      }
    });
  },
  methods: {
    renyan(row){      
      this.$router.push({
        path: "range-list/range-biglist",
        query: { id:row.Id }
      });
    },
    getList(){
      this.listLoading = true;
      request({
        url: "RankingColumn/GetHonourRollColumnList",
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
        Title: row.Title
      };
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.iscreate = creat;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
     handledel(row,value,str) {
      var data = this.$qs.stringify({ Id: row.Id,Status:value});
      this.$confirm("确定要"+str+"该榜单吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "RankingColumn/Update",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.$message({
                message: response.Msg,
                type: "success"
              });
              if(value==3){
                const index = this.list.indexOf(row);
                this.list.splice(index, 1);
              }else{
                row.Status=value;
              }
            }
          });
        })
        .catch(() => {});
    },
    handleadd(title, creat) {
      this.temp = {
        Id: 0,
        Title: ""
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
            url: "RankingColumn/SetRankingColumn",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              if(this.iscreate){
                var param={
                  Id:response.Id,
                  Title:this.temp.Title
                }
                this.list.push(param);
              }else{
                for(let i in this.list){
                  if(this.list[i].Id==this.temp.Id){
                    this.list[i].Title=this.temp.Title;
                  }
                }
              }
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
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
.rangebiglist{
  .status0{color: #67C23A;}
  .status2{color: #E6A23C;}
  .status3{color: #F56C6C;}
  .status1{color: #409EFF;}
  .gary{color: #909399;}
}
</style>
