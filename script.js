const SUPABASE_URL = "https://jqpxkqitklzxhzcobisv.supabase.co";
const SUPABASE_KEY = "sb_publishable_sF42Wa1UmTXPOXK9NvMVdw_eZiKyh6o";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =========================
// SHOW SIGN UP
// =========================

function showSignup() {
  document.getElementById("signupBox").style.display = "block";
  document.getElementById("loginBox").style.display = "none";

  document.getElementById("signupBox").scrollIntoView({
    behavior: "smooth"
  });
}


// =========================
// SHOW LOGIN
// =========================

function showLogin() {
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("signupBox").style.display = "none";

  document.getElementById("loginBox").scrollIntoView({
    behavior: "smooth"
  });
}


// =========================
// CLOSE LOGIN / SIGNUP
// =========================

function closeAuth() {
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("loginBox").style.display = "none";
}


// =========================
// SIGN UP
// =========================

async function signup() {

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!name) {
    alert("আপনার নাম লিখুন।");
    return;
  }

  if (!email) {
    alert("আপনার Email লিখুন।");
    return;
  }

  if (!password || password.length < 6) {
    alert("Password কমপক্ষে 6 অক্ষরের হতে হবে।");
    return;
  }

  try {

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      alert("Sign Up Error: " + error.message);
      return;
    }

    alert("Sign Up সফল হয়েছে! আপনার Email চেক করুন।");

    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";

  } catch (error) {

    alert("একটি সমস্যা হয়েছে: " + error.message);

  }
}


// =========================
// LOGIN
// =========================

async function login() {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Email এবং Password দিন।");
    return;
  }

  try {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      alert("Login Error: " + error.message);
      return;
    }

    showDashboard(data.user);

  } catch (error) {

    alert("একটি সমস্যা হয়েছে: " + error.message);

  }
}


// =========================
// SHOW DASHBOARD
// =========================

function showDashboard(user) {

  document.getElementById("home").style.display = "none";
  document.getElementById("features").style.display = "none";

  document.getElementById("signupBox").style.display = "none";
  document.getElementById("loginBox").style.display = "none";

  document.getElementById("dashboard").style.display = "block";

  document.getElementById("userEmail").textContent =
    user.email || "";

  document.getElementById("userBalance").textContent =
    "0.00";

  document.getElementById("referralCode").textContent =
    "Referral code শীঘ্রই আসবে।";

  document.getElementById("dashboard").scrollIntoView({
    behavior: "smooth"
  });
}


// =========================
// LOGOUT
// =========================

async function logout() {

  const { error } = await supabase.auth.signOut();

  if (error) {
    alert("Logout Error: " + error.message);
    return;
  }

  document.getElementById("dashboard").style.display = "none";
  document.getElementById("home").style.display = "block";
  document.getElementById("features").style.display = "block";

  alert("Logout সফল হয়েছে।");
}


// =========================
// CHECK EXISTING SESSION
// =========================

async function checkSession() {

  const { data } = await supabase.auth.getSession();

  if (data && data.session) {
    showDashboard(data.session.user);
  }

}


// Run when page loads
checkSession();



