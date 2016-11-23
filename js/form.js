function signIn() {
  var phone = document.form_signin.phone.value.trim();
  var email = 'user'+ phone +'@redfactory.net';
  var password = document.form_signin.password.value;

  firebase.auth()
  .signInWithEmailAndPassword(email, password)
  .then(goResult)
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode === 'auth/wrong-password') {
      alert('잘못된 비밀번호 입니다.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
}

function signOut() {
  firebase.auth().signOut();
  goIndex();
}

function getTotalCost() {
  var receive = document.form_info.receive.value || document.querySelector('input[name="receive"]:checked').value;
  var total = 0;
  var str = '';
  for (var type in PRODUCT_CONFIG) {
    var item = PRODUCT_CONFIG[type];
    var name = 'count_'+ type;
    var count = document.form_info[name].value;
    var cost = item.cost;
    total += cost * count;
  }
  str = '총합: '+ numberFormatter(total) +'원';
  if (total < DO_NOT_NEED_DELIVERY_FEE && receive !== 'BY_SELF') {
    str += ' + 배송비('+ numberFormatter(DELIVERY_FEE) +'원)';
    str += ' = '+ numberFormatter(total + DELIVERY_FEE) +'원';
  }
  document.form_info.total.value = total;
  document.getElementById('TotalCost').innerHTML = str;
}

function addCount(name) {
  var count = document.form_info[name].value;
  count++;
  document.form_info[name].value = count;
  getTotalCost();
}

function subtractCount(name) {
  var count = document.form_info[name].value;
  count--;
  if (count < 0) {
    count = 0;
  }
  document.form_info[name].value = count;
  getTotalCost();
}

function formValidate() {
  var phone = document.form_info.phone.value.trim();
  if (phone.length === 0) {
    document.form_info.phone.focus();
    alert('핸드폰번호를 입력해주세요.');
    return false;
  } else if (phone.length < 10 || phone.length > 12) {
    document.form_info.phone.focus();
    alert('유효한 핸드폰번호를 입력해주세요.');
    return false;
  }
  var password = document.form_info.password.value.trim();
  if (password.length === 0) {
    document.form_info.password.focus();
    alert('비밀번호를 입력해주세요.');
    return false;
  } else if (password.length < 6) {
    document.form_info.password.focus();
    alert('비밀번호는 최소 6자이상 입력해주세요.');
    return false;
  }
  var passwordConfirm = document.form_info.password_confirm.value.trim();
  if (password.length === 0) {
    document.form_info.password_confirm.focus();
    alert('비밀번호 확인을 입력해주세요.');
    return false;
  } else if (password !== passwordConfirm) {
    document.form_info.password_confirm.focus();
    alert('비밀번호와 비밀번호 확인이 맞지 않습니다.');
    return false;
  }
  var name = document.form_info.name.value.trim();
  if (name.length === 0) {
    document.form_info.name.focus();
    alert('이름(입금자명)을 입력해주세요.');
    return false;
  }
  var receive = document.form_info.receive.value || document.querySelector('input[name="receive"]:checked').value;
  if (receive !== 'BY_SELF') {
    // need zipcode
    var zipcode = document.form_info.zipcode.value.trim();
    if (zipcode.length === 0) {
      alert('주소를 입력해주세요.');
      return false;
    }
  }

  var totalProductCount = 0;
  for (var type in PRODUCT_CONFIG) {
    var item = PRODUCT_CONFIG[type];
    var name = 'count_'+ type;
    var count = document.form_info[name].value;
    totalProductCount += count;
  }
  if (totalProductCount == 0) {
    alert('주문 내역을 입력해주세요.');
    return false;
  }
  return true;
}

function formSubmit(self) {
  $(self).button('loading');
  var isValid = formValidate();
  if (isValid) {
    var email = getEmail();
    var password = document.form_info.password.value;

    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then(formPostData)
      .then(function() {
        alert('주문이 완료되었습니다.');
        goResult();
      })
      .catch(errorHandler);
    // [END createwithemail]
  } else {
    $(self).button('reset');
  }
}

function formPostData() {
  var uid = firebase.auth().currentUser.uid.trim();
  var phone = document.form_info.phone.value.trim();
  var name = document.form_info.name.value.trim();
  var receive = document.form_info.receive.value || document.querySelector('input[name="receive"]:checked').value;
  var address1 = document.form_info.address1.value.trim();
  var address2 = document.form_info.address2.value.trim();
  var zipcode = document.form_info.zipcode.value.trim();
  var note = document.form_info.note.value.trim();
  var total = document.form_info.total.value.trim();
  var createdAt = new Date();

  var postData = {
    uid: uid,
    phone: phone,
    name: name,
    receive: RECEIVE_FIELD[receive],
    address1: address1,
    address2: address2,
    zipcode: zipcode, 
    note: note,
    total: total,
    create_at: createdAt,
    status: 'SUBMITTED'
  };

  for (var type in PRODUCT_CONFIG) {
    var item = PRODUCT_CONFIG[type];
    var name = 'count_'+ type;
    var count = document.form_info[name].value;
    postData[name] = count;
  }

  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('orders').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/orders/' + newPostKey] = postData;
  updates['/user-orders/' + uid + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}

function showAddress() {
  new daum.Postcode({
    oncomplete: function(data) {
      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분입니다.
      // 예제를 참고하여 다양한 활용법을 확인해 보세요.
      // 우편번호와 주소 정보를 해당 필드에 넣는다.
      var address = data.address || data.roadAddress || data.jibunAddress;
      if (data.buildingName) {
        address += ' ('+ data.buildingName +')';
      }
      var form = document.form_info;
      form.zipcode.value = data.zonecode;
      form.address1.value = address;
    }
  }).open();
}

function onChangeRadio(self) {
  var checked = self.checked;
  var value = self.value;
  var disabled = checked && value === 'BY_SELF';
  document.form_info.zipcode.disabled = disabled;
  document.form_info.address1.disabled = disabled;
  document.form_info.address2.disabled = disabled;

  document.form_info.zipcode.required = !disabled;
  document.form_info.address1.required = !disabled;
  document.form_info.address2.required = !disabled;

  var buttonSelectAddress = document.getElementById('btnSearchAddress');
  buttonSelectAddress.disabled = disabled;
  getTotalCost();
}

function errorHandler(error) {
  $('#btnFormSubmit').button('reset');
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // [START_EXCLUDE]
  switch (errorCode) {
    case 'auth/email-already-in-use':
      alert('이미 등록된 핸드폰번호입니다.');
      break;
    case 'auth/weak-password':
      alert('비밀번호는 최소 6자이상 입력해주세요.');
      break;
    default:
      alert(errorMessage);
  }
  console.error(error);
  // [END_EXCLUDE]
}
