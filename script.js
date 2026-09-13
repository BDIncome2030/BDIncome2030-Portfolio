// ==========================================
// BDIncome2030 - Authentication + Task System
// ==========================================

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
  "https://jqpxkqitklzxhzcobisv.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_sF42Wa1UmTXPOXK9NvMVdw_eZiKyh6o";


// ==========================================
// CHECK SUPABASE
// ==========================================

if (!window.supabase) {
  alert("Supabase library load হয়নি।");
  throw new Error("Supabase library not loaded");
}


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ==========================================
// SHOW SIGN UP
// ==========================================

function showSignup() {

  document.getElementById("loginBox").style.display = "none";

  document.getElementById("signupBox").style.display = "block";

  document.getElementById("signupBox").scrollIntoView({
    behavior: "smooth"
  });
}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

  document.getElementById("signupBox").style.display = "none";

  document.getElementById("loginBox").style.display = "block";

  document.getElementById("loginBox").scrollIntoView({
    behavior: "smooth"
  });
}


// ==========================================
// CLOSE AUTH
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

      alert(
        "Sign Up ব্যর্থ:\n" +
        error.message
      );

      return;
    }


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
// LOAD USER PROFILE
// ==========================================

async function loadUserProfile(user) {

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("profiles")
      .select("full_name, referral_code, balance")
      .eq("id", user.id)
      .maybeSingle();


    if (error) {

      console.error(
        "Profile load error:",
        error.message
      );

      // Fallback balance
      document.getElementById("userBalance").textContent =
        "0.00";

      const fallbackReferral =
        "BD" + user.id.substring(0, 8).toUpperCase();

      document.getElementById("referralCode").textContent =
        fallbackReferral;

      return;
    }


    if (data) {

      // Balance
      const balance =
        Number(data.balance || 0).toFixed(2);

      document.getElementById("userBalance").textContent =
        balance;


      // Referral
      if (data.referral_code) {

        document.getElementById("referralCode").textContent =
          data.referral_code;

      } else {

        const fallbackReferral =
          "BD" + user.id.substring(0, 8).toUpperCase();

        document.getElementById("referralCode").textContent =
          fallbackReferral;
      }

    } else {

      document.getElementById("userBalance").textContent =
        "0.00";

      const fallbackReferral =
        "BD" + user.id.substring(0, 8).toUpperCase();

      document.getElementById("referralCode").textContent =
        fallbackReferral;
    }

  } catch (err) {

    console.error(
      "Profile error:",
      err
    );

  }
}


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks() {

  const taskArea =
    document.getElementById("taskList");


  // If taskList does not exist,
  // create it inside dashboard Tasks card
  if (!taskArea) {

    createTaskArea();

  }


  const container =
    document.getElementById("taskList");


  container.innerHTML =
    "<p>Tasks লোড হচ্ছে...</p>";


  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("tasks")
      .select(
        "id, title, description, reward, task_url, is_active"
      )
      .eq("is_active", true)
      .order("created_at", {
        ascending: false
      });


    if (error) {

      console.error(
        "Task load error:",
        error.message
      );

      container.innerHTML =
        "<p>Task লোড করা যাচ্ছে না।</p>";

      return;
    }


    if (!data || data.length === 0) {

      container.innerHTML =
        "<p>এই মুহূর্তে কোনো Task নেই।</p>";

      return;
    }


    container.innerHTML = "";


    for (const task of data) {

      const card =
        document.createElement("div");

      card.style.background = "#f9fafb";
      card.style.padding = "18px";
      card.style.borderRadius = "10px";
      card.style.marginTop = "15px";
      card.style.border = "1px solid #e5e7eb";


      const title =
        document.createElement("h3");

      title.textContent =
        "📋 " + task.title;


      const description =
        document.createElement("p");

      description.textContent =
        task.description;


      description.style.marginTop = "8px";
      description.style.color = "#6b7280";


      const reward =
        document.createElement("p");

      reward.innerHTML =
        "<strong>💰 Reward: ৳" +
        Number(task.reward || 0).toFixed(2) +
        "</strong>";

      reward.style.marginTop = "10px";


      // Start button
      const startButton =
        document.createElement("button");

      startButton.textContent =
        "Task শুরু করুন";

      startButton.style.marginTop = "12px";
      startButton.style.padding = "10px 16px";
      startButton.style.border = "none";
      startButton.style.borderRadius = "7px";
      startButton.style.background = "#111827";
      startButton.style.color = "white";
      startButton.style.cursor = "pointer";


      startButton.onclick = function () {

        startTask(task);

      };


      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(reward);
      card.appendChild(startButton);


      container.appendChild(card);

    }

  } catch (err) {

    console.error(
      "Tasks error:",
      err
    );

    container.innerHTML =
      "<p>Task লোড করার সময় সমস্যা হয়েছে।</p>";
  }
}


// ==========================================
// CREATE TASK AREA
// ==========================================

function createTaskArea() {

  const dashboard =
    document.getElementById("dashboard");


  const cards =
    dashboard.querySelectorAll(
      ".dashboard-card"
    );


  let taskCard = null;


  cards.forEach(function(card) {

    const heading =
      card.querySelector("h3");

    if (
      heading &&
      heading.textContent.includes("Tasks")
    ) {

      taskCard = card;

    }

  });


  if (!taskCard) {
    return;
  }


  taskCard.innerHTML = "";


  const heading =
    document.createElement("h3");

  heading.textContent =
    "📋 Tasks";


  const list =
    document.createElement("div");

  list.id =
    "taskList";


  taskCard.appendChild(heading);
  taskCard.appendChild(list);
}


// ==========================================
// START TASK
// ==========================================

async function startTask(task) {

  if (!task) {
    return;
  }


  // Open task URL
  if (task.task_url) {

    window.open(
      task.task_url,
      "_blank"
    );

  }


  // Ask user for proof
  const proof =
    prompt(
      "Task সম্পন্ন করার পর এখানে Proof লিখুন বা আপনার কাজের সংক্ষিপ্ত বিবরণ দিন:"
    );


  if (proof === null) {
    return;
  }


  if (!proof.trim()) {

    alert(
      "Proof না দিলে Task Submit করা যাবে না।"
    );

    return;
  }


  try {

    const {
      data: {
        user
      }
    } = await supabaseClient.auth.getUser();


    if (!user) {

      alert(
        "আপনাকে আগে Login করতে হবে।"
      );

      return;
    }


    // Submit task
    const {
      error
    } = await supabaseClient
      .from("task_submissions")
      .insert({

        task_id: task.id,

        user_id: user.id,

        proof: proof.trim(),

        status: "pending",

        reward_credited: false

      });


    if (error) {

      if (
        error.code === "23505"
      ) {

        alert(
          "আপনি এই Task ইতিমধ্যে Submit করেছেন।"
        );

      } else {

        console.error(error);

        alert(
          "Task Submit করা যায়নি:\n" +
          error.message
        );
      }

      return;
    }


    alert(
      "Task সফলভাবে Submit হয়েছে!\n\n" +
      "Status: Pending\n" +
      "Admin যাচাই করার পর Reward দেওয়া হবে।"
    );

    loadTasks();

  } catch (err) {

    console.error(err);

    alert(
      "Task Submit করার সময় সমস্যা হয়েছে:\n" +
      err.message
    );
  }
}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard(user) {

  // Hide homepage
  document.getElementById("home").style.display =
    "none";

  document.getElementById("features").style.display =
    "none";


  // Hide auth boxes
  document.getElementById("signupBox").style.display =
    "none";

  document.getElementById("loginBox").style.display =
    "none";


  // Show dashboard
  document.getElementById("dashboard").style.display =
    "block";


  // Hide navigation
  document.getElementById("navButtons").style.display =
    "none";


  // Email
  document.getElementById("userEmail").textContent =
    user.email || "Email unavailable";


  // Temporary default
  document.getElementById("userBalance").textContent =
    "0.00";


  // Load real profile
  loadUserProfile(user);


  // Load Tasks
  loadTasks();


  // Scroll
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


    // Homepage
    document.getElementById("home").style.display =
      "block";

    document.getElementById("features").style.display =
      "block";


    // Hide dashboard
    document.getElementById("dashboard").style.display =
      "none";


    // Show navigation
    document.getElementById("navButtons").style.display =
      "block";


    // Clear forms
    document.getElementById("loginEmail").value = "";

    document.getElementById("loginPassword").value = "";

    document.getElementById("signupName").value = "";

    document.getElementById("signupEmail").value = "";

    document.getElementById("signupPassword").value = "";


    alert("Logout সফল হয়েছে。");


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


    if (
      data.session &&
      data.session.user
    ) {

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
  function(event, session) {

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

 
