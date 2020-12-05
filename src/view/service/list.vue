<template>
  <div class="list boxright">
     <el-tabs v-model="listQuery.type" type="card" @tab-click="getList()">
        <el-tab-pane v-for="item in CategoryList" :label="item.Name" :name="item.Id.toString()" :key="item.Id"></el-tab-pane>
      </el-tabs>
    <div class="filter-container">
      <div class="filter-item" style="margin-right:20px;">
        <el-button type="primary" @click="handleadd(0)">
          <i class="el-icon-circle-plus"></i> 增加
        </el-button>
      </div>
      <el-input
        placeholder="请输入标题"
        v-model="listQuery.title"
        style="width: 150px;"
        class="filter-item"
        clearable
      />  
        <el-date-picker
        class="filter-item"
        v-model="times"
        type="daterange"
        align="left"
        unlink-panels
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
      ></el-date-picker>  
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>   
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="标题" align="left" prop="Title"></el-table-column> 
      <el-table-column label="浏览量" align="center" prop="Count" width="150px"></el-table-column> 
      <el-table-column label="排序" align="center" width="200px">
         <template slot-scope="scope">
          <span @click="sort(scope.row,scope.$index,-1)" :class="scope.$index==0?'disabled':''">  
          <i class="fa fa-arrow-up"></i>上移  
          </span>&nbsp;&nbsp;&nbsp;  
          <span @click="sort(scope.row,scope.$index,+1)" :class="scope.$index==list.length-1?'disabled':''">  
          <i class="fa fa-arrow-down"></i>下移  
          </span> 
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center"  width="300px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="zhiding(scope.row,1,'设为热门')" v-if="scope.row.IsTopping==0">
            设为热门
          </el-button>
          <el-button size="mini" type="danger" @click="zhiding(scope.row,0,'取消热门')" v-if="scope.row.IsTopping==1">
            取消热门
          </el-button>
          <el-button size="mini" type="primary" @click="handleadd(scope.row.Id)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button size="mini" type="danger" @click="handledel(scope.row,5,'删除')" >
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
  </div>
</template>
<script>
import request from "@/utils/request";
import Pagination from "@/components/Pagination";
export default {
  name: "advise",
  components: { Pagination },
  data() {
    return {
      list: [], //列表
      total:0,//总数量
      listLoading: false, //列表加载
      listQuery: {
        pageIndex: 1,
        pageSize: 10,
        type:'',
        title:'',
        starttime:'',
        endtime:''
      },
      flag:true,//排序连点禁止
      times:'',
      CategoryList:[],
    };
  },
  created() {        
    request({
      url: "Service/GetDDL",
      method: "get",
      params: {}
    }).then(response => {
      if (response.Status == 1) {
        this.CategoryList=response.List;
        if(response.List[0]){
          this.listQuery.type=response.List[0].Id.toString();
        }        
        this.getList(); 
      }
    });
  },
  mounted () {
    this.$bus.$on('servicehange', ()=> {
      this.getList()
    })
  },   
  watch: {
    times(val, oldval) {
      if(val){
        this.listQuery.starttime = val[0];
        this.listQuery.endtime = val[1];
      }else{
        this.listQuery.starttime='';
        this.listQuery.endtime='';
      }
    }
  },
  methods: {
    setstatus(code){
      for(let i in this.CategoryList){
        if(this.CategoryList[i].Id == code){
          return this.CategoryList[i].Name;
        }
      }
    },
    getList(){
      this.listLoading = true;
      request({
        url: "Service/GetServiceList",
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
    handledel(row) {
      var data = this.$qs.stringify({ Id: row.Id});
      this.$confirm("确定要删除吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "Service/Del",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              const index = this.list.indexOf(row);
                this.list.splice(index, 1);
                this.$message({
                    message: response.Msg,
                    type: "success"
                });
            }
          });
        })
        .catch(() => {});
    }, 
    handleadd(id){
      this.$router.push({
        path: "list/add",
        query: { id:id }
      });
    },
    zhiding(row,type,str){
      var data = this.$qs.stringify({ Id: row.Id,IsTopping:type});
      this.$confirm("确定要"+str+"吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "Service/UpdateIsTopping",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
                this.$message({
                    message: response.Msg,
                    type: "success"
                });
                row.IsTopping=type;
                this.getList();
            }
          });
        })
        .catch(() => {});
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
          url: "Service/Sort",
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
.list{
  .status3{color:#F56C6C;}
  .status0{color:#67C23A;}
  .status1{color:#E6A23C;}
  .status2{color:#409EFF;}
  .status4{color:#909399;}
  .disabled{color: #C0C4CC;}
  span{cursor: pointer;}
  
  .chicun {
    color: #f00;
  }
}
</style>
