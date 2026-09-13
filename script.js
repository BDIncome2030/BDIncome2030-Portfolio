const SUPABASE_URL = "https://jqpxkqitklzxhzcobisv.supabase.co";
const SUPABASE_KEY = "sb_publishable_sF42Wa1UmTXPOXK9NvMVdw_eZiKyh6o";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Sign Up
const signupBtn = document.getElementById("signup");

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Email এবং Password দিন");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Sign Up সফল হয়েছে!");
  });
}

// Login
const loginBtn = document.getElementById("login");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login সফল হয়েছে!");
  });
}


