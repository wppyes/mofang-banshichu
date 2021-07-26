<template>
  <div class="user spai boxright">
    <div class="filter-container">
      <div class="filter-item" style="margin-right: 20px">
        <el-button type="primary" @click="linktoadd(0)">
          <i class="el-icon-circle-plus"></i> 增加医院
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
        label="医院名称"
        prop="Name"
        align="center"
        width="200px"
      ></el-table-column>
      <el-table-column label="图片" prop="Img" align="center" width="100px">
        <template slot-scope="scope">
          <img :src="scope.row.Img" alt="" style="width: 50px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="linktoadd(scope.row.Id)"
          >
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button size="mini" type="primary" @click="set(scope.row.Id)">
            设置医生
          </el-button>
          <el-button size="mini" type="primary" @click="zhiding(scope.row.Id)">
            置顶
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
        pageSize: 8,
        name: ""
      },
      total: 0, //总数量
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$bus.$on("hospitalchange", () => {
      this.getList();
    });
  },
  methods: {
    set(row){      
      this.$router.push({
        path: "hospital-list/add-yisheng",
        query: { id: row },
      });
    },
    zhiding(row) {
      var data = this.$qs.stringify({ Id: row });
      this.$confirm("确定要置顶该医院吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          request({
            url: "Hospital/Update",
            method: "post",
            data,
          }).then((response) => {
            if (response.Status == 1) {
              this.getList();
              this.$message({
                message: response.Msg,
                type: "success",
              });
            }
          });
        })
        .catch(() => {});
    },
    getList() {
      this.listLoading = true;
      request({
        url: "Hospital/GetHospitalList",
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
    linktoadd(id) {
      this.$router.push({
        path: "hospital-list/add-renyuan",
        query: { id: id },
      });
    },
    handledel(row, value, str) {
      var data = this.$qs.stringify({ Id: row.Id });
      this.$confirm("确定要删除该医院吗？", "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          request({
            url: "Hospital/Del",
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

</style>
