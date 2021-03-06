/**
 * user phone number as email
 */
function getEmail() {
  var phone = document.form_info.phone.value;
  var email = 'user'+ phone +'@redfactory.net';
  return email;
}

/**
 * Handles the sign in button press.
 */
function toggleSignIn() {
  if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  } else {
    var email = getEmail();
    var password = document.form_info.password.value;
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      document.getElementById('quickstart-sign-in').disabled = false;
      // [END_EXCLUDE]
    });
    // [END authwithemail]
  }
  document.getElementById('quickstart-sign-in').disabled = true;
}

/**
 * Handles the sign up button press.
 */
function handleSignUp() {
  var email = getEmail();
  var password = document.form_info.password.value;
  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }
  // Sign in with email and pass.
  // [START createwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END createwithemail]
}

function sendPasswordReset() {
  var email = getEmail();
  // [START sendpasswordemail]
  firebase.auth().sendPasswordResetEmail(email).then(function() {
    // Password Reset Email Sent!
    // [START_EXCLUDE]
    alert('Password Reset Email Sent!');
    // [END_EXCLUDE]
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/invalid-email') {
      alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END sendpasswordemail];
}

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
// function initApp() {
//   // Listening for auth state changes.
//   // [START authstatelistener]
//   firebase.auth().onAuthStateChanged(function(user) {
//     // [START_EXCLUDE silent]
//     // [END_EXCLUDE]
//     if (user) {
//       // User is signed in.
//       var displayName = user.displayName;
//       var email = user.email;
//       var uid = user.uid;
//       var providerData = user.providerData;
//       // [START_EXCLUDE silent]
//       // [END_EXCLUDE]
//     } else {
//       // User is signed out.
//       // [START_EXCLUDE silent]

//       // [END_EXCLUDE]
//     }
//     // [START_EXCLUDE silent]
//     // [END_EXCLUDE]
//   });
//   // [END authstatelistener]
// }

// window.onload = function() {
//   initApp();
// };





// Shortcuts to DOM Elements.
var listeningFirebaseRefs = [];
var userOrderList = document.getElementById('UserOrderList');

function getUserFormData() {
  var myUserId = firebase.auth().currentUser.uid;
  var userPostsRef = firebase.database().ref('user-orders/' + myUserId);

  var fetchPosts = function(postsRef, sectionElement) {
    postsRef.on('child_added', function(data) {
      var totalCount = '';
      for (var type in PRODUCT_CONFIG) {
        var item = PRODUCT_CONFIG[type];
        var name = 'count_'+ type;
        var count = data.val()[name];
        if (count == 0) continue;
        totalCount += item.label +' '+ count +'개 ';
      }
      totalCount += '총 '+ numberFormatter(data.val().total) +'원';

      var address = '';
      if (data.val().receive != RECEIVE_FIELD['BY_SELF']) {
        address += data.val().address1;
        address += ' '+ data.val().address2;
        address += ' 우편번호: '+ data.val().zipcode;
      }

      document.form_result.phone.value = data.val().phone;
      document.form_result.name.value = data.val().name;
      document.form_result.receive.value = data.val().receive;
      document.form_result.count.value = totalCount;
      document.form_result.address.value = address || '-';
      document.form_result.note.value = data.val().note || '-';

      //address
    });
  };

  // Fetching and displaying all posts of each sections.
  fetchPosts(userPostsRef, userOrderList);

  // Keep track of all Firebase refs we are listening to.
  listeningFirebaseRefs.push(userPostsRef);
}