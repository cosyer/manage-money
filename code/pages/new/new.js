// pages/new/new.js
const requestUrl = require('../../config').requestUrl
var abID = 0
var userInputContent = ''
var util = require('../../utils/util.js')

function CalcMoney(content) {
  var r, re
  re = /[0-9.]+/ig
  r = content.match(re)
  return r
}

var app = getApp()
Page({
  
  data: {
    loadingStatus: false,
    date: '',
    title: '',
    money: '',
    remark: '',
    categoryArray: [
      { "ID": 1, "Name": "餐饮" },
      { "ID": 2, "Name": "交通" },
      { "ID": 3, "Name": "健康" },
      { "ID": 4, "Name": "购物" },
      { "ID": 5, "Name": "娱乐" },
      { "ID": 6, "Name": "其他" },
      ],
    categoryIndex: 0,
    TypeArray: [
      { "ID": 1, "Name": "支出" },
      { "ID": 2, "Name": "收入" }
    ],
    TypeIndex: 0,
    m_cid: 0,
    userInfo:[]
  },

  //日期选择
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  //分类选择
  bindCategoryChange: function (e) {
    this.setData({
      categoryIndex: e.detail.value
    })
  },

  //类型选择
  bindTypeChange: function (e) {
    this.setData({
      TypeIndex: e.detail.value
    })
  },

  //检测描述
  bindRemarkInput: function (e) {
    userInputContent = e.detail.value
    var lastChar = e.detail.value.charAt(e.detail.value.length - 1)
    var tagCount = e.detail.value.split('#').length - 1

    if (tagCount % 2 > 0 && lastChar == '#') {
      wx.navigateTo({
        url: '../tag/tag'
      })
    }
  },

  bindMoneyInput: function (e) {
    this.setData({
      money: e.detail.value
    })
  },

  bindRemarkBlur: function (e) {
    if (this.data.money == '') {
      var allMoney = CalcMoney(e.detail.value);

      if (allMoney != null) {
        var sum = 0;

        for (var i = 0; i < allMoney.length; i++) {
          if (parseFloat(allMoney[i]) != 711) {
            sum += parseFloat(allMoney[i])
          }
        }

        this.setData({
          money: sum.toFixed(2)
        })
      }
    }
  },

  //取消动作
  bindCancelTap: function (e) {
    wx.showModal({
      title: '提示',
      content: '账单还未保存，确认取消？',
      success: function (res) {
        if (res.confirm) {
          wx.switchTab({
            url: '../index/index'
          })
        }
      }
    })
  },

  //保存
  formSave: function (e) {
    var billDate = e.detail.value.pickerDate
    var categoryID = e.detail.value.pickerCategory
    var typeName = e.detail.value.pickerType
    var title = e.detail.value.inputTitle
    var money = e.detail.value.inputMoney
    var remark = e.detail.value.inputRemark
    var userId=this.data.userInfo.nickName;
    var checkResult = true
    console.log(categoryID)
    if (title == '') {
      checkResult = false
      wx.showToast({
        title: '写个标题',
        image: "../../images/icon-no.png",
        mask: true,
        duration: 1000
      })
    }
    else {
      if (money == '') {
        checkResult = false
        wx.showToast({
          title: '输入金额',
          image: "../../images/icon-no.png",
          mask: true,
          duration: 1000
        })
      }
      else {
        if (remark == '') {
          checkResult = false
          wx.showToast({
            title: '描述一下',
            image: "../../images/icon-no.png",
            mask: true,
            duration: 1000
          })
        }
      }
    }

    if (checkResult) {
      this.setData({
        loadingStatus: true
      })
      var that=this;
      
      wx.request({
        url: "http://127.0.0.1:3000/new",
        method: "POST",  
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
          // "Content-Type": "application/json"
        },
        data:{
          "wechatname": userId,
          "date": billDate,
          "style": categoryID,
          "type":typeName,
          "title": title,
          "changed": money,
          "detail": remark
        },

        success: function (res) {
          // if (res.data.ChinaValue[0].Result == 'True') {

          //   wx.setStorage({
          //     key: "IsUpdate",
          //     data: true
          //   })

          //   if (abID > 0) {
          //     wx.redirectTo({
          //       url: '../result/result?ID=' + abID
          //     })
          //   }
          //   else {
          //     wx.switchTab({
          //       url: '../index/index'
          //     })
          //   }
          // }
          console.log(res);
          if (res.statusCode=='200'){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              mask: true,
              duration: 1000
            })
            that.setData({
              loadingStatus: false
            })
            // wx.redirectTo({
            //   url: '../index/index'
            // })
          }
          else {
            wx.showToast({
              title: '保存失败',
              image: "../../images/icon-no.png",
              mask: true,
              duration: 1000
            })
          }
        }
      })
    }
  },


  onLoad: function (options) {
    var that = this,
    abID = typeof (options.ID) == 'undefined' ? '' : options.ID
    console.log(abID);
    //初始化日期
    var newDate = new Date()
    that.setData({
      date: newDate.getFullYear() + '-' + (("0" + (newDate.getMonth() + 1)).slice(-2)) + '-' + (("0" + (newDate.getDate())).slice(-2))
    })

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    // console.log(that.data.userInfo);
    wx.getStorage({
      key: 'billCategory',
      success: function (res) {
        that.setData({
          categoryArray: res.data
        });
      },
      fail: function (res) {
        wx.request({
          url: requestUrl + 'wxCategoryGet.ashx',
          success: function (res) {
            that.setData({
              categoryArray: res.data.ChinaValue
            })
            wx.setStorage({
              key: 'billCategory',
              data: that.data.categoryArray
            })
          }
        })
      }
    })

    //初始化分类
    // if (abID > 0) {
    //   //修改时回绑数据
    //   wx.request({
    //     url: requestUrl + 'wxNewGet.ashx?ID=' + abID,

    //     success: function (res) {
    //       that.setData({
    //         date: res.data.ChinaValue[0].BillDate,
    //         title: res.data.ChinaValue[0].Title,
    //         money: res.data.ChinaValue[0].Money,
    //         remark: res.data.ChinaValue[0].Remark,
    //         m_cid: res.data.ChinaValue[0].C_Id
    //       })

    //       for (var i = 0; i < that.data.categoryArray.length; i++) {
    //         if (that.data.categoryArray[i].ID == that.data.m_cid) {
    //           that.setData({
    //             categoryIndex: i
    //           })
    //           break;
    //         }
    //       }

    //     }
    //   })
    // }

  },

  onShow: function () {
    var that = this

    wx.getStorage({
      key: "selectedTag",
      success: function (res) {
        that.setData({
          remark: userInputContent.substring(0, userInputContent.length - 1) + res.data
        })

        wx.removeStorage({
          key: 'selectedTag'
        })
      }
    })
  }
})