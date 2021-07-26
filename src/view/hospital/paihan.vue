<template>
  <div class="zhiban boxright"> 
    <div class="filter-container">   
      <div  class="filter-item">
        请选择门诊：
      </div>
      <el-select v-model="listQuery.id" style="width: 200px" 
          @change="changeyiyuan">
        <el-option
          v-for="item in yiyuanlist"
          :label="item.Name"
          :value="item.Id"
          :key="item.Id"
        ></el-option>
      </el-select>
    </div>
      <el-tabs v-model="listQuery.type" type="card" @tab-click="handleFilter">
        <el-tab-pane label="本周" name="1"></el-tab-pane>
        <el-tab-pane label="下周" name="2"></el-tab-pane>
      </el-tabs>
      <div style="margin-bottom:10px" v-if="listQuery.id">
        <el-button @click="iseditor=!iseditor" v-if="!iseditor" type="primary">编辑</el-button>
        <el-button  @click="iseditor=!iseditor" v-else type="primary">查看</el-button>
      </div>
      <table class="tables" border="0">
        <thead>
          <tr>
            <th>姓名</th>
            <th>周一
              <span>{{times[0]}}</span>
            </th>
            <th>周二         
              <span>{{times[1]}}</span>
            </th>
            <th>周三         
              <span>{{times[2]}}</span>
            </th>
            <th>周四
              <span>{{times[3]}}</span></th>
            <th>周五
              <span>{{times[4]}}</span></th>
            <th>周六
              <span>{{times[5]}}</span></th>
            <th>周日
              <span>{{times[6]}}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.Id">
            <td>
              {{item.Name}}
            </td>
            <td v-for="(item1,index) in item.endlist" :key="item1.Week">
              <el-select v-model="item1.HSTId" style="width:120px" :disabled="!iseditor" @change="changezb(item,times[index],item1)" clearable >
                <el-option
                  v-for="item in zhibanlist"
                  :label="item.Name"
                  :value="item.Id"
                  :key="item.Id"
                ></el-option>
              </el-select>
            </td>
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
      yiyuanlist:[],
      yishenglist:[],
      zhibanlist:[],
      listQuery:{
        type:'1',
        id:''
      },
      times:[],
      iseditor:false,
      temp:{
        Id:'',
        Title:'',//日期
        Type:'1',//本周下周
        Week:'',//周
        HId:'',//医院id
        HDId:'',//医生id
        HSTId:''//排班
      }
    };
  },
  created() {
    this.getData();
  },
  methods: {
    changezb(item,time,item1){
      if(item1.HSTId){
        this.temp.Title=time;
        this.temp.Id=item1.Id;
        this.temp.Week=item1.Week;
        this.temp.HDId=item.Id;
        this.temp.HSTId=item1.HSTId;
        this.add(item,item1);
        return;
      }
      this.del(item,item1);
    },
    add(item,item1){
        var data=this.$qs.stringify(this.temp);
       request({
          url: "HospitalScheduling/SetHospitalScheduling",
          method: "post",
          data
        }).then(response => {
          if(response.Status==1){
            this.$message({
              message: response.Msg,
              type: 'success'
            })
            item1.Id=response.Id;
            
          }
        });
    },
    del(item,item1){
      var data=this.$qs.stringify({Id:item1.Id,HId:this.temp.HId});
       request({
          url: "HospitalScheduling/Del",
          method: "post",
          data
        }).then(response => {
          if(response.Status==1){
              this.$message({
              message: response.Msg,
              type: 'success'
            })
          }
        });
    },
    changeyiyuan(){
      this.getyisheng();
      this.temp.HId=this.listQuery.id;
    },
    handleFilter(){
      this.getyisheng();
      this.temp.Type=this.listQuery.type;
    },
    getyisheng(){
      request({
        url: "HospitalScheduling/GetHospitalDoctorlList",
        method: "get",
        params: this.listQuery,
      }).then((response) => {
        if (response.Status == 1) {
          this.yishenglist=response.List;
          this.zhibanlist=response.HSTList;
          this.times=response.Date.split(',');
          this.list=response.List;
          for(var i in this.yishenglist){
            var arr=[{Id:'',HSTId:'',Week:1},
              {Id:'',HSTId:'',Week:2},
              {Id:'',HSTId:'',Week:3},
              {Id:'',HSTId:'',Week:4},
              {Id:'',HSTId:'',Week:5},
              {Id:'',HSTId:'',Week:6},
              {Id:'',HSTId:'',Week:7}]
            for(var j in this.yishenglist[i].HList){
              for(var k in arr){
                if(arr[k].Week==this.yishenglist[i].HList[j].Week){
                  arr[k].Id=this.yishenglist[i].HList[j].Id;
                  arr[k].HSTId=this.yishenglist[i].HList[j].HSTId;    
                  break
                }
              }
            }
            this.$set(this.list[i],'endlist',arr);
          }
        }
          
      });
    },
    getData(){
      request({
        url: "HospitalScheduling/GetHospital",
        method: "get",
        params: {},
      }).then((response) => {
        if (response.Status == 1) {
          this.yiyuanlist=response.List;
          if(this.yiyuanlist.length==1){
            this.listQuery.id=this.yiyuanlist[0].Id;
            this.temp.HId=this.yiyuanlist[0].Id;
            this.getyisheng();
          }
        }
      });
    }, 
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
  .zhiban {
    .disabled{color: #C0C4CC;}
    span{cursor: pointer;}
    .tables{width: 100%; border: 1px solid #f5f5f5; border-right: none; border-top: none;}
    .tables thead th{padding: 8px 0;}
    .tables thead th span{display: block; font-weight: normal; font-size: 14px; color: #666; margin-top: 5px;}
    .tables th,.tables td{border-right: 1px solid #f5f5f5; border-top: 1px solid #f5f5f5; text-align: center;}
    .tables td{line-height: 50px; color: #333;}
    .tables tr:hover{background: #f2f2f2;}
  }
</style>
