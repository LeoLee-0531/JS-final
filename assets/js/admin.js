import { showNotification } from "./notification.js";
import { initLoading, toggleLoading } from "./loader.js";

const API_PATH = "leo";
const TOKEN = "RY26ME8AShNqoCbbbZSvYuapzxJ3";
const API_BASE_URL = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${API_PATH}`;
const API_ORDER_URL = `${API_BASE_URL}/orders`;

const chartColors = {
  "Jordan 雙人床架／雙人加大": "#DDC4FF",
  "Antony 雙人床架／雙人加大": "#9D7FEA",
  "Antony 床邊桌": "#ECC4FF",
  "Antony 遮光窗簾": "#7A5EC3",
  "Louvre 雙人床架／雙人加大": "#A34DBB",
  "Louvre 單人床架": "#874DBB",
  "Charles 系列儲物組合": "#5434A7",
  "Charles 雙人床架": "#6C4DBB",
};

let chartData = {
  bindto: "#chart", // HTML 元素綁定
  data: {
    type: "pie",
    columns: [],
    colors: chartColors,
  },
};

const messages = {
  loginSuccess: "登入成功！",
  loginFail: "登入失敗！",
  logoutSuccess: "登出成功！",
  orderCleared: "已清空所有訂單",
  orderRemoved: "已刪除一筆訂單",
};

let orderData = [];

window.addEventListener("load", function () {
  // 初始化
  async function init() {
    initLoading();
    await getOrderData();
  }
  init();

  // 取得訂單資料
  async function getOrderData() {
    try {
      const response = await axios.get(`${API_ORDER_URL}`, {
        headers: {
          Authorization: TOKEN,
        },
      });
      orderData = response.data.orders;
      renderOrderData(orderData);
    } catch (error) {
      handleError(error);
    }
  }

  // 圖表顯示
  function chartDisplay() {
    if (orderData.length === 0) {
      return;
    }

    let orderProduct = [];
    let orderProductQuantity = [];

    orderData.forEach((item) => {
      item.products.forEach((productItem) => {
        let index = orderProduct.indexOf(productItem.title);
        if (index === -1) {
          orderProduct.push(productItem.title);
          orderProductQuantity.push(productItem.quantity);
        } else {
          orderProductQuantity[index] += productItem.quantity;
        }
      });
    });

    chartData.data.columns = [];
    orderProduct.forEach((item, index) => {
      chartData.data.columns.push([item, orderProductQuantity[index]]);
    });

    c3.generate(chartData);
  }

  // 渲染訂單資料
  function renderOrderData(orderData) {
    const orderPageTable = document.querySelector(".orderPage-table");
    let str = `
    <thead>
      <tr>
        <th>訂單編號</th>
        <th>聯絡人</th>
        <th>聯絡地址</th>
        <th>電子郵件</th>
        <th>訂單品項</th>
        <th>訂單日期</th>
        <th>訂單狀態</th>
        <th>操作</th>
      </tr>
    </thead>
    `;

    if (orderData.length === 0) {
      str += `
    <tr>
      <td colspan='8'><p class="none-order">目前尚未有任何訂單！</p></td>
    </tr>
    `;
    }

    orderData.forEach((item) => {
      // 取得訂單日期
      let timeStamp = new Date(item.createdAt * 1000);
      let orderTime = `${timeStamp.getFullYear()}/${
        timeStamp.getMonth() + 1
      }/${timeStamp.getDate()}`;

      // 取得訂單品項
      let orderProduct = "";
      item.products.forEach((productItem) => {
        orderProduct += `<p>${productItem.title} x ${productItem.quantity}</p>`;
      });

      // 取得訂單狀態
      let orderStatus = "";
      if (item.paid) {
        orderStatus = "已處理";
      } else {
        orderStatus = "未處理";
      }

      str += `
    <tr>
      <td>${item.createdAt}</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        ${orderProduct}
      </td>
      <td>${orderTime}</td>
      <td class="orderStatus">
        <a href="#">${orderStatus}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" id="${item.id}" value="刪除" />
      </td>
    </tr>
    `;
    });
    orderPageTable.innerHTML = str;
    chartDisplay();
    attachDelSingleOrderBtnEventListener();
    toggleLoading(false);
  }

  // 登入資訊
  let isLogin = false;
  const admin = {
    userName: "admin",
    password: "admin",
  };

  // 登入驗證
  const loginForm = document.querySelector(".login-form");
  loginForm.addEventListener("submit", loginCheck);

  function loginCheck(e) {
    e.preventDefault();
    const userName = document.querySelector("#userName").value;
    const password = document.querySelector("#password").value;

    if (userName === admin.userName && password === admin.password) {
      isLogin = true;
      showNotification(messages.loginSuccess);
      loginSuccess();
    } else {
      showNotification(messages.loginFail);
    }
  }

  // 登入成功
  const loginBtn = document.querySelector(".login-btn");
  function loginSuccess() {
    let str = `
    <a><span class="user-avator material-symbols-outlined">account_circle</span></a>
    <div class="logoutModal">
      <div class="logoutModal-content">
        <a class="logout-btn">登出</a>
      </div>
    </div>
    `;
    loginBtn.innerHTML = str;

    closeLoginModal();
    attathUserAvatorEventListener();
  }

  // 顯示登出 Modal
  function attathUserAvatorEventListener() {
    const userAvator = document.querySelector(".user-avator");
    userAvator.addEventListener("click", showLogoutModal);

    // 登出
    const logoutBtn = document.querySelector(".logout-btn");
    logoutBtn.addEventListener("click", logout);
  }

  function showLogoutModal() {
    const logoutModal = document.querySelector(".logoutModal");

    if (isLogin) {
      logoutModal.style.display =
        logoutModal.style.display === "block" ? "none" : "block";
    }
  }

  function logout() {
    isLogin = false;

    let str = `
    <a onclick="openLoginModal()">管理員登入</a>
    `;
    loginBtn.innerHTML = str;

    showNotification(messages.logoutSuccess);
  }

  const discardAllBtn = document.querySelector(".discardAllBtn");
  discardAllBtn.addEventListener("click", discardAll);

  async function discardAll() {
    if (!isLogin) {
      alert("請先登入！");
      return;
    }

    if (orderData.length === 0) {
      alert("目前尚未有訂單！");
      return;
    }

    toggleLoading(true);
    try {
      await axios.delete(`${API_ORDER_URL}`, {
        headers: {
          Authorization: TOKEN,
        },
      });
      getOrderData();
      showNotification(messages.orderCleared);
    } catch (error) {
      handleError(error);
    }
  }

  function attachDelSingleOrderBtnEventListener() {
    const delSingleOrderBtn = document.querySelectorAll(".delSingleOrder-Btn");
    delSingleOrderBtn.forEach((btn) => {
      btn.addEventListener("click", delSingleOrder);
    });
  }

  async function delSingleOrder(e) {
    if (!isLogin) {
      alert("請先登入！");
      return;
    }

    toggleLoading(true);
    const orderId = e.target.id;
    try {
      await axios.delete(`${API_ORDER_URL}/${orderId}`, {
        headers: {
          Authorization: TOKEN,
        },
      });
      getOrderData();
      showNotification(messages.orderRemoved);
    } catch (error) {
      handleError(error);
    }
  }

  // 錯誤處理
  function handleError(error) {
    console.log("發生錯誤：", error);
  }
});
