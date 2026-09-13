
// ==========================================
// START TASK
// ==========================================

async function startTask(task) {

  if (!task) {
    return;
  }

  // Open task URL
  if (task.task_url) {
    window.open(task.task_url, "_blank");
  }

  // Get logged-in user
  try {

    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error(userError);
      alert("User তথ্য পাওয়া যায়নি।");
      return;
    }

    if (!user) {
      alert("আপনাকে আগে Login করতে হবে।");
      return;
    }

    // Remove old proof box if exists
    const oldBox =
      document.getElementById("taskProofBox");

    if (oldBox) {
      oldBox.remove();
    }

    // Create proof box
    const box =
      document.createElement("div");

    box.id = "taskProofBox";

    box.style.cssText = `
      position: fixed;
      left: 20px;
      right: 20px;
      bottom: 20px;
      z-index: 99999;
      background: white;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 5px 30px rgba(0,0,0,0.25);
      border: 2px solid #ddd;
    `;

    box.innerHTML = `
      <h3 style="margin-top:0;">
        📋 Task সম্পন্ন করুন
      </h3>

      <p>
        ভিডিওটি সম্পূর্ণ দেখার পর নিচে Proof লিখুন।
      </p>

      <textarea
        id="taskProofInput"
        placeholder="এখানে Proof লিখুন..."
        style="
          width:100%;
          min-height:100px;
          padding:12px;
          box-sizing:border-box;
          border:1px solid #ccc;
          border-radius:10px;
          font-size:16px;
          resize:vertical;
        "
      ></textarea>

      <button
        id="taskSubmitBtn"
        style="
          margin-top:12px;
          width:100%;
          padding:14px;
          border:0;
          border-radius:10px;
          background:#111827;
          color:white;
          font-size:17px;
          cursor:pointer;
        "
      >
        Submit Task
      </button>

      <button
        id="taskCancelBtn"
        style="
          margin-top:8px;
          width:100%;
          padding:12px;
          border:1px solid #ccc;
          border-radius:10px;
          background:white;
          font-size:16px;
        "
      >
        বন্ধ করুন
      </button>
    `;

    document.body.appendChild(box);

    // Cancel
    document
      .getElementById("taskCancelBtn")
      .onclick = function () {
        box.remove();
      };

    // Submit
    document
      .getElementById("taskSubmitBtn")
      .onclick = async function () {

        const proofInput =
          document.getElementById("taskProofInput");

        const proof =
          proofInput.value.trim();

        if (!proof) {
          alert(
            "Proof না দিলে Task Submit করা যাবে না।"
          );
          return;
        }

        const submitBtn =
          document.getElementById("taskSubmitBtn");

        submitBtn.disabled = true;
        submitBtn.textContent =
          "Submitting...";

        try {

          const { error } =
            await supabaseClient
              .from("task_submissions")
              .insert({
                task_id: task.id,
                user_id: user.id,
                proof: proof,
                status: "pending",
                reward_credited: false
              });

          if (error) {

            console.error(error);

            if (error.code === "23505") {

              alert(
                "আপনি এই Task ইতিমধ্যে Submit করেছেন।"
              );

            } else {

              alert(
                "Task Submit করা যায়নি:\n" +
                error.message
              );
            }

            submitBtn.disabled = false;
            submitBtn.textContent =
              "Submit Task";

            return;
          }

          alert(
            "✅ Task সফলভাবে Submit হয়েছে!\n\n" +
            "আপনার Proof যাচাই করা হবে।"
          );

          box.remove();

          loadTasks();

        } catch (err) {

          console.error(err);

          alert(
            "Task Submit করার সময় সমস্যা হয়েছে:\n" +
            err.message
          );

          submitBtn.disabled = false;
          submitBtn.textContent =
            "Submit Task";
        }
      };

  } catch (err) {

    console.error(err);

    alert(
      "Task শুরু করার সময় সমস্যা হয়েছে:\n" +
      err.message
    );
  }
}
