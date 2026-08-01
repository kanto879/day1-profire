const memoInput = document.getElementById("memoInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const addButton = document.getElementById("addButton");
const exportButton = document.getElementById("exportButton");
const importInput = document.getElementById("importInput");
const clearCompletedButton = document.getElementById("clearCompletedButton");
const clearButton = document.getElementById("clearButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const searchInput = document.getElementById("searchInput");
const memoList = document.getElementById("memoList");
const emptyMessage = document.getElementById("emptyMessage");

const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const activeCount = document.getElementById("activeCount");

const showAllButton = document.getElementById("showAllButton");
const showActiveButton = document.getElementById("showActiveButton");
const showDoneButton = document.getElementById("showDoneButton");

const sortPriorityButton = document.getElementById("sortPriorityButton");
const sortDueDateButton = document.getElementById("sortDueDateButton");
const sortDateButton = document.getElementById("sortDateButton");

const showAllDueButton = document.getElementById("showAllDueButton");
const showOverdueButton = document.getElementById("showOverdueButton");
const showWithDueButton = document.getElementById("showWithDueButton");
const showNoDueButton = document.getElementById("showNoDueButton");
const showAllPriorityButton = document.getElementById("showAllPriorityButton");
const showHighPriorityButton = document.getElementById("showHighPriorityButton");
const showMediumPriorityButton = document.getElementById("showMediumPriorityButton");
const showLowPriorityButton = document.getElementById("showLowPriorityButton");

let memos = JSON.parse(localStorage.getItem("memos")) || [];
let editIndex = null;
let currentFilter = "all";
let currentDueFilter = "all";
let currentPriorityFilter = "all";
let currentSort = "date";

function saveMemos() {
  localStorage.setItem("memos", JSON.stringify(memos));
}

function formatDate(dateText) {
  if (!dateText) {
    return "日時なし";
  }

  const date = new Date(dateText);

  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDueDate(dateText) {
  if (!dateText) {
    return "期限なし";
  }

  return dateText.replaceAll("-", "/");
}

function isOverdue(dueDate) {
  if (!dueDate) {
    return false;
  }

  const today = new Date();
  const due = new Date(dueDate + "T00:00:00");

  today.setHours(0, 0, 0, 0);

  return due < today;
}

function getDaysUntilDue(dueDate) {
  if (!dueDate) {
    return null;
  }

  const today = new Date();
  const due = new Date(dueDate + "T00:00:00");

  today.setHours(0, 0, 0, 0);

  const difference = due - today;
  const days = difference / (1000 * 60 * 60 * 24);

  return days;
}

function getDueStatusText(dueDate, done) {
  if (!dueDate) {
    return "";
  }

  if (done) {
    return "";
  }

  const days = getDaysUntilDue(dueDate);

  if (days < 0) {
    return "期限切れ";
  }

  if (days === 0) {
    return "今日が期限";
  }

  if (days === 1) {
    return "明日が期限";
  }

  if (days <= 3) {
    return "期限が近い";
  }

  return "";
}

function getDueStatusClass(dueDate, done) {
  if (!dueDate) {
    return "";
  }

  if (done) {
    return "";
  }

  const days = getDaysUntilDue(dueDate);

  if (days < 0) {
    return "overdue";
  }

  if (days === 0) {
    return "due-today";
  }

  if (days <= 3) {
    return "due-soon";
  }

  return "";
}

function getPriorityText(priority) {
  if (priority === "high") {
    return "高";
  }

  if (priority === "low") {
    return "低";
  }

  return "中";
}

function getPriorityScore(priority) {
  if (priority === "high") {
    return 3;
  }

  if (priority === "medium") {
    return 2;
  }

  return 1;
}

function updateCounts() {
  const total = memos.length;

  const done = memos.filter(function(memo) {
    return memo.done;
  }).length;

  const active = total - done;

  totalCount.textContent = total;
  doneCount.textContent = done;
  activeCount.textContent = active;
}

function updateFilterButtons() {
  showAllButton.classList.remove("active-filter");
  showActiveButton.classList.remove("active-filter");
  showDoneButton.classList.remove("active-filter");

  if (currentFilter === "all") {
    showAllButton.classList.add("active-filter");
  }

  if (currentFilter === "active") {
    showActiveButton.classList.add("active-filter");
  }

  if (currentFilter === "done") {
    showDoneButton.classList.add("active-filter");
  }
}

function updateDueFilterButtons() {
  showAllDueButton.classList.remove("active-due-filter");
  showOverdueButton.classList.remove("active-due-filter");
  showWithDueButton.classList.remove("active-due-filter");
  showNoDueButton.classList.remove("active-due-filter");

  if (currentDueFilter === "all") {
    showAllDueButton.classList.add("active-due-filter");
  }

  if (currentDueFilter === "overdue") {
    showOverdueButton.classList.add("active-due-filter");
  }

  if (currentDueFilter === "withDue") {
    showWithDueButton.classList.add("active-due-filter");
  }

  if (currentDueFilter === "noDue") {
    showNoDueButton.classList.add("active-due-filter");
  }
}

function updatePriorityFilterButtons() {
  showAllPriorityButton.classList.remove("active-priority-filter");
  showHighPriorityButton.classList.remove("active-priority-filter");
  showMediumPriorityButton.classList.remove("active-priority-filter");
  showLowPriorityButton.classList.remove("active-priority-filter");

  if (currentPriorityFilter === "all") {
    showAllPriorityButton.classList.add("active-priority-filter");
  }

  if (currentPriorityFilter === "high") {
    showHighPriorityButton.classList.add("active-priority-filter");
  }

  if (currentPriorityFilter === "medium") {
    showMediumPriorityButton.classList.add("active-priority-filter");
  }

  if (currentPriorityFilter === "low") {
    showLowPriorityButton.classList.add("active-priority-filter");
  }
}

function resetEditMode() {
  editIndex = null;
  addButton.textContent = "追加する";
  memoInput.value = "";
  prioritySelect.value = "medium";
  dueDateInput.value = "";
  memoInput.focus();
}

function getFilteredMemos() {
  const keyword = searchInput.value.trim().toLowerCase();

  let filteredMemos = memos.slice();

  if (currentFilter === "active") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return !memo.done;
    });
  }

  if (currentFilter === "done") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return memo.done;
    });
  }

  if (currentDueFilter === "overdue") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return isOverdue(memo.dueDate) && !memo.done;
    });
  }

  if (currentDueFilter === "withDue") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return memo.dueDate;
    });
  }

  if (currentDueFilter === "noDue") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return !memo.dueDate;
    });
  }

  if (currentPriorityFilter === "high") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return memo.priority === "high";
    });
  }

  if (currentPriorityFilter === "medium") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return (memo.priority || "medium") === "medium";
    });
  }

  if (currentPriorityFilter === "low") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return memo.priority === "low";
    });
  }

  if (keyword !== "") {
    filteredMemos = filteredMemos.filter(function(memo) {
      return memo.text.toLowerCase().includes(keyword);
    });
  }

  if (currentSort === "priority") {
  filteredMemos.sort(function(a, b) {
    return getPriorityScore(b.priority) - getPriorityScore(a.priority);
  });
}

if (currentSort === "dueDate") {
  filteredMemos.sort(function(a, b) {
    if (!a.dueDate && !b.dueDate) {
      return 0;
    }

    if (!a.dueDate) {
      return 1;
    }

    if (!b.dueDate) {
      return -1;
    }

    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

if (currentSort === "date") {
  filteredMemos.sort(function(a, b) {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

  return filteredMemos;
}

function renderMemos() {
  memoList.innerHTML = "";

  const filteredMemos = getFilteredMemos();

  if (filteredMemos.length === 0) {
    emptyMessage.style.display = "block";

    if (memos.length === 0) {
      emptyMessage.textContent = "まだメモがありません。最初のメモを追加してみましょう。";
    } else {
      emptyMessage.textContent = "条件に合うメモがありません。検索やフィルターを変更してみましょう。";
    }
  } else {
    emptyMessage.style.display = "none";
  }

  filteredMemos.forEach(function(memo) {
    const originalIndex = memos.indexOf(memo);

    const listItem = document.createElement("li");

    if (memo.done) {
      listItem.classList.add("done");
    }

    const dueStatusClass = getDueStatusClass(memo.dueDate, memo.done);

    if (dueStatusClass !== "") {
      listItem.classList.add(dueStatusClass);
    }

    listItem.classList.add("priority-" + (memo.priority || "medium"));

    const memoContent = document.createElement("div");
    memoContent.classList.add("memo-content");

    const memoText = document.createElement("span");
    memoText.textContent = memo.text;

    const memoPriority = document.createElement("small");
    memoPriority.classList.add("memo-priority");
    memoPriority.textContent = "優先度：" + getPriorityText(memo.priority);

    const memoDueDate = document.createElement("small");
    memoDueDate.classList.add("memo-due-date");
    memoDueDate.textContent = "期限日：" + formatDueDate(memo.dueDate);

    const dueStatusLabel = document.createElement("small");
    dueStatusLabel.classList.add("due-status-label");

    const dueStatusText = getDueStatusText(memo.dueDate, memo.done);
    dueStatusLabel.textContent = dueStatusText;

    const memoDate = document.createElement("small");
    memoDate.classList.add("memo-date");
    memoDate.textContent = "作成日：" + formatDate(memo.createdAt);

    memoContent.appendChild(memoText);
    memoContent.appendChild(memoPriority);
    memoContent.appendChild(memoDueDate);

    if (dueStatusText !== "") {
      memoContent.appendChild(dueStatusLabel);
    }

    memoContent.appendChild(memoDate);

    const buttonArea = document.createElement("div");
    buttonArea.classList.add("button-area");

    const editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.classList.add("edit-button");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.classList.add("delete-button");

    memoContent.addEventListener("click", function() {
      memos[originalIndex].done = !memos[originalIndex].done;
      saveMemos();
      renderMemos();
    });

    editButton.addEventListener("click", function(event) {
      event.stopPropagation();

      editIndex = originalIndex;
      memoInput.value = memo.text;
      prioritySelect.value = memo.priority || "medium";
      dueDateInput.value = memo.dueDate || "";
      addButton.textContent = "保存する";
      memoInput.focus();
    });

    deleteButton.addEventListener("click", function(event) {
      event.stopPropagation();

      memos.splice(originalIndex, 1);
      saveMemos();

      if (editIndex === originalIndex) {
        resetEditMode();
      }

      renderMemos();
    });

    buttonArea.appendChild(editButton);
    buttonArea.appendChild(deleteButton);

    listItem.appendChild(memoContent);
    listItem.appendChild(buttonArea);

    memoList.appendChild(listItem);
  });

  updateCounts();
  updateFilterButtons();
  updateDueFilterButtons();
  updatePriorityFilterButtons();
}

function addMemo() {
  const inputValue = memoInput.value;
  const selectedPriority = prioritySelect.value;
  const selectedDueDate = dueDateInput.value;

  if (inputValue.trim() === "") {
    alert("メモを入力してください");
    return;
  }

  if (editIndex === null) {
    const newMemo = {
      text: inputValue,
      done: false,
      createdAt: new Date().toISOString(),
      priority: selectedPriority,
      dueDate: selectedDueDate
    };

    memos.push(newMemo);
  } else {
    memos[editIndex].text = inputValue;
    memos[editIndex].priority = selectedPriority;
    memos[editIndex].dueDate = selectedDueDate;
  }

  saveMemos();
  renderMemos();
  resetEditMode();
}

function exportMemos() {
  if (memos.length === 0) {
    alert("エクスポートするメモがありません");
    return;
  }

  const data = JSON.stringify(memos, null, 2);

  const blob = new Blob([data], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "memos-backup.json";

  link.click();

  URL.revokeObjectURL(url);
}

function importMemos(file) {
  const reader = new FileReader();

  reader.addEventListener("load", function() {
    try {
      const importedMemos = JSON.parse(reader.result);

      if (!Array.isArray(importedMemos)) {
        alert("正しいメモデータではありません");
        return;
      }

      const confirmImport = confirm("現在のメモを上書きして、インポートしますか？");

      if (!confirmImport) {
        importInput.value = "";
        return;
      }

      memos = importedMemos;
      saveMemos();
      renderMemos();
      resetEditMode();

      importInput.value = "";

      alert("データをインポートしました");
    } catch (error) {
      alert("JSONファイルの読み込みに失敗しました");
      importInput.value = "";
    }
  });

  reader.readAsText(file);
}

addButton.addEventListener("click", function() {
  addMemo();
});

exportButton.addEventListener("click", function() {
  exportMemos();
});

importInput.addEventListener("change", function() {
  const file = importInput.files[0];

  if (!file) {
    return;
  }

  importMemos(file);
});

cancelEditButton.addEventListener("click", function() {
  resetEditMode();
});

clearCompletedButton.addEventListener("click", function() {
  const completedCount = memos.filter(function(memo) {
    return memo.done;
  }).length;

  if (completedCount === 0) {
    alert("完了済みのメモがありません");
    return;
  }

  const confirmDelete = confirm("完了済みのメモを削除しますか？");

  if (confirmDelete) {
    memos = memos.filter(function(memo) {
      return !memo.done;
    });

    saveMemos();
    renderMemos();
    resetEditMode();
  }
});

clearButton.addEventListener("click", function() {
  const confirmDelete = confirm("すべてのメモを削除しますか？");

  if (confirmDelete) {
    memos = [];
    saveMemos();
    renderMemos();
    resetEditMode();
  }
});

showAllButton.addEventListener("click", function() {
  currentFilter = "all";
  renderMemos();
});

showActiveButton.addEventListener("click", function() {
  currentFilter = "active";
  renderMemos();
});

showDoneButton.addEventListener("click", function() {
  currentFilter = "done";
  renderMemos();
});

showAllDueButton.addEventListener("click", function() {
  currentDueFilter = "all";
  renderMemos();
});

showOverdueButton.addEventListener("click", function() {
  currentDueFilter = "overdue";
  renderMemos();
});

showWithDueButton.addEventListener("click", function() {
  currentDueFilter = "withDue";
  renderMemos();
});

showNoDueButton.addEventListener("click", function() {
  currentDueFilter = "noDue";
  renderMemos();
});

showAllPriorityButton.addEventListener("click", function() {
  currentPriorityFilter = "all";
  renderMemos();
});

showHighPriorityButton.addEventListener("click", function() {
  currentPriorityFilter = "high";
  renderMemos();
});

showMediumPriorityButton.addEventListener("click", function() {
  currentPriorityFilter = "medium";
  renderMemos();
});

showLowPriorityButton.addEventListener("click", function() {
  currentPriorityFilter = "low";
  renderMemos();
});

sortPriorityButton.addEventListener("click", function() {
  currentSort = "priority";
  renderMemos();
});

sortDueDateButton.addEventListener("click", function() {
  currentSort = "dueDate";
  renderMemos();
});

sortDateButton.addEventListener("click", function() {
  currentSort = "date";
  renderMemos();
});

searchInput.addEventListener("input", function() {
  renderMemos();
});

memoInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addMemo();
  }
});

renderMemos();
