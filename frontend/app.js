const API = "http://localhost:5000/api";

let emailChallengeId = null;
let smsChallengeId = null;

let userEmail = "";
let userMobile = "";


/* =========================================================
   ALL SCREENS
   ========================================================= */

const screens = [
  "registerScreen",
  "emailOtpScreen",
  "emailWrongScreen",
  "emailExpiredScreen",
  "mobileOtpScreen",
  "mobileWrongScreen",
  "mobileMaxScreen",
  "mfaMethodScreen",
  "authSetupScreen",
  "mfaVerifyScreen",
  "successScreen"
];


/* =========================================================
   STEP NUMBER FOR EACH SCREEN
   ========================================================= */

function getStepNumber(id) {

  if (id === "registerScreen") {
    return 1;
  }

  if (
    id === "emailOtpScreen" ||
    id === "emailWrongScreen" ||
    id === "emailExpiredScreen"
  ) {
    return 2;
  }

  if (
    id === "mobileOtpScreen" ||
    id === "mobileWrongScreen" ||
    id === "mobileMaxScreen"
  ) {
    return 3;
  }

  if (
    id === "mfaMethodScreen" ||
    id === "authSetupScreen" ||
    id === "mfaVerifyScreen"
  ) {
    return 4;
  }

  if (id === "successScreen") {
    return 5;
  }

  return 1;
}


/* =========================================================
   SHOW SCREEN
   ========================================================= */

function show(id) {

  screens.forEach(screenId => {

    const screen = document.getElementById(screenId);

    if (screen) {
      screen.classList.remove("active");
    }

  });


  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }


  updateSteps(id);
  updateBackButton(id);
}


/* =========================================================
   UPDATE 1 2 3 4 5 NAVIGATION
   ========================================================= */

function updateSteps(id) {

  const currentStep = getStepNumber(id);

  const steps = document.querySelectorAll(".step");

  steps.forEach((step, index) => {

    const stepNumber = index + 1;

    step.classList.remove("active");
    step.classList.remove("completed");

    if (stepNumber === currentStep) {

      step.classList.add("active");

    } else if (stepNumber < currentStep) {

      step.classList.add("completed");

    }

  });
}


/* =========================================================
   BACK BUTTON
   ========================================================= */

function updateBackButton(id) {

  const backButton = document.getElementById("globalBack");

  if (!backButton) {
    return;
  }


  /*
    No back button on first registration screen
  */

  if (id === "registerScreen") {

    backButton.style.visibility = "hidden";

  } else {

    backButton.style.visibility = "visible";

  }
}


/* =========================================================
   BACK BUTTON FUNCTIONALITY
   ========================================================= */

document.getElementById("globalBack").onclick = function () {

  const activeScreen =
    document.querySelector(".screen.active");

  if (!activeScreen) {
    return;
  }


  const id = activeScreen.id;


  if (
    id === "emailOtpScreen" ||
    id === "emailWrongScreen" ||
    id === "emailExpiredScreen"
  ) {

    show("registerScreen");
    return;

  }


  if (
    id === "mobileOtpScreen" ||
    id === "mobileWrongScreen" ||
    id === "mobileMaxScreen"
  ) {

    show("emailOtpScreen");
    return;

  }


  if (id === "mfaMethodScreen") {

    show("mobileOtpScreen");
    return;

  }


  if (id === "authSetupScreen") {

    show("mfaMethodScreen");
    return;

  }


  if (id === "mfaVerifyScreen") {

    show("authSetupScreen");
    return;

  }

};


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function error(id, message = "") {

  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
  }

}


/* =========================================================
   API HELPER
   ========================================================= */

async function api(path, options = {}) {

  const response = await fetch(API + path, {

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },

    ...options

  });


  const data = await response
    .json()
    .catch(() => ({}));


  if (!response.ok) {

    throw new Error(
      data.message || "Something went wrong"
    );

  }


  return data;
}


/* =========================================================
   OTP INPUT SETUP
   ========================================================= */

function setupOtp(containerId) {

  const inputs = [
    ...document.querySelectorAll(
      `#${containerId} input`
    )
  ];


  inputs.forEach((input, index) => {


    /* Only numbers */

    input.addEventListener("input", () => {

      input.value = input.value
        .replace(/\D/g, "")
        .slice(0, 1);


      if (
        input.value &&
        index < inputs.length - 1
      ) {

        inputs[index + 1].focus();

      }

    });


    /* Backspace */

    input.addEventListener("keydown", event => {

      if (
        event.key === "Backspace" &&
        !input.value &&
        index > 0
      ) {

        inputs[index - 1].focus();

      }

    });


    /* Arrow navigation */

    input.addEventListener("keydown", event => {

      if (
        event.key === "ArrowLeft" &&
        index > 0
      ) {

        inputs[index - 1].focus();

      }


      if (
        event.key === "ArrowRight" &&
        index < inputs.length - 1
      ) {

        inputs[index + 1].focus();

      }

    });

  });


  return function getOtp() {

    return inputs
      .map(input => input.value)
      .join("");

  };

}


const getEmailOtp =
  setupOtp("emailOtp");

const getMobileOtp =
  setupOtp("mobileOtp");

const getMfaOtp =
  setupOtp("mfaOtp");


/* =========================================================
   CLEAR OTP
   ========================================================= */

function clearOtp(id) {

  document
    .querySelectorAll(`#${id} input`)
    .forEach(input => {

      input.value = "";

    });

}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

document.querySelectorAll(".eye").forEach(button => {

  button.addEventListener("click", () => {

    const target =
      document.getElementById(
        button.dataset.target
      );


    if (!target) {
      return;
    }


    if (target.type === "password") {

      target.type = "text";

    } else {

      target.type = "password";

    }

  });

});


/* =========================================================
   PASSWORD REQUIREMENTS
   ========================================================= */

const passwordInput =
  document.getElementById("password");


if (passwordInput) {

  passwordInput.addEventListener("input", event => {

    const value = event.target.value;


    document.getElementById(
      "req-length"
    ).textContent =
      (value.length >= 8 ? "✓" : "○") +
      " At least 8 characters";


    document.getElementById(
      "req-upper"
    ).textContent =
      (/[A-Z]/.test(value) ? "✓" : "○") +
      " 1 uppercase letter";


    document.getElementById(
      "req-number"
    ).textContent =
      (/[0-9]/.test(value) ? "✓" : "○") +
      " 1 number";


    document.getElementById(
      "req-special"
    ).textContent =
      (/[^A-Za-z0-9]/.test(value) ? "✓" : "○") +
      " 1 special character";

  });

}


/* =========================================================
   REGISTER
   ========================================================= */

document
  .getElementById("registerForm")
  .addEventListener("submit", async event => {

    event.preventDefault();


    error("registerError");


    const name =
      document
        .getElementById("name")
        .value
        .trim();


    userEmail =
      document
        .getElementById("email")
        .value
        .trim();


    const countryCode =
      document
        .getElementById("countryCode")
        .value;


    const mobile =
      document
        .getElementById("mobile")
        .value
        .trim();


    userMobile =
      countryCode + " " + mobile;


    const password =
      document
        .getElementById("password")
        .value;


    /* Password validation */

    const validPassword =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);


    if (!validPassword) {

      error(
        "registerError",
        "Please meet all password requirements."
      );

      return;

    }


    try {

      const data = await api(
        "/register",
        {
          method: "POST",

          body: JSON.stringify({

            name: name,

            email: userEmail,

            mobile: mobile,

            password: password,

            confirmPassword: password

          })

        }
      );


      emailChallengeId =
        data.challengeId;


      document.getElementById(
        "emailDisplay"
      ).textContent = userEmail;


      document.getElementById(
        "emailWrongDisplay"
      ).textContent = userEmail;


      document.getElementById(
        "emailExpiredDisplay"
      ).textContent = userEmail;


      clearOtp("emailOtp");


      show("emailOtpScreen");


    } catch (err) {

      error(
        "registerError",
        err.message
      );

    }

  });


/* =========================================================
   EMAIL OTP VERIFICATION
   ========================================================= */

document
  .getElementById("verifyEmail")
  .onclick = async () => {


    const otp = getEmailOtp();


    if (otp.length !== 6) {

      error(
        "emailOtpError",
        "Please enter all 6 digits."
      );

      return;

    }


    try {

      await api(
        "/verify-email-otp",
        {
          method: "POST",

          body: JSON.stringify({

            challengeId:
              emailChallengeId,

            otp: otp

          })

        }
      );


      /*
        After email verification,
        send SMS OTP.
      */

      const data = await api(
        "/send-sms-otp",
        {
          method: "POST",

          body: JSON.stringify({

            challengeId:
              emailChallengeId

          })

        }
      );


      smsChallengeId =
        data.challengeId;


      document.getElementById(
        "mobileDisplay"
      ).textContent =
        userMobile;


      document.getElementById(
        "mobileWrongDisplay"
      ).textContent =
        userMobile;


      clearOtp("mobileOtp");


      error("emailOtpError");


      show("mobileOtpScreen");


    } catch (err) {

      error(
        "emailOtpError",
        err.message
      );


      document.getElementById(
        "emailWrongDisplay"
      ).textContent =
        userEmail;


      show("emailWrongScreen");

    }

  };


/* =========================================================
   EMAIL RETRY
   ========================================================= */

document
  .getElementById("retryEmail")
  .onclick = () => {

    clearOtp("emailOtp");

    error("emailOtpError");

    show("emailOtpScreen");

  };


/* =========================================================
   EMAIL NEW CODE
   ========================================================= */

document
  .getElementById("newEmailCode")
  .onclick = () => {

    clearOtp("emailOtp");

    error("emailOtpError");

    show("emailOtpScreen");

  };


/* =========================================================
   MOBILE OTP VERIFICATION
   ========================================================= */

document
  .getElementById("verifyMobile")
  .onclick = async () => {


    const otp = getMobileOtp();


    if (otp.length !== 6) {

      error(
        "mobileOtpError",
        "Please enter all 6 digits."
      );

      return;

    }


    try {

      await api(
        "/verify-sms-otp",
        {
          method: "POST",

          body: JSON.stringify({

            challengeId:
              smsChallengeId,

            otp: otp

          })

        }
      );


      error("mobileOtpError");


      show("mfaMethodScreen");


    } catch (err) {

      error(
        "mobileOtpError",
        err.message
      );


      const message =
        err.message.toLowerCase();


      if (
        message.includes("maximum") ||
        message.includes("attempt")
      ) {

        show("mobileMaxScreen");

      } else {

        show("mobileWrongScreen");

      }

    }

  };


/* =========================================================
   MOBILE RETRY
   ========================================================= */

document
  .getElementById("retryMobile")
  .onclick = () => {

    clearOtp("mobileOtp");

    error("mobileOtpError");

    show("mobileOtpScreen");

  };


/* =========================================================
   MOBILE NEW CODE
   ========================================================= */

document
  .getElementById("newMobileCode")
  .onclick = () => {

    clearOtp("mobileOtp");

    error("mobileOtpError");

    show("mobileOtpScreen");

  };


/* =========================================================
   MFA METHOD SELECTION
   ========================================================= */

document
  .querySelectorAll(".method")
  .forEach(method => {

    method.addEventListener("click", () => {


      document
        .querySelectorAll(".method")
        .forEach(item => {

          item.classList.remove(
            "selected"
          );

        });


      method.classList.add(
        "selected"
      );


      const radio =
        method.querySelector(
          'input[type="radio"]'
        );


      if (radio) {

        radio.checked = true;

      }

    });

  });


/* =========================================================
   MFA SETUP
   ========================================================= */

document
  .getElementById("mfaContinue")
  .onclick = async () => {


    error("mfaMethodError");


    /*
      Currently the assignment flow uses
      Authenticator App MFA.
    */

    const selectedMethod =
      document.querySelector(
        'input[name="mfa"]:checked'
      );


    if (
      selectedMethod &&
      selectedMethod.value !== "authenticator"
    ) {

      error(
        "mfaMethodError",
        "For this registration flow, please select Authenticator App."
      );

      return;

    }


    try {

      const data = await api(
        "/setup-mfa",
        {
          method: "POST",

          body: JSON.stringify({

            email: userEmail

          })

        }
      );


      const qrCode =
        document.getElementById(
          "qrCode"
        );


      qrCode.src =
        data.qrCode;


      show("authSetupScreen");


    } catch (err) {

      error(
        "mfaMethodError",
        err.message
      );

    }

  };


/* =========================================================
   MFA BACK
   ========================================================= */

document
  .getElementById("mfaBack")
  .onclick = () => {

    show("mfaMethodScreen");

  };


/* =========================================================
   GO TO MFA VERIFICATION
   ========================================================= */

document
  .getElementById("mfaVerifyContinue")
  .onclick = () => {

    clearOtp("mfaOtp");

    error("mfaError");

    show("mfaVerifyScreen");

  };


/* =========================================================
   VERIFY MFA CODE
   ========================================================= */

document
  .getElementById("verifyMfa")
  .onclick = async () => {


    const code =
      getMfaOtp();


    if (code.length !== 6) {

      error(
        "mfaError",
        "Please enter all 6 digits."
      );

      return;

    }


    try {

      const data = await api(
        "/verify-mfa",
        {
          method: "POST",

          body: JSON.stringify({

            email: userEmail,

            code: code

          })

        }
      );


      if (data.mfaEnabled) {

        clearOtp("mfaOtp");

        error("mfaError");

        show("successScreen");

      }

    } catch (err) {

      error(
        "mfaError",
        err.message
      );

    }

  };


/* =========================================================
   CONTINUE TO LOGIN
   PART 2
   ========================================================= */

document
  .getElementById("continueLogin")
  .onclick = () => {

    alert(
      "Login journey will be implemented in Part 2."
    );

  };


/* =========================================================
   LOGIN LINK
   PART 2
   ========================================================= */

document
  .getElementById("goLogin")
  .onclick = () => {

    alert(
      "Login journey will be implemented in Part 2."
    );

  };


/* =========================================================
   INITIAL SCREEN
   ========================================================= */

show("registerScreen");