<template>
  <div class="addproduct boxright">
    <div class="back">
      <span @click="backto">
        <i class="el-icon-arrow-left"></i>返回
      </span>
    </div>
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="temp"
      label-position="left"
      label-width="150px"
      style="width: 1100px; margin-left:20px;"
    >
 
      <el-form-item label="名称：" prop="Name" style="width:500px">
        <el-input v-model="temp.Name" placeholder="请填写名称" />
      </el-form-item>     
      <el-form-item label="图片：" prop="Img">   
        <Uploadimgs v-model="temp.Img" ref="upLoadimg"></Uploadimgs>
        <div class="chicun">尺寸：200*200</div>
      </el-form-item>   
    </el-form>
    <el-button type="primary" style="margin-left:170px"@click="createData">确定</el-button>
  </div>
</template>
<script>
import request from "@/utils/request";
import Tinymce from '@/components/Tinymce';
import Uploadimgs from '@/components/Uploadqiniu/single';
export default {
  name: "addproduct",
  components: {Tinymce,Uploadimgs },
  data() {
    return {
      temp: {
        Id: 0,
        Name:'',
        Img:''
      },
      tinymceFlag:1,
      rules: {
        Name: [
          { required: true, message: "名称必须填写！", trigger: "blur" }
        ],
        Img: [
          { required: true, message: "图片必须上传！", trigger: "blur" }
        ],
      },  
    };
  },
  created() {
    this.temp.Id = this.$route.query.id; 
    if(this.temp.Id==0){
      this.temp.Name = '';
      this.temp.Img = '';
    }else{ 
      this.getdetail()
    }
  },
  methods: {
    getdetail() {
      request({
        url: "Hospital/GetHospital",
        method: "get",
        params: { id: this.temp.Id }
      }).then(response => {
        if (response.Status == 1) {
          this.temp.Name=response.Model.Name;  
          this.temp.Img = response.Model.Img;
          this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate()
          })
        }
      });
    },   
    backto() {   
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.$router.go(-1);
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          var data = this.$qs.stringify(this.temp);
          request({
            url: "Hospital/SetHospital",
            method: "post",
            data
          }).then(response => {
            if (response.Status == 1) {  
              this.$bus.$emit("hospitalchange");
              this.$message({
                message: response.Msg,
                type: "success"
              });                 
              if(this.temp.Id==0){
                this.temp.Name = '';
                this.temp.Img = '';
              }   
              this.backto();
            }
          });
        }
      });
    },
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
.addproduct {
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
  
  .chicun {
    color: #f00;
  }
}
</style>
