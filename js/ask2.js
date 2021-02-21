firebase.auth().signInAnonymously()
    .then(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                var uid = user.uid;
                console.log(user.uid)

            } else {
                // User is signed out
                // ...
            }
        });
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    })


