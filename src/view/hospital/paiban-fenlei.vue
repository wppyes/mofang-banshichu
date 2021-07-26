<template>
  <div class="menus boxright">
    <div class="filter-container">
        <div class="filter-item">
          <el-button type="primary" @click="handleadd('增加类型',true)"><i class="el-icon-circle-plus"></i> 增加类型</el-button>
        </div>
      </div>
    
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="类型" prop="Name" align="center">
      </el-table-column>
      <el-table-column label="排序" align="center">
         <template slot-scope="scope">
          <span @click="sort(scope.row,scope.$index,-1)" :class="scope.$index==0?'disabled':''">  
          <i class="fa fa-arrow-up"></i>上移  
          </span>&nbsp;&nbsp;&nbsp;  
          <span @click="sort(scope.row,scope.$index,+1)" :class="scope.$index==list.length-1?'disabled':''">  
          <i class="fa fa-arrow-down"></i>下移  
          </span> 
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
         <template slot-scope="scope">
          <el-button
            size="mini"  type="primary"
            @click="handleditor(scope.row,'修改',false)"><i class="el-icon-edit"></i> 编辑</el-button>
          <el-button
            size="mini" type="danger"
            @click="handledel(scope.row)"><i class="el-icon-delete"></i> 删除</el-button>
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
  name: "menus",
  components: { Pagination },
  data() {
    return {
      list: [], //列表
      total:0,//总数量
      listLoading: false, //列表加载   
      listQuery: {
        pageIndex: 1,
        pageSize: 15,
      },
      temp: {
        Id: 0,
        Name: '',
      },
      flag:true,//排序连点禁止
      dialogStatus:'',//面板标题    
      dialogFormVisible: false,//面板是否展示
      iscreate:false,//是否是添加
      rules: {
        Name: [{ required: true, message: '名称必须填写！', trigger: 'blur' }]
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList(){
      this.listLoading = true;
      request({
        url: "HospitalSchedulingType/GetHospitalSchedulingTypeList",
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
    handleditor(row,title,creat){      
      this.temp={
        Id: row.Id,
        Name: row.Name
      };
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.iscreate=creat;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handledel(row,title){
      var data=this.$qs.stringify({Id:row.Id});
      this.$confirm("确定要删除吗？", '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
           request({
            url: "HospitalSchedulingType/Del",
            method: "post",
            data
          }).then(response => {
            if(response.Status==1){
              this.$message({
                message: response.Msg,
                type: 'success'
              });          
              const index = this.list.indexOf(row)
              this.list.splice(index, 1)
            }                      
          });
        }).catch(() => {         
      })  
    },
    handleadd(title,creat){   
      this.temp={
        Id: 0,
        Name: '',
      }; 
      this.iscreate=creat;
      this.dialogStatus = title;
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData(){
      var data=this.$qs.stringify(this.temp);
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {              
          request({
            url: "HospitalSchedulingType/SetHospitalSchedulingType",
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
    sort: function (item, index, type) {//使用方法：传递当前数组的item,index下标,-1为上移，+1为下移  
        this.setup(item, index, type,this.list);
    },
    setup: function (item, index, type, arr1) {
        if (!this.flag) {
            return;
        }
        this.flag = false;
        if ((type < 0 && index == 0) || (type > 0 && index == arr1.length - 1)) {
            return;
        }; 
        var temp = arr1[index];        
        var id1 = item.Id, id2 = arr1[index + type].Id;//当前id为 id1,替换id为id2
        var data=this.$qs.stringify({id1: id1, id2: id2,});
        request({
          url: "HospitalSchedulingType/Sort",
          method: "post",
          data
        }).then(response => {
          if(response.Status==1){              
            this.$set(arr1, index, arr1[index + type]);
            this.$set(arr1, index + type, temp);
          }
          this.flag = true;
        });
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
  .menus .disabled{color: #C0C4CC;}
  .menus span{cursor: pointer;}
</style>
