const API_PATH = "leo";
const API_PRODUCT_URL = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${API_PATH}/products`;
const API_CART_URL = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${API_PATH}/carts`;
const API_CUSTOMER_URL = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${API_PATH}/orders`;

let products = [];
let cartDatas = [];

// 初始化
async function init() {
  await getProductData();
  await getCartData();
}
init();

// 取得產品資料
async function getProductData() {
  try {
    const response = await axios.get(`${API_PRODUCT_URL}`);
    products = response.data.products;
    renderProduct(products);
  } catch (error) {
    console.log(error);
  }
}

// 取得購物車資料
async function getCartData() {
  try {
    const response = await axios
      .get(`${API_CART_URL}`)
      .then(function (response) {
        cartDatas = response.data.carts;
        renderCartData(cartDatas);
      });
  } catch (error) {
    console.log(error);
  }
}

// 渲染產品
function renderProduct(products) {
  const productWrap = document.querySelector(".productWrap");
  let str = "";
  products.forEach((item) => {
    str += `
    <li class="productCard">
      <h4 class="productType">新品</h4>
      <img
        src="${item.images}"
        alt=""
      />
      <button id="${item.id}" class="addToCartBtn">加入購物車</button>
      <div class="productContent">
        <h3>${item.title}</h3>
        <div class="productPrice">
          <del class="originPrice">NT$${item.origin_price.toLocaleString()}</del>
          <p class="nowPrice">NT$${item.price.toLocaleString()}</p>
        </div>
      </div>
    </li>
    `;
  });
  productWrap.innerHTML = str;
  attachAddToCartEventListeners();
}

// 渲染購物車
function renderCartData(cartDatas) {
  let str = "";
  let totalPrice = 0;
  const shoppingCartTable = document.querySelector(".shoppingCart-table");

  if (cartDatas.length === 0) {
    str += `
    <tr>
      <td colspan='5'><span class="material-symbols-outlined">shopping_cart</span></td>
    </tr>
    <tr>
      <td colspan='5'>購物車是空的，去逛逛吧！</td>
    </tr>
    `;
    shoppingCartTable.innerHTML = str;
    return;
  }

  const tableHead = `
  <tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
  </tr>`;
  str += tableHead;

  cartDatas.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    str += `
    <tr>
      <td>
        <div class="cardItem-title">
          <img src="${item.product.images}" alt="" />
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT$${item.product.price.toLocaleString()}</td>
      <td>${item.quantity}</td>
      <td>NT$${item.product.price.toLocaleString()}</td>
      <td class="discardBtn">
        <a class="material-symbols-outlined" id="${item.id}"> clear </a>
      </td>
    </tr>
    `;
  });

  const tableFooter = `
  <tr>
    <td>
      <button class="discardAllBtn">刪除所有品項</button>
    </td>
    <td></td>
    <td></td>
    <td>
      <p>總金額</p>
    </td>
    <td>NT$${totalPrice.toLocaleString()}</td>
  </tr>
  `;
  str += tableFooter;
  shoppingCartTable.innerHTML = str;
  attachCartDiscardAllEventListener();
  attachCartDiscardEventListener();
}

// 產品篩選
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", function (e) {
  if (e.target.value === "全部") {
    renderProduct(products);
    return;
  }
  const filterDatas = products.filter(
    (item) => item.category === e.target.value
  );
  renderProduct(filterDatas);
});

// 新增至購物車
function attachAddToCartEventListeners() {
  const addToCartBtns = document.querySelectorAll(".addToCartBtn");
  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const productId = e.target.id;
      addCartData(productId);
    });
  });
}

// 新增購物車資料
function addCartData(productId) {
  let productQuantity = getCartProductQuantity(productId);
  productQuantity++;

  try {
    axios
      .post(`${API_CART_URL}`, {
        data: {
          productId: `${productId}`,
          quantity: productQuantity,
        },
      })
      .then((e) => {
        const messege = "已加入購物車";
        showMessege(messege);
        getCartData();
      });
  } catch (error) {
    console.log(error);
  }
}

// 取得購物車產品數量
function getCartProductQuantity(productId) {
  const cartProductQuantity = cartDatas.find(
    (item) => item.product.id === productId
  )?.quantity;
  return cartProductQuantity ? cartProductQuantity : 0;
}

// 清空購物車
function attachCartDiscardAllEventListener() {
  const discardAllBtn = document.querySelector(".discardAllBtn");
  discardAllBtn.addEventListener("click", function (e) {
    e.preventDefault();
    deleteAllCartData();
  });
}

// 刪除所有購物車資料
function deleteAllCartData() {
  try {
    axios.delete(`${API_CART_URL}`).then((e) => {
      const messege = "已清空所有品項";
      showMessege(messege);
      getCartData();
    });
  } catch (error) {
    console.log(error);
  }
}

// 刪除單筆購物車資料
function attachCartDiscardEventListener() {
  const discardBtns = document.querySelectorAll(".discardBtn");
  discardBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const cartId = e.target.id;
      deleteCartData(cartId);
    });
  });
}

function deleteCartData(cartId) {
  try {
    axios.delete(`${API_CART_URL}/${cartId}`).then((e) => {
      const messege = "已刪除一個商品";
      showMessege(messege);
      getCartData();
    });
  } catch (error) {
    console.log(error);
  }
}

// 驗證訂單資料
const orderForm = document.querySelector(".orderInfo-form");
orderForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (cartDatas.length === 0) {
    alert("購物車是空的，請先加入商品");
    return;
  }

  const inputName = document.querySelector("#customerName");
  const inputPhone = document.querySelector("#customerPhone");
  const inputEmail = document.querySelector("#customerEmail");
  const inputAddress = document.querySelector("#customerAddress");
  const paymentMethod = document.querySelector("#tradeWay");

  if (
    inputName.value.trim() === "" ||
    inputPhone.value.trim() === "" ||
    inputEmail.value.trim() === "" ||
    inputAddress.value.trim() === "" ||
    paymentMethod.value.trim() === ""
  ) {
    alert("請填寫完整資料");
    return;
  }

  const userData = {
    data: {
      user: {
        name: inputName.value,
        tel: inputPhone.value,
        email: inputEmail.value,
        address: inputAddress.value,
        payment: paymentMethod.value,
      },
    },
  };

  orderForm.reset();
  createOrderData(userData);
});

// 送出訂單資料
function createOrderData(userData) {
  try {
    axios
      .post(
        `https://livejs-api.hexschool.io/api/livejs/v1/customer/${API_PATH}/orders`,
        userData
      )
      .then((e) => {
        const messege = "訂單已送出！";
        showMessege(messege);
        getCartData();
      });
  } catch (error) {
    console.log(error);
  }
}

function showMessege(messege) {
  var messegeModal = document.querySelector(".messegeModal");
  var messegeModalContent = document.querySelector(".messegeModal-content");
  let str = `
  <p>${messege}</p> 
  `;
  messegeModalContent.innerHTML = str;
  messegeModal.style.display = "block";

  setTimeout(() => {
    messegeModal.style.display = "none";
  }, 2000);
}
