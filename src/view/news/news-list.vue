<template>
  <div class="news boxright">
    <div class="filter-container">
      <div class="filter-item" style="margin-right:20px;">
        <el-button type="primary" @click="linktoadd(0)">
          <i class="el-icon-circle-plus"></i> 增加新闻
        </el-button>
      </div>
      <el-input
        placeholder="请输入标题"
        v-model="listQuery.title"
        style="width: 150px;"
        class="filter-item"
        clearable
      />  
      
      <el-select
        v-model="listQuery.classify"
        placeholder="分类"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option v-for="item in CategoryList" :label="item.Text" :value="item.Value" :key="item.Value"></el-option>
      </el-select>
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
      <el-table-column label="标题" align="left" prop="Title" width="700px"></el-table-column>
      <el-table-column label="点击量" align="center" prop="Count" width="100px"></el-table-column> 
      <el-table-column label="U+系统" align="center" prop="IsSynchro" width="100px">
        <template slot-scope="scope">
          <span :class="'status'+scope.row.IsSynchro">{{scope.row.IsSynchro==0?'未同步':'同步'}}</span>
        </template>
      </el-table-column> 
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="linktoadd(scope.row.Id)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button size="mini" type="danger" @click="handledel(scope.row)" >
            <i class="el-icon-delete"></i>
          </el-button>
          <el-button size="mini" type="primary" @click="zhiding(scope.row)">
            置顶
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
  name: "news",
  components: { Pagination },
  data() {
    return {
      list: [], //列表
      total:0,//总数量
      listLoading: false, //列表加载
      listQuery: {
        pageIndex: 1,
        pageSize: 15,
        type:1,
        title:'',
        starttime:'',
        endtime:'',
        classify:''
      },
      times:'',
      CategoryList:[]
    };
  },
  created() {        
    request({
      url: "News/GetDDL",
      method: "get",
      params: {}
    }).then(response => {
      if (response.Status == 1) {
        this.CategoryList=response.List;
      }
    });
    this.getList(); 
  },
  mounted () {
    this.$bus.$on('newschange', ()=> {
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
    getList(){
      this.listLoading = true;
      request({
        url: "News/GetNewsList",
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
    zhiding(row){
      var data = this.$qs.stringify({ Id: row.Id});
      this.$confirm("确定要置顶该新闻吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "News/Update",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              this.getList()
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
      var data = this.$qs.stringify({ Id: row.Id});
      this.$confirm("确定要删除该新闻吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "News/Del",
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
    linktoadd(id){
      this.$router.push({
        path: "/news/news-list/add-new",
        query: { id:id }
      });
    },
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
  .news{
    .status0{color: #999;}
    .status1{color: #409EFF;}
  }
</style>
