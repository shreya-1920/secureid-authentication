const API = "http://localhost:5000/api";

let emailChallengeId = null;
let smsChallengeId = null;
let userEmail = "";
let userMobile = "";

const screens = [
  "registerScreen","emailOtpScreen","emailWrongScreen","emailExpiredScreen",
  "mobileOtpScreen","mobileWrongScreen","mobileMaxScreen","mfaMethodScreen",
  "authSetupScreen","mfaVerifyScreen","successScreen"
];

function show(id){
  function show(id){

  screens.forEach(s => {
    document.getElementById(s).classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  let step =
    id === "registerScreen" ? 1 :
    id.includes("email") ? 2 :
    id.includes("mobile") ? 3 :
    id === "mfaMethodScreen" ||
    id === "authSetupScreen" ||
    id === "mfaVerifyScreen" ? 4 :
    5;

  document.querySelectorAll(".step").forEach((el,i) => {

    const stepNumber = i + 1;

    el.classList.remove("active","completed");

    if(stepNumber === step){
      el.classList.add("active");
    }

    if(stepNumber < step){
      el.classList.add("completed");
    }

  });
}
}

function error(id,msg=""){ document.getElementById(id).textContent = msg; }

async function api(path, options={}){
  const r = await fetch(API+path,{
    credentials:"include",
    headers:{"Content-Type":"application/json",...(options.headers||{})},
    ...options
  });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function setupOtp(containerId){
  const inputs = [...document.querySelectorAll(`#${containerId} input`)];
  inputs.forEach((input,i)=>{
    input.addEventListener("input",()=>{
      input.value=input.value.replace(/\D/g,"").slice(0,1);
      if(input.value && i<inputs.length-1) inputs[i+1].focus();
    });
    input.addEventListener("keydown",e=>{
      if(e.key==="Backspace"&&!input.value&&i>0) inputs[i-1].focus();
    });
  });
  return ()=>inputs.map(x=>x.value).join("");
}
const getEmailOtp = setupOtp("emailOtp");
const getMobileOtp = setupOtp("mobileOtp");
const getMfaOtp = setupOtp("mfaOtp");

function clearOtp(id){document.querySelectorAll(`#${id} input`).forEach(x=>x.value="");}

document.querySelectorAll(".eye").forEach(btn=>{
  btn.onclick=()=>{
    const x=document.getElementById(btn.dataset.target);
    x.type=x.type==="password"?"text":"password";
  };
});

document.getElementById("password").addEventListener("input",e=>{
  const v=e.target.value;
  document.getElementById("req-length").textContent=(v.length>=8?"✓":"○")+" At least 8 characters";
  document.getElementById("req-upper").textContent=(/[A-Z]/.test(v)?"✓":"○")+" 1 uppercase letter";
  document.getElementById("req-number").textContent=(/[0-9]/.test(v)?"✓":"○")+" 1 number";
  document.getElementById("req-special").textContent=(/[^A-Za-z0-9]/.test(v)?"✓":"○")+" 1 special character";
});

document.getElementById("registerForm").addEventListener("submit",async e=>{
  e.preventDefault();
  error("registerError");
  userEmail=document.getElementById("email").value.trim();
  userMobile=document.getElementById("countryCode").value+" "+document.getElementById("mobile").value.trim();

  try{
    const data=await api("/register",{method:"POST",body:JSON.stringify({
      name:document.getElementById("name").value.trim(),
      email:userEmail,
      mobile:document.getElementById("mobile").value.trim(),
      password:document.getElementById("password").value,
      confirmPassword:document.getElementById("password").value
    })});
    emailChallengeId=data.challengeId;
    document.getElementById("emailDisplay").textContent=userEmail;
    document.getElementById("emailWrongDisplay").textContent=userEmail;
    document.getElementById("emailExpiredDisplay").textContent=userEmail;
    show("emailOtpScreen");
  }catch(err){error("registerError",err.message)}
});

document.getElementById("verifyEmail").onclick=async()=>{
  const otp=getEmailOtp();
  if(otp.length!==6){error("emailOtpError","Please enter all 6 digits.");return}
  try{
    await api("/verify-email-otp",{method:"POST",body:JSON.stringify({challengeId:emailChallengeId,otp})});
    const data=await api("/send-sms-otp",{method:"POST",body:JSON.stringify({challengeId:emailChallengeId})});
    smsChallengeId=data.challengeId;
    document.getElementById("mobileDisplay").textContent=userMobile;
    document.getElementById("mobileWrongDisplay").textContent=userMobile;
    show("mobileOtpScreen");
    clearOtp("mobileOtp");
  }catch(err){
    error("emailOtpError",err.message);
    show("emailWrongScreen");
    document.getElementById("emailWrongDisplay").textContent=userEmail;
  }
};

document.getElementById("retryEmail").onclick=()=>{clearOtp("emailOtp");error("emailOtpError");show("emailOtpScreen")};
document.getElementById("newEmailCode").onclick=()=>{clearOtp("emailOtp");error("emailOtpError");show("emailOtpScreen")};

document.getElementById("verifyMobile").onclick=async()=>{
  const otp=getMobileOtp();
  if(otp.length!==6){error("mobileOtpError","Please enter all 6 digits.");return}
  try{
    await api("/verify-sms-otp",{method:"POST",body:JSON.stringify({challengeId:smsChallengeId,otp})});
    show("mfaMethodScreen");
  }catch(err){
    error("mobileOtpError",err.message);
    show(err.message.toLowerCase().includes("maximum") ? "mobileMaxScreen" : "mobileWrongScreen");
  }
};

document.getElementById("retryMobile").onclick=()=>{clearOtp("mobileOtp");error("mobileOtpError");show("mobileOtpScreen")};
document.getElementById("newMobileCode").onclick=()=>{clearOtp("mobileOtp");error("mobileOtpError");show("mobileOtpScreen")};

document.querySelectorAll(".method").forEach(m=>{
  m.addEventListener("click",()=>{
    document.querySelectorAll(".method").forEach(x=>x.classList.remove("selected"));
    m.classList.add("selected");
    m.querySelector("input").checked=true;
  });
});

document.getElementById("mfaContinue").onclick=async()=>{
  try{
    const data = await api("/setup-mfa", {
      method:"POST",
      body:JSON.stringify({
        email:userEmail
      })
    });

    document.getElementById("qrImage").src = data.qrCode;

    show("authSetupScreen");
  }catch(err){
    error("mfaMethodError", err.message);
  }
};
document.getElementById("mfaBack").onclick=()=>show("mfaMethodScreen");
document.getElementById("mfaVerifyContinue").onclick=()=>{clearOtp("mfaOtp");show("mfaVerifyScreen")};
document.getElementById("verifyMfa").onclick = async () => {

    const code = getMfaOtp();

    if (code.length !== 6) {
        error("mfaError", "Please enter all 6 digits.");
        return;
    }

    try {

        const data = await api("/verify-mfa", {
            method: "POST",
            body: JSON.stringify({
                email: userEmail,
                code: code
            })
        });

        if (data.mfaEnabled) {
            clearOtp("mfaOtp");
            show("successScreen");
        }

    } catch (error) {
        error("mfaError", error.message);
    }
};

document.getElementById("continueLogin").onclick=()=>alert("Login journey will be implemented in Part 2.");
document.getElementById("goLogin").onclick=()=>alert("Login journey will be implemented in Part 2.");
document.getElementById("backToRegister").onclick=()=>show("registerScreen");
document.getElementById("resendEmail").onclick=()=>show("emailOtpScreen");
document.getElementById("resendMobile").onclick=()=>show("mobileOtpScreen");

show("registerScreen");
document.getElementById("globalBack").onclick = () => {

  const activeScreen =
    document.querySelector(".screen.active");

  if(!activeScreen) return;

  const id = activeScreen.id;

  if(id === "registerScreen"){
    return;
  }

  if(
    id === "emailOtpScreen" ||
    id === "emailWrongScreen" ||
    id === "emailExpiredScreen"
  ){
    show("registerScreen");
    return;
  }

  if(
    id === "mobileOtpScreen" ||
    id === "mobileWrongScreen" ||
    id === "mobileMaxScreen"
  ){
    show("emailOtpScreen");
    return;
  }

  if(id === "mfaMethodScreen"){
    show("mobileOtpScreen");
    return;
  }

  if(id === "authSetupScreen"){
    show("mfaMethodScreen");
    return;
  }

  if(id === "mfaVerifyScreen"){
    show("authSetupScreen");
    return;
  }
};