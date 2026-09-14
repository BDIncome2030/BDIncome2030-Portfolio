// ==========================================
// BDIncome2030 - Complete Supabase Script
// ==========================================

const SUPABASE_URL = "https://jqpxkqitklzxhzcobisv.supabase.co";

const SUPABASE_KEY =
 "sb_publishable_sF42Wa1UmTXPOXK9NvMVdw_eZiKyh6o";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentUser = null;
let selectedTask = null;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
  await checkUser();
});


// ==========================================
// CHECK USER
// ==========================================

async function checkUser() {
  try {
    const {
      data,
      error
    } = await supabaseClient.auth.getUser();

    if (error) {
      console.error("User check error:", error);
      return;
    }

    currentUser = data.user || null;

    if (currentUser) {
      showDashboard();

      await loadProfile(currentUser.id);
      await loadTasks();

    } else {
      showLoggedOut();
    }

  } catch (error) {
    console.error("checkUser:", error);
  }
}


// ==========================================
// SIGN UP
// ==========================================

async function signup() {

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;

  const referral =
    document.getElementById("signupReferral").value.trim();

  const message =
    document.getElementById("signupMessage");

  message.textContent = "";

  if (!email || !password) {
    message.textContent =
      "Email এবং Password দিন।";
    return;
  }

  if (password.length < 6) {
    message.textContent =
      "Password কমপক্ষে ৬ অক্ষরের হতে হবে।";
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
          referral_code:
            referral || null
        }
      }

    });

    if (error) {
      message.textContent =
        error.message;
      return;
    }

    if (data.session) {

      closeModal("signupModal");

      await checkUser();

      alert("Sign Up সফল হয়েছে।");

    } else {

      message.textContent =
        "Sign Up সফল হয়েছে। Email verification প্রয়োজন হলে আপনার email দেখুন।";
    }

  } catch (error) {

    console.error("signup:", error);

    message.textContent =
      "Sign Up করতে সমস্যা হয়েছে।";
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

  const message =
    document.getElementById("loginMessage");

  message.textContent = "";

  if (!email || !password) {

    message.textContent =
      "Email এবং Password দিন।";

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

      message.textContent =
        error.message;

      return;
    }

    currentUser = data.user;

    closeModal("loginModal");

    await checkUser();

  } catch (error) {

    console.error("login:", error);

    message.textContent =
      "Login করতে সমস্যা হয়েছে।";
  }
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
        "Logout করতে সমস্যা হয়েছে: " +
        error.message
      );

      return;
    }

    currentUser = null;

    showLoggedOut();

    alert("Logout সফল হয়েছে।");

  } catch (error) {

    console.error("logout:", error);

    alert(
      "Logout করতে সমস্যা হয়েছে।"
    );
  }
}


// ==========================================
// MODALS
// ==========================================

function showLogin() {

  closeModal("signupModal");

  document
    .getElementById("loginModal")
    .classList
    .remove("hidden");
}


function showSignup() {

  closeModal("loginModal");

  document
    .getElementById("signupModal")
    .classList
    .remove("hidden");
}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {
    modal.classList.add("hidden");
  }
}


// ==========================================
// DASHBOARD
// ==========================================

function showDashboard() {

  document
    .getElementById("dashboard")
    .classList
    .remove("hidden");
}


function showLoggedOut() {

  document
    .getElementById("dashboard")
    .classList
    .add("hidden");

  setText(
    "userEmail",
    "Login করুন"
  );

  setText(
    "userBalance",
    "0.00"
  );

  setText(
    "referralCode",
    "Referral code loading..."
  );

  setHTML(
    "tasksList",
    "<p>Login করলে Tasks দেখা যাবে।"
  );
}


// ==========================================
// LOAD PROFILE
// ==========================================

// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(userId) {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile error:", error);

      setText(
        "userEmail",
        currentUser?.email || "Email not available"
      );

      setText("userBalance", "0.00");

      setText(
        "referralCode",
        "Referral code পাওয়া যায়নি"
      );

      return;
    }

    // Profile না থাকলে
    if (!data) {
      console.error("Profile not found for user:", userId);

      setText(
        "userEmail",
        currentUser?.email || "Email not available"
      );

      setText("userBalance", "0.00");

      setText(
        "referralCode",
        "Referral code পাওয়া যায়নি"
      );

      return;
    }

    // Email
    setText(
      "userEmail",
      currentUser?.email || "Email not available"
    );

    // Balance
    const balance =
      data.balance !== null &&
      data.balance !== undefined
        ? Number(data.balance).toFixed(2)
        : "0.00";

    setText("userBalance", balance);

    // Referral
    const referral =
      data.referral_code ||
      data.referralCode ||
      "No referral code";

    setText(
      "referralCode",
      "Referral Code: " + referral
    );

  } catch (error) {
    console.error("loadProfile:", error);

    setText(
      "userEmail",
      currentUser?.email || "Email not available"
    );

    setText("userBalance", "0.00");

    setText(
      "referralCode",
      "Referral code পাওয়া যায়নি"
    );
  }
}


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks() {

  const list =
    document.getElementById(
      "tasksList"
    );

  if (!list) return;

  if (!currentUser) {

    list.innerHTML =
      "<p>Login করলে Tasks দেখা যাবে।";

    return;
  }

  list.innerHTML =
    "<p>Tasks loading...</p>";

  try {

    const {
      data: tasks,
      error
    } = await supabaseClient
      .from("tasks")
      .select("*")
      .order("id", {
        ascending: true
      });

    if (error) {

      console.error(
        "Tasks error:",
        error
      );

      list.innerHTML =
        "<p>Tasks load করতে সমস্যা হয়েছে।";

      return;
    }

    if (!tasks || tasks.length === 0) {

      list.innerHTML =
        "<p>এখন কোনো Task নেই।";

      return;
    }

    list.innerHTML = "";

    tasks.forEach(
      function(task) {

        const card =
          document.createElement("div");

        card.className =
          "task-card";

        const info =
          document.createElement("div");

        info.className =
          "task-info";

        const title =
          document.createElement("h3");

        title.textContent =
          task.title ||
          task.name ||
          "Task";

        const description =
          document.createElement("p");

        description.textContent =
          task.description ||
          "এই Task সম্পন্ন করুন।";

        const reward =
          document.createElement("p");

        reward.className =
          "task-reward";

        reward.textContent =
          "Reward: ৳ " +
          (
            task.reward !== undefined &&
            task.reward !== null
              ? Number(task.reward).toFixed(2)
              : "0.00"
          );

        const button =
          document.createElement("button");

        button.className =
          "start-btn";

        button.textContent =
          "Start Task";

        button.onclick =
          function() {
            startTask(task);
          };

        info.appendChild(title);
        info.appendChild(description);
        info.appendChild(reward);

        card.appendChild(info);
        card.appendChild(button);

        list.appendChild(card);
      }
    );

  } catch (error) {

    console.error(
      "loadTasks:",
      error
    );

    list.innerHTML =
      "<p>Tasks load করতে সমস্যা হয়েছে।";
  }
}


// ==========================================
// START TASK
// ==========================================

async function startTask(task) {

  if (!task) {
    return;
  }

  if (!currentUser) {

    showLogin();

    return;
  }

  selectedTask = task;

  // Task URL open
  if (task.task_url) {

    window.open(
      task.task_url,
      "_blank"
    );
  }

  // Proof box open
  setText(
    "proofTitle",
    "Proof - " +
    (
      task.title ||
      task.name ||
      "Task"
    )
  );

  document.getElementById(
    "proofText"
  ).value = "";

  document.getElementById(
    "proofMessage"
  ).textContent = "";

  document
    .getElementById("proofModal")
    .classList
    .remove("hidden");
}


// ==========================================
// SUBMIT PROOF
// ==========================================

async function submitProof() {

  if (!selectedTask) {
    return;
  }

  if (!currentUser) {

    showLogin();

    return;
  }

  const proofBox =
    document.getElementById(
      "proofText"
    );

  const message =
    document.getElementById(
      "proofMessage"
    );

  const button =
    document.getElementById(
      "proofSubmitBtn"
    );

  const proof =
    proofBox.value.trim();

  if (!proof) {

    message.textContent =
      "Proof লিখুন।";

    return;
  }

  button.disabled = true;

  message.textContent =
    "Submitting...";

  try {

    const {
      error
    } = await supabaseClient
      .from("task_submissions")
      .insert({

        task_id:
          selectedTask.id,

        user_id:
          currentUser.id,

        proof:
          proof,

        status:
          "pending",

        reward_credited:
          false

      });

    if (error) {

      console.error(
        "Submission error:",
        error
      );

      if (error.code === "23505") {

        message.textContent =
          "এই Task-এর জন্য আপনি আগেই Proof জমা দিয়েছেন।";

      } else {

        message.textContent =
          "Proof submit করতে সমস্যা হয়েছে: " +
          error.message;
      }

      return;
    }

    message.textContent =
      "Task সফলভাবে জমা হয়েছে।";

    proofBox.value = "";

    setTimeout(
      function() {

        closeModal(
          "proofModal"
        );

        selectedTask = null;

      },
      1000
    );

  } catch (error) {

    console.error(
      "submitProof:",
      error
    );

    message.textContent =
      "Proof submit করতে সমস্যা হয়েছে।";

  } finally {

    button.disabled = false;
  }
}


// ==========================================
// AUTH STATE
// ==========================================

supabaseClient.auth.onAuthStateChange(
  function(event, session) {

    currentUser =
      session?.user || null;

    if (currentUser) {

      showDashboard();

      setTimeout(
        async function() {

          await loadProfile(
            currentUser.id
          );

          await loadTasks();

        },
        0
      );

    } else {

      showLoggedOut();
    }
  }
);


// ==========================================
// HELPERS
// ==========================================

function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element) {

    element.textContent =
      value;
  }
}


function setHTML(id, value) {

  const element =
    document.getElementById(id);

  if (element) {

    element.innerHTML =
      value;
  }
}
