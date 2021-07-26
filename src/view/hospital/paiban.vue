<template>
  <div class="zhiban boxright">
     <el-tabs v-model="listQuery.type" type="card" @tab-click="handleFilter">
      <el-tab-pane label="本周" name="1"></el-tab-pane>
      <el-tab-pane label="下周" name="2"></el-tab-pane>
    </el-tabs>
    <table class="tables" border="0">
      <thead>
        <tr>
          <th>姓名</th>
          <th>周一</th>
          <th>周二</th>
          <th>周三</th>
          <th>周四</th>
          <th>周五</th>
          <th>周六</th>
          <th>周日</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>4646</td>
          <td>4646</td>
          <td>4646</td>
          <td>4646</td>
          <td>4646</td>
          <td>4646</td>
          <td>4646</td>
          <td>4646</td>
        </tr>
      </tbody>
    </table>
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
        type:'1'
      },
      temp: {
        Id: 0,
        Name: '',
        Type:''
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
    handleFilter(){
      this.listQuery.pageIndex=1;
      this.getList();
    },
    getList(){
      this.listLoading = true;
      request({
        url: "HonourEvaluateType/GetHonourEvaluateTypeList",
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
        Name: row.Name,
        Type:this.listQuery.type
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
            url: "HonourEvaluateType/Del",
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
        Type:this.listQuery.type
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
            url: "HonourEvaluateType/SetHonourEvaluateType",
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
                       this.list[i].Type=this.temp.Type;
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
          url: "HonourEvaluateType/Sort",
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
  .zhiban {
    .disabled{color: #C0C4CC;}
    span{cursor: pointer;}
    .tables{width: 100%; border: 1px solid #f5f5f5; border-right: none; border-top: none;}
    .tables thead{line-height: 45px;}
    .tables th,.tables td{border-right: 1px solid #f5f5f5; border-top: 1px solid #f5f5f5; text-align: center;}
    .tables td{line-height: 35px; color: #333;}
  }
</style>
