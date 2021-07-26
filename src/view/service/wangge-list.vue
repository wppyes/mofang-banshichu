<template>
  <div class="rangebiglist boxright">
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
      <el-select
        v-model="listQuery.ocid"
        placeholder="选择网点"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option v-for="item in ListCom" :label="item.Name" :value="item.Id" :key="item.Id"></el-option>
      </el-select> 
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
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleup">批量上传人员</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="名字" prop="Name" align="center"></el-table-column>
      <el-table-column label="头像" prop="Img" align="center" width="100px">
        <template slot-scope="scope">
          <img :src="scope.row.Img" alt="" style="width:50px; height:50px">
        </template>
      </el-table-column>
      <el-table-column label="手机" prop="Phone" align="center"></el-table-column>
      <el-table-column label="网点" prop="OCName" align="center"></el-table-column>      
      <el-table-column label="状态" prop="Status" align="center">
        <template slot-scope="scope">
          <span v-text="setstatus(scope.row.Status)" :class="'status'+scope.row.Status">正常</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleditor(scope.row,'修改',false)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button size="mini" type="primary" v-if="scope.row.Status==1" @click="handledel(scope.row,'认证')">
            认证
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
        <el-form-item label="名字" prop="Name">
          <el-input v-model="temp.Name" placeholder="请填写名字"/>
        </el-form-item>  
        <el-form-item label="手机号码" prop="Phone">
          <el-input v-model="temp.Phone" placeholder="请填写手机号码"/>
        </el-form-item>  
        <el-form-item label="头像" prop="Img">   
          <Uploadimgs v-model="temp.Img" ref="upLoadimg"></Uploadimgs>
          <div class="chicun">尺寸：200*200</div>
        </el-form-item>  
        <el-form-item label="网点" prop="OCId">
          <el-select
            v-model="temp.OCId"
            placeholder="选择网点"
            clearable
            style="width: 150px"
          >
            <el-option v-for="item in ListCom" :label="item.Name" :value="item.Id" :key="item.Id"></el-option>
          </el-select> 
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
        <el-form-item label="网点" prop="ocid">
          <el-select
            v-model="temp1.ocid"
            placeholder="选择网点"
            clearable
            style="width: 150px"
          >
            <el-option v-for="item in ListCom" :label="item.Name" :value="item.Id" :key="item.Id"></el-option>
          </el-select> 
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
import Uploadimgs from '@/components/Uploadqiniu/single';
import upfile from '@/utils/upload';
import { isvalidPhone } from "@/utils/validate";
var validPhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入电话号码"));
  } else if (!isvalidPhone(value)) {
    callback(new Error("请输入正确的11位手机号码"));
  } else {
    callback();
  }
};
export default {
  name: "user",
  components: { Pagination,Uploadimgs },
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 7,
        name:'',
        ocid:'',
        status:''
      },
      Model:[],
      ListCom:[],
      total:0,//总数量
      temp: {
        Id: 0,
        Name: "",
        Phone:'',
        Img:'',
        OCId:''
      },
      dialogStatus: "", //面板标题
      dialogFormVisible: false, //面板是否展示
      dialogwuliuVisible:false,
      iscreate: false, //是否是添加
      dialogwuliuVisible:false,
      temp1:{
        filepath:'',
        ocid:''
      },
      rules: {
        Name: [
          { required: true, message: "姓名必须填写！", trigger: "blur" }
        ],
        Phone: [
          { required: true, message: "手机必须填写！", trigger: ["blur"], validator: validPhone }
        ],
        OCId: [
          { required: true, message: "网点必须选择！", trigger: "blur" }
        ],
      },
      ruleswuliu:{  
        filepath: [
          { required: true, message: "请上传文件！", trigger: "blur" }
        ],
        ocid: [
          { required: true, message: "网点必须选择！", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();    
    request({
      url: "Authentication/GetDDL",
      method: "get",
      params: {}
    }).then(response => {
      if (response.Status == 1) {
        this.Model = response.List;
        this.ListCom=response.ListCom;
      }
    });
  },
  methods: {
    handleup(){
      this.dialogwuliuVisible=true;
      this.temp1.filepath='';
      this.$nextTick(() => {
        this.$refs["datawuliu"].clearValidate();
        this.$refs.upload.clearFiles()  
      });
    }, 
    upLoad(param){
         upfile(param.file,'Currency/UploadFile',(data => {
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
              filepath:this.temp1.filepath,
              ocid:this.temp1.ocid
          };  
          var data = this.$qs.stringify(param);
          request({
            url: "Authentication/RankingAut",
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
    setstatus(status){
      for(let i in this.Model){
        if(this.Model[i].Value == status){
          return this.Model[i].Text
        }
      }
    },
    renyan(row){      
      this.$router.push({
        path: "range-list/range-biglist",
        query: { id:row.Id }
      });
    },
    getList(){
      this.listLoading = true;
      request({
        url: "Authentication/GetAuthenticationList",
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
        Phone: row.Phone,
        Img: row.Img,
        OCId: row.OCId
      };
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.iscreate = creat;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
     handledel(row,str) {
      var data = this.$qs.stringify({ Id: row.Id});
      this.$confirm("确定要同意"+str+"该人员吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "Authentication/Update",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.$message({
                message: response.Msg,
                type: "success"
              });
              row.Status=2;
            }
          });
        })
        .catch(() => {});
    },
    handleadd(title, creat) {
      this.temp = {
        Id: 0,
        Name: "",
        Phone:'',
        Img:'',
        OCId:''
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
            url: "Authentication/SetAuthentication",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              if(this.iscreate){
                var str='';
                for(let i in this.ListCom){
                  if(this.ListCom[i].Id==this.temp.OCId){
                    str=this.ListCom[i].Name;
                    break
                  }
                }
                var param={
                  Id:response.Id,
                  Name:this.temp.Name,
                  Phone:this.temp.Phone,
                  Img:this.temp.Img,
                  OCId:this.temp.OCId,
                  OCName:str
                }
                this.list.push(param);
              }else{
                for(let i in this.list){
                  if(this.list[i].Id==this.temp.Id){
                    this.list[i].Name=this.temp.Name;
                    this.list[i].Phone=this.temp.Phone;
                    this.list[i].Img=this.temp.Img;
                    this.list[i].OCId=this.temp.OCId;
                    this.list[i].OCName=str;
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
