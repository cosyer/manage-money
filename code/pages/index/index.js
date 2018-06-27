//查询详情
var searchBalance = function(that) {
  var userId = that.data.userInfo.nickName;
  wx.request({
    url: "http://127.0.0.1:3000/balance",
    method: "POST",
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: {
      wechatname: userId
    },

    success: function(res) {
      console.log(res.data);
      if (res.statusCode == "200") {
        that.setData({
          balance: res.data.balance
        });
      } else {
        wx.showToast({
          title: "查询失败",
          image: "../../images/icon-no.png",
          mask: true,
          duration: 1000
        });
      }
    }
  });
};

Page({
  data: {
    userInfo: [],
    balance: 0,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    showShouquan: true
  },

  //添加一笔新账单
  bindNewTap: function() {
    wx.navigateTo({
      url: "../new/new"
    });
  },

  //理财产品推荐
  bindNewTapTwo: function() {
    wx.navigateTo({
      url: "../finance/finance"
    });
  },

  onLoad: function() {
    // 查看是否授权
    var that = this;
    wx.getSetting({
      success: function(res) {
        console.log(res.authSetting["scope.userInfo"]);
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          searchBalance(that);
          wx.getUserInfo({
            success: function(res) {
              console.log(res);
              that.setData({
                userInfo: res.userInfo
              });
              // getApp().globalData.userInfo = res.userInfo; //将授权信息传递给全局变量
            }
          });
        }
      }
    });

    //调用应用实例的方法获取全局数据
    // var app = getApp()
    // app.getUserInfo(function (userInfo) {
    //   //更新数据
    //   that.setData({
    //     userInfo: userInfo
    //   })
    // })
  },
  bindGetUserInfo: function(e) {
    this.data.userInfo = e.detail.userInfo; //将授权信息传递给全局变量
  },

  onHide: function() {
    var that = this;
    searchBalance(that);
  }
});
