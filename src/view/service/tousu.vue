<template>
  <div class="advise boxright">
    <div class="filter-container">
      <el-input
        placeholder="请输入标题"
        v-model="listQuery.title"
        style="width: 150px;"
        class="filter-item"
        clearable
      />  
      
      <el-select
        v-model="listQuery.ocid"
        placeholder="社区"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option v-for="item in CList" :label="item.Name" :value="item.Id" :key="item.Id"></el-option>
      </el-select>
      <el-select
        v-model="listQuery.type"
        placeholder="分类"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option v-for="item in CategoryList" :label="item.Name" :value="item.Id" :key="item.Id"></el-option>
      </el-select>
      <el-select
        v-model="listQuery.status"
        placeholder="状态"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option v-for="item in StatusList" :label="item.Text" :value="item.Value" :key="item.Value"></el-option>
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
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter1">搜索</el-button>   
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="社区" align="center" prop="CommName" width="150px">

      </el-table-column>
      <el-table-column label="物业" align="center" prop="CellName" width="150px">
        <template slot-scope="scope">
          <span class="status2" style="cursor: pointer;" @click="searchwuye(scope.row)">{{scope.row.CellName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="left" prop="Title" width="300px"></el-table-column> 
      <el-table-column label="分配人员" align="center" prop="EmpName" width="100px">
         <template slot-scope="scope">
          <span class="status2" style="cursor: pointer;" @click="searchrenyuan(scope.row)">{{scope.row.EmpName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="CreatedStr" width="180px"></el-table-column>
      <el-table-column label="状态" align="center" prop="ReplyTimeStr" width="130px">
        <template slot-scope="scope">
          <span v-text="setstatus(scope.row.Status)" :class="'status'+scope.row.Status"></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="detail(scope.row,'详情')" v-if="scope.row.Status==2">
            详情
          </el-button>
          <el-button size="mini" type="primary" @click="handledel(scope.row,4,'完成')" v-if="scope.row.Status==3">
            确认完成
          </el-button>
          <el-button size="mini" type="primary" @click="fenpei(scope.row)" v-if="scope.row.Status==2">
            分配
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
    <el-dialog title="详情" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="1000px">
      <div style="font-weight:bold; font-size:20px">{{item.Title}}</div>
      <div style="margin:20px 0 20px 20px; font-size:18px">{{item.Details}}</div>
        <div>
            <el-image v-for="demo in item.Img"
                style="width: 80px; height: 80px; margin:10px"
                :src="demo" 
                :key="demo"
                :preview-src-list="item.Img">
              </el-image>
        </div>
        <div style="color:#999; font-size:14px;">{{item.CreatedStr}}</div>
    </el-dialog>
    <el-dialog title="人员分配" :visible.sync="dialogrenyuanVisible" :close-on-click-modal="false" width="1000px">
      <div class="filter-container">
        <el-input
          placeholder="请输入名字"
          v-model="renyuan.name"
          style="width: 150px;"
          class="filter-item"
          clearable
        />  
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handerrenyuan">搜索</el-button>   
      </div>
      <el-table v-loading="listLoading1" :data="listrenyuan" border fit highlight-current-row>
        <el-table-column label="名字" align="center" prop="Name"></el-table-column>  
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-popover
              trigger="click" :ref="`popover-${scope.$index}`" placement="top"
              >
              <p>确定要选择该人员吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelInput(`popover-${scope.$index}`)">取消</el-button>
                <el-button type="primary" size="mini" @click="choice(scope.row,`popover-${scope.$index}`)">确定</el-button>
              </div>
              <el-button size="mini" type="primary" slot="reference">选择</el-button>
            </el-popover>
            <!-- <el-button size="mini" type="primary">
              选择
            </el-button> -->
          </template>
        </el-table-column>
      </el-table> 

      <pagination
        small
        :total="total1"
        :page.sync="renyuan.pageIndex"
        :limit.sync="renyuan.pageSize"
        @pagination="getrenyuan"
      />
    </el-dialog>
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
        pageSize: 15,
        type:'',
        title:'',
        starttime:'',
        endtime:'',
        status:'',
         ocid :'',
         code:'',
          eid:''
      },
      times:'',
      isreplay:'',
      CategoryList:[],
      StatusList:[],
      imgs:[],
      CList:[],
      dialogFormVisible:false,
      dialogrenyuanVisible:false,
      item:{},
      renyuan:{          
        pageIndex: 1,
        pageSize: 15,
        ocid:'',
        name:''
      },
      listLoading1:false,
      total1:0,
      listrenyuan:[],
      choicetemp:{
        Id:'',
        eid:''
      }
    };
  },
  created() {        
    request({
      url: "CComplaint/GetDDL",
      method: "get",
      params: {}
    }).then(response => {
      if (response.Status == 1) {
        this.CategoryList=response.List;
        this.StatusList=response.StatusList;
        this.CList=response.CList;
      }
    });
    this.getList(); 
  },
  mounted () {
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
    cancelInput (id){
        this.$refs[id].doClose();
    },
    choice(row,id){
      this.choicetemp.eid=row.Id;
      var data = this.$qs.stringify(this.choicetemp);
        request({
            url: "CComplaint/UpdateEId",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {              
                this.$refs[id].doClose();
                this.$message({
                    message: response.Msg,
                    type: "success"
                });
                this.dialogrenyuanVisible=false;
                this.getList();
            }
          });
    },
    handerrenyuan(){
      this.renyuan.pageIndex = 1;
      this.getrenyuan();
    },
    fenpei(row){
      this.renyuan.ocid=row.OCId;
      this.choicetemp.Id=row.Id;
      this.getrenyuan();
      this.dialogrenyuanVisible=true;
    },
    getrenyuan(){      
      this.listLoading1 = true;
      request({
        url: "CComplaint/GetEmployeeList",
        method: "get",
        params: this.renyuan
      }).then(response => {
        if (response.Status == 1) {
          this.listrenyuan = response.List;
          this.total1 = response.PageCount;
          this.listLoading1 = false;
        }
      });
    },
    detail(row){
      this.dialogFormVisible=true;
      this.item=row;
      if(row.Img.length>6){
        this.item.Img=JSON.parse(row.Img);
      }
    },
    getList(){
      this.listLoading = true;
      request({
        url: "CComplaint/GetComplaintList",
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
    setstatus(code){
      for(let i in this.StatusList){
        if(this.StatusList[i].Value == code){
          return this.StatusList[i].Text;
        }
      }
    },
    searchrenyuan(row){
      this.listQuery.code='';
      this.listQuery.type='';
      this.listQuery.title='';
      this.listQuery.starttime='';
      this.listQuery.endtime='';
      this.listQuery.status='';
      this.listQuery.ocid='';
      this.listQuery.eid=row.EId;
      this.handleFilter();
    },
    searchwuye(row){
      this.listQuery.code=row.Code;
      this.listQuery.type='';
      this.listQuery.title='';
      this.listQuery.starttime='';
      this.listQuery.endtime='';
      this.listQuery.status='';
      this.listQuery.ocid='';
      this.listQuery.eid='';
      this.handleFilter();
    },
    handleFilter1(){
      this.listQuery.code='';
      this.listQuery.eid='';
      this.handleFilter()
    },
    handleFilter() {
      this.listQuery.pageIndex = 1;
      this.getList();
    },   
    handledel(row,type,title) {
      var data = this.$qs.stringify({ Id: row.Id,status:type});
      this.$confirm("确定要"+title+"该意见吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request({
            url: "CComplaint/Update",
            method: "post",
            data
          }).then(response => {
            if (response.Status==1) {
              if(type==5){
                const index = this.list.indexOf(row);
                this.list.splice(index, 1);
              }else{
                row.Status=type;
              }
                this.$message({
                    message: response.Msg,
                    type: "success"
                });
            }
          });
        })
        .catch(() => {});
    }, 
    huifu(row){
      this.$router.push({
        path: "/service/advise/huifu",
        query: { id:row.Id }
      });
    },
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
.advise{
  .status3{color:#F56C6C;}
  .status0{color:#67C23A;}
  .status1{color:#E6A23C;}
  .status2{color:#409EFF;}
  .status4{color:#909399;}
}
</style>
