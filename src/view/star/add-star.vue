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
      <el-form-item label="姓名" prop="Name" style="width:500px">
        <el-input v-model="temp.Name" placeholder="请填写姓名" />
      </el-form-item>     
      <el-form-item label="图片：" prop="Img">   
        <Uploadimgs v-model="temp.Img" ref="upLoadimg"></Uploadimgs>
        <div class="chicun">尺寸：200*200</div>
      </el-form-item>  
      <el-form-item label="职务：" prop="Function" style="width:500px">
        <el-input v-model="temp.Function" placeholder="请填写职务" />
      </el-form-item> 
      <el-form-item label="职称：" prop="Title" style="width:500px">
        <el-input v-model="temp.Title" placeholder="请填写职称"/>
      </el-form-item>  
      <!-- <el-form-item label="简介：" prop="Details">
        <el-input v-model="temp.Details" type="textarea" placeholder="请填写简介"/>
      </el-form-item>  
      <el-form-item label="光荣事迹：" prop="Content" style="width:1100px">
        <Tinymce ref="editor" v-model="temp.Content" :key="tinymceFlag" :height="500" />
      </el-form-item> -->
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
        Img:'',
        Function:'',
        Title:'',
        Details:'',
        Content: '', 
      },
      tinymceFlag:1,
      rules: {
        Name: [
          { required: true, message: "名字必须填写！", trigger: "blur" }
        ],
        Img: [
          { required: true, message: "图片必须上传！", trigger: "blur" }
        ],
        Function: [
          { required: true, message: "职务必须填写！", trigger: "blur" }
        ],
        Title: [
          { required: true, message: "职称必须填写！", trigger: "blur" }
        ],
        // Details: [
        //   { required: true, message: "简介必须填写！", trigger: "blur" }
        // ],
        // Content: [
        //   { required: true, message: "光荣事迹必须填写！", trigger: "blur" }
        // ],
      },  
    };
  },
  created() {
    this.temp.Id = this.$route.query.id; 
    if(this.temp.Id==0){
      this.temp.Name = '';
      this.temp.Img = '';
      this.temp.Function = '';
      this.temp.Title = '';
      this.temp.Details = '';
      this.temp.Content = '';
    }else{ 
      this.getdetail()
    }
  },
  methods: {
    getdetail() {
      request({
        url: "HonourRollStaff/GetHonourRollStaff",
        method: "get",
        params: { id: this.temp.Id }
      }).then(response => {
        if (response.Status == 1) {
          this.temp.Name=response.Model.Name;  
          this.temp.Img = response.Model.Img;
          this.temp.Function = response.Model.Function;
          this.temp.Title = response.Model.Title;
          this.temp.Details = response.Model.Details;
          this.temp.Content = response.Model.Content;
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
            url: "HonourRollStaff/SetHonourRollStaff",
            method: "post",
            data
          }).then(response => {
            if (response.Status == 1) {  
              this.$bus.$emit("starchange");
              this.$message({
                message: response.Msg,
                type: "success"
              });                 
              if(this.temp.Id==0){
                this.temp.Name = '';
                this.temp.Img = '';
                this.temp.Function = '';
                this.temp.Title = '';
                this.temp.Details = '';
                this.temp.Content = '';
                this.$refs.editor.setContent('');
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
