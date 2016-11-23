var origin = window.location.origin;
var root = '';
if (origin.indexOf('github') > -1) {
  var paths = window.location.pathname.split('/');
  root = '/'+ paths[1];
}
var DOCUMENT_PATH = origin + root;
console.log(DOCUMENT_PATH);

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAu4DZFHelytM2mtLw1NX7apWahQfpWhAY",
  authDomain: "for-sale-calendar.firebaseapp.com",
  databaseURL: "https://for-sale-calendar.firebaseio.com",
  storageBucket: "for-sale-calendar.appspot.com",
  messagingSenderId: "503482988891"
};
firebase.initializeApp(config);

function initApp() {
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    // [END_EXCLUDE]
    if (user) {
      // goResult();
      // window.user = user;
    } else {
      goIndex();
    }
  });
}

function goIndex() {
  if (window.location.href.indexOf('result') > -1) {
    window.location.href = DOCUMENT_PATH;
  }
}

function goResult() {
  if (window.location.href.indexOf('result') === -1) {
    window.location.href = DOCUMENT_PATH +'/result';
  }
}

window.onload = function() {
  initApp();
};

function numberFormatter(number) {
  var returnNumber = number;
  if (typeof returnNumber === 'string') {
    returnNumber = parseFloat(returnNumber);
  }
  if (returnNumber === 0 || isNaN(returnNumber)) {
    return 0;
  }
  var reg = /(^[+-]?\d+)(\d{3})/;
  var n = returnNumber +'';
  while (reg.test(n)) {
    n = n.replace(reg, '$1' + ',' + '$2');
  }
  return n;
};

// Initialize form config
var RECEIVE_FIELD = {
  BY_SELF: '직접수령',
  BY_POST: '택배수령'
};

var PRODUCT_CONFIG = {
  desk: {
    label: '탁상용',
    cost: 12000,
  },
  wall: {
    label: '벽걸이',
    cost: 15000,
  },
};

var DELIVERY_FEE = 3000;
var DO_NOT_NEED_DELIVERY_FEE = 50000;
