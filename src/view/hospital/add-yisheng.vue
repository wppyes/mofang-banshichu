<template>
  <div class="user spai boxright">
    <div class="back">
      <span @click="backto">
        <i class="el-icon-arrow-left"></i>返回
      </span>
    </div>
    <div class="filter-container">
      <div class="filter-item" style="margin-right: 20px">
        <el-button type="primary" @click="handleadd('增加医生',true)">
          <i class="el-icon-circle-plus"></i> 增加医生
        </el-button>
      </div>
      <el-input
        placeholder="请输入名字"
        v-model="listQuery.name"
        style="width: 150px"
        class="filter-item"
        clearable
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
        >搜索</el-button
      >
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="名字"
        prop="Name"
        align="center"
        width="200px"
      ></el-table-column>
      <el-table-column label="头像" prop="Img" align="center" width="100px">
        <template slot-scope="scope">
          <img :src="scope.row.Img" alt="" style="width: 50px" />
        </template>
      </el-table-column>
      <el-table-column
        label="职位"
        prop="Function"
        align="center"
        width="200px"
      ></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleditor(scope.row,'修改',false)"
          >
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="Name">
          <el-input v-model="temp.Name" placeholder="请填写名称"/>
        </el-form-item>
        <el-form-item label="图片：" prop="Img">   
          <Uploadimgs v-model="temp.Img" ref="upLoadimg"></Uploadimgs>
          <div class="chicun">尺寸：200*200</div>
        </el-form-item>  
        <el-form-item label="职位：" prop="Function">
          <el-input v-model="temp.Function" placeholder="请填写职位"/>
        </el-form-item> 
        <el-form-item label="描述：" prop="Details">
          <el-input type="textarea" rows="6" maxlength="100" v-model="temp.Details" placeholder="请填写描述"/>
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
import Uploadimgs from '@/components/Uploadqiniu/single';
export default {
  name: "user",
  components: { Pagination ,Uploadimgs},
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 8,
        name: "",
        id:''
      },
      total: 0, //总数量
      dialogStatus:'',
      dialogFormVisible:false,
      temp:{
        Id: 0,
        Name:'',
        Img:'',
        HId:'',
        Function:'',
        Details:''
      },
      iscreate:false,//是否是添加
      rules: {
        Name: [{ required: true, message: '名称必须填写！', trigger: 'blur' }],
        Img: [
          { required: true, message: "图片必须上传！", trigger: "blur" }
        ],
        Function: [{ required: true, message: '职位必须填写！', trigger: 'blur' }],
      },
    };
  },
  created() {
    this.listQuery.id = this.$route.query.id; 
    this.temp.HId = this.$route.query.id; 
    this.getList();
  },
  mounted() {
    this.$bus.$on("hospitalchange", () => {
      this.getList();
    });
  },
  methods: {    
    handleadd(title,creat){   
      this.temp={
        Id: 0,
        Name: '',
        Img:'http://static-cube.tintonesoft.com/hospital/pic/1618045252365.png',
        HId:this.$route.query.id,
        Function:'',
        Details:''
      }; 
      this.iscreate=creat;
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleditor(row,title,creat){      
      this.temp={
        Id: row.Id,
        Name: row.Name,
        Img: row.Img,
        HId:this.$route.query.id,
        Details:row.Details,
        Function:row.Function
      };
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.iscreate=creat;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    getList() {
      this.listLoading = true;
      request({
        url: "Hospital/GetHospitalDoctorList",
        method: "get",
        params: this.listQuery,
      }).then((response) => {
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
    backto() {   
      this.$router.go(-1);
    },
    createData(){
      var data=this.$qs.stringify(this.temp);
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {              
          request({
            url: "Hospital/SetHospitalDoctor",
            method: "post",
            data
          }).then(response => {
            if(response.Status==1){
              if(this.iscreate){
                this.temp.Id=response.Id;
                this.list.push(this.temp);            
              }else{
                for(let i in this.list) {
                    if (this.list[i].Id === this.temp.Id) {
                      this.list[i].Name=this.temp.Name;
                      this.list[i].Img=this.temp.Img;
                      this.list[i].Details=this.temp.Details;
                      this.list[i].Details=this.temp.Details;
                      break
                    }
                  }             
              }
              this.dialogFormVisible = false
              this.$message({
                message: response.Msg,
                type: 'success'
              })
            }
          });
        }
      })
    },
    handledel(row, value, str) {
      var data = this.$qs.stringify({ Id: row.Id,HId:this.$route.query.id });
      this.$confirm("确定要删除该医生吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          request({
            url: "Hospital/DelDoctor",
            method: "post",
            data,
          }).then((response) => {
            if (response.Status == 1) {
              const index = this.list.indexOf(row);
              this.list.splice(index, 1);
              this.$message({
                message: response.Msg,
                type: "success",
              });
            }
          });
        })
        .catch(() => {});
    },
  },
};
</script>
<style lang="scss" rel="stylesheet/scss">
.spai .text-red {
  margin-left: 20px;
  color: #f00;
}
.spai .chicun {
    color: #f00;
  }
</style>
