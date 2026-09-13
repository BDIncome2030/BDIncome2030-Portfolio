
// ==========================================
// BDIncome2030 - Supabase Authentication
// ==========================================

// Supabase configuration
const SUPABASE_URL = "https://jqpxkqitklzxhzcobisv.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_sF42Wa1UmTXPOXK9NvMVdw_eZiKyh6o";

// Check Supabase library
if (!window.supabase) {
  alert("Supabase library load হয়নি।");
  throw new Error("Supabase library not loaded");
}

// Create Supabase client
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ==========================================
// Show Sign Up
// ==========================================

function showSignup() {

  document.getElementById("loginBox").style.display = "none";

  document.getElementById("signupBox").style.display = "block";

  document.getElementById("signupBox").scrollIntoView({
    behavior: "smooth"
  });
}


// ==========================================
// Show Login
// ==========================================

function showLogin() {

  document.getElementById("signupBox").style.display = "none";

  document.getElementById("loginBox").style.display = "block";

  document.getElementById("loginBox").scrollIntoView({
    behavior: "smooth"
  });
}


// ==========================================
// Close Authentication Box
// ==========================================

function closeAuth() {

  document.getElementById("signupBox").style.display = "none";

  document.getElementById("loginBox").style.display = "none";
}


// ==========================================
// SIGN UP
// ==========================================

async function signup() {

  const name =
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;

  // Validation
  if (!name) {
    alert("আপনার নাম লিখুন।");
    return;
  }

  if (!email) {
    alert("আপনার Email লিখুন।");
    return;
  }

  if (!password) {
    alert("Password লিখুন।");
    return;
  }

  if (password.length < 6) {
    alert("Password কমপক্ষে 6 অক্ষরের হতে হবে।");
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.signUp({

      email: email,

      password: password,

      options: {
        data: {
          full_name: name
        }
      }

    });

    if (error) {
      alert("Sign Up ব্যর্থ:\n" + error.message);
      return;
    }

    // If email confirmation is enabled
    if (data.user && !data.session) {

      alert(
        "অ্যাকাউন্ট তৈরি হয়েছে।\n\n" +
        "আপনার Email inbox-এ গিয়ে confirmation link-এ ক্লিক করুন। " +
        "তারপর Login করুন।"
      );

      document.getElementById("signupPassword").value = "";

      showLogin();

      return;
    }

    // If automatic login is enabled
    if (data.user && data.session) {

      alert("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");

      showDashboard(data.user);

      return;
    }

  } catch (err) {

    console.error(err);

    alert(
      "একটি সমস্যা হয়েছে:\n" +
      err.message
    );
  }
}


// ==========================================
// LOGIN
// ==========================================

async function login() {

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  if (!email) {
    alert("আপনার Email লিখুন।");
    return;
  }

  if (!password) {
    alert("আপনার Password লিখুন।");
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({

      email: email,

      password: password

    });

    if (error) {

      alert(
        "Login ব্যর্থ:\n" +
        error.message
      );

      return;
    }

    if (data.user) {

      alert("Login সফল হয়েছে!");

      showDashboard(data.user);

    }

  } catch (err) {

    console.error(err);

    alert(
      "Login করার সময় সমস্যা হয়েছে:\n" +
      err.message
    );
  }
}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard(user) {

  // Hide home sections
  document.getElementById("home").style.display = "none";

  document.getElementById("features").style.display = "none";

  // Hide auth boxes
  document.getElementById("signupBox").style.display = "none";

  document.getElementById("loginBox").style.display = "none";

  // Show dashboard
  document.getElementById("dashboard").style.display = "block";

  // Hide navigation buttons
  document.getElementById("navButtons").style.display = "none";

  // User email
  document.getElementById("userEmail").textContent =
    user.email || "Email unavailable";

  // Balance
  document.getElementById("userBalance").textContent =
    "0.00";

  // Referral code
  const referralCode =
    "BD" + user.id.substring(0, 8).toUpperCase();

  document.getElementById("referralCode").textContent =
    referralCode;

  // Scroll to dashboard
  document.getElementById("dashboard").scrollIntoView({
    behavior: "smooth"
  });
}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

  try {

    const {
      error
    } = await supabaseClient.auth.signOut();

    if (error) {

      alert(
        "Logout ব্যর্থ:\n" +
        error.message
      );

      return;
    }

    // Show homepage
    document.getElementById("home").style.display = "block";

    document.getElementById("features").style.display = "block";

    // Hide dashboard
    document.getElementById("dashboard").style.display = "none";

    // Show navigation
    document.getElementById("navButtons").style.display = "block";

    // Clear forms
    document.getElementById("loginEmail").value = "";

    document.getElementById("loginPassword").value = "";

    document.getElementById("signupName").value = "";

    document.getElementById("signupEmail").value = "";

    document.getElementById("signupPassword").value = "";

    alert("Logout সফল হয়েছে।");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (err) {

    console.error(err);

    alert(
      "Logout করার সময় সমস্যা হয়েছে:\n" +
      err.message
    );
  }
}


// ==========================================
// CHECK EXISTING SESSION
// ==========================================

async function checkSession() {

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

    if (error) {

      console.error(
        "Session error:",
        error.message
      );

      return;
    }

    if (data.session && data.session.user) {

      showDashboard(
        data.session.user
      );

    }

  } catch (err) {

    console.error(
      "Session check failed:",
      err
    );
  }
}


// ==========================================
// AUTH STATE CHANGE
// ==========================================

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    console.log(
      "Auth event:",
      event
    );

    if (
      session &&
      session.user &&
      event === "SIGNED_IN"
    ) {

      showDashboard(
        session.user
      );
    }

  }
);


// ==========================================
// START
// ==========================================

checkSession();
