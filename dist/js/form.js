function getTotalCost() {
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
  if (total < DO_NOT_NEED_DELIVERY_FEE) {
    str += ' + 배송비('+ numberFormatter(DELIVERY_FEE) +'원)';
  }
  str += ' = '+ numberFormatter(total + DELIVERY_FEE) +'원';
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
    alert('Please enter a phone number.');
    return false;
  } else if (phone.length < 10 || phone.length > 12) {
    document.form_info.phone.focus();
    alert('Please enter a valid phone number.');
    return false;
  }
  var password = document.form_info.password.value.trim();
  if (password.length === 0) {
    document.form_info.password.focus();
    alert('Please enter a password.');
    return false;
  } else if (password.length < 6) {
    document.form_info.password.focus();
    alert('Enter Password at least six words.');
    return false;
  }
  var passwordConfirm = document.form_info.password_confirm.value.trim();
  if (password.length === 0) {
    document.form_info.password_confirm.focus();
    alert('Please enter a password confirm.');
    return false;
  } else if (password !== passwordConfirm) {
    document.form_info.password_confirm.focus();
    alert('Password and Password Confirm is different.');
    return false;
  }
  var name = document.form_info.name.value.trim();
  if (name.length === 0) {
    document.form_info.name.focus();
    alert('Please enter a name.');
    return false;
  }
  var receive = document.form_info.receive.value.trim();
  if (receive !== 'BY_SELF') {
    // need zipcode
    var zipcode = document.form_info.zipcode.value.trim();
    if (zipcode.length === 0) {
      alert('Please enter a address and zipcode.');
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
    alert('Please enter a number of count.');
    return false;
  }
  return true;
}

function formSubmit() {
  var isValid = formValidate();
  if (isValid) {
    var email = getEmail();
    var password = document.form_info.password.value;

    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then(formPostData)
      .catch(errorHandler);
    // [END createwithemail]
  }
}

function formPostData() {
  var uid = firebase.auth().currentUser.uid.trim();
  var phone = document.form_info.phone.value.trim();
  var name = document.form_info.name.value.trim();
  var receive = document.form_info.receive.value.trim();
  var address1 = document.form_info.address1.value.trim();
  var address2 = document.form_info.address2.value.trim();
  var zipcode = document.form_info.zipcode.value.trim();
  var note = document.form_info.note.value.trim();
  var total = document.form_info.total.value.trim();

  var postData = {
    uid: uid,
    phone: phone,
    name: name,
    receive: RECEIVE_FIELD[receive],
    address1: address1,
    address2: address2,
    zipcode: zipcode, 
    note: note,
    total: total
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
  console.log('showAddress');
  new daum.Postcode({
    oncomplete: function(data) {
      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분입니다.
      // 예제를 참고하여 다양한 활용법을 확인해 보세요.
      console.log(data);

      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

      // 도로명 주소의 노출 규칙에 따라 주소를 조합한다.
      // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
      var fullRoadAddr = data.roadAddress; // 도로명 주소 변수
      var extraRoadAddr = ''; // 도로명 조합형 주소 변수

      // 법정동명이 있을 경우 추가한다. (법정리는 제외)
      // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
      if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
          extraRoadAddr += data.bname;
      }
      // 건물명이 있고, 공동주택일 경우 추가한다.
      if(data.buildingName !== '' && data.apartment === 'Y'){
         extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
      }
      // 도로명, 지번 조합형 주소가 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
      if(extraRoadAddr !== ''){
          extraRoadAddr = ' (' + extraRoadAddr + ')';
      }
      // 도로명, 지번 주소의 유무에 따라 해당 조합형 주소를 추가한다.
      if(fullRoadAddr !== ''){
          fullRoadAddr += extraRoadAddr;
      }

      // 우편번호와 주소 정보를 해당 필드에 넣는다.
      var form = document.form_info;
      form.zipcode.value = data.zonecode;
      form.address1.value = data.zonecode;
      
      // document.getElementById('sample4_postcode').value = data.zonecode; //5자리 새우편번호 사용
      // document.getElementById('sample4_roadAddress').value = fullRoadAddr;
      // document.getElementById('sample4_jibunAddress').value = data.jibunAddress;
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
}

function errorHandler(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // [START_EXCLUDE]
  switch (errorCode) {
    case 'auth/email-already-in-use':
      alert('The phone number is already in use by another account.');
      break;
    case 'auth/weak-password':
      alert('The password is too weak.');
      break;
    default:
      alert(errorMessage);
  }
  console.error(error);
  // [END_EXCLUDE]
}
