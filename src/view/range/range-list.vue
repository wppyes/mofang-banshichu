<template>
  <div class="user boxright">
    <div class="filter-container">
      <div class="filter-item" style="margin-right:20px;">
        <el-button type="primary" @click="handleadd('增加人员',true)">
          <i class="el-icon-circle-plus"></i> 增加人员
        </el-button>
      </div>
      <el-input
        placeholder="请输入名字"
        v-model="listQuery.name"
        style="width: 150px;"
        class="filter-item"
        clearable
      />  
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>   
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleup">批量上传人员</el-button>
      <div class="filter-item text-red">请谨慎上传，会重置数据</div>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="名字" prop="Name" align="center"></el-table-column>
      <el-table-column label="积分" prop="Number" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleditor(scope.row,'修改',false)">
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
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="姓名" prop="Name">
          <el-input v-model="temp.Name" placeholder="请填写姓名"/>
        </el-form-item>
        <el-form-item label="积分" prop="Number">
          <el-input v-model="temp.Number" placeholder="请填写积分"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createData">确定</el-button>
      </div>
    </el-dialog>    
    <el-dialog title="批量设置人员" :visible.sync="dialogwuliuVisible" :close-on-click-modal="false" width="650px">
      <el-form
        ref="datawuliu"
        :rules="ruleswuliu"
        :model="temp1"
        label-position="left"
        label-width="100px"
        style="width: 350px; margin-left:50px;"
      >        
        <el-form-item label="文件上传" prop="filepath">          
          <el-upload
              class="upload-demo"
              drag
              ref="upload"
              accept=".xls,.xlsx"
              action=""
              :http-request="upLoad"
              >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传xls文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogwuliuVisible = false">取消</el-button>
        <el-button type="primary" @click="subwuliu">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import request from "@/utils/request";
import Pagination from "@/components/Pagination";
import upfile from '@/utils/upload';
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
        name:''
      },
      total:0,//总数量
      temp: {
        Id: 0,
        Name: "",
        Number: ""
      },
      temp1:{
        filepath:''
      },
      dialogStatus: "", //面板标题
      dialogFormVisible: false, //面板是否展示
      dialogwuliuVisible:false,
      iscreate: false, //是否是添加
      rules: {
        Number: [
          { required: true, message: "积分必须填写！", trigger: "blur" }
        ],
        Name: [
          { required: true, message: "名字必须填写！", trigger: "blur" }
        ],
      },
      ruleswuliu:{  
        filepath: [
          { required: true, message: "请上传文件！", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleup(){
      this.dialogwuliuVisible=true;
      this.temp1.filepath='';
      this.$refs.upload.clearFiles()  
      this.$nextTick(() => {
        this.$refs["datawuliu"].clearValidate();
      });
    }, 
    upLoad(param){
         upfile(param.file,'Upload/UploadFile',(data => {
             if(data.Status){
                 this.temp1.filepath=data.Path;
             }else{
                 this.$message({
                    message: data.Msg,
                    type: "error"
                });
             };
         }))
    }, 
    subwuliu(){
      this.$refs["datawuliu"].validate(valid => {
        if (valid) { 
          var param={
              filepath:this.temp1.filepath
          };  
          var data = this.$qs.stringify(param);
          request({
            url: "Ranking/RankingWork",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.getList();    
              this.dialogwuliuVisible = false;
              this.$message({
                message: response.Msg,
                type: "success"
              });
            }
          });
        }
      });
    }, 
    getList(){
      this.listLoading = true;
      request({
        url: "Ranking/GetRankingList",
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
        Name: row.Name,
        Number: row.Number
      };
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.iscreate = creat;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
     handledel(row) {
      var data = this.$qs.stringify({ Id: row.Id });
      this.$confirm("确定要删除人员吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "Ranking/Del",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.$message({
                message: response.Msg,
                type: "success"
              });
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
        Name: "",
        Number: ''
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
            url: "Ranking/SetRanking",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              if(this.iscreate){
                var param={
                  Id:this.temp.Id,
                  Name:this.temp.Name,
                  Number:this.temp.Number
                }
                this.list.push(this.temp);
              }else{
                for(let i in this.list){
                  if(this.list[i].Id==this.temp.Id){
                    this.list[i].Name=this.temp.Name;
                    this.list[i].Number=this.temp.Number;
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
.user .text-red{margin-left: 20px; color: #f00;}
</style>
