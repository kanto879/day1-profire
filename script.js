const memoInput = document.getElementById("memoInput");
const addButton = document.getElementById("addButton");
const clearButton = document.getElementById("clearButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const memoList = document.getElementById("memoList");

const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const activeCount = document.getElementById("activeCount");

let memos = JSON.parse(localStorage.getItem("memos")) || [];
let editIndex = null;

function saveMemos() {
  localStorage.setItem("memos", JSON.stringify(memos));
}

function formatDate(dateText) {
  const date = new Date(dateText);

  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
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

function resetEditMode() {
  editIndex = null;
  addButton.textContent = "追加する";
  memoInput.value = "";
  memoInput.focus();
}

function renderMemos() {
  memoList.innerHTML = "";

  memos.forEach(function(memo, index) {
    const listItem = document.createElement("li");

    if (memo.done) {
      listItem.classList.add("done");
    }

    const memoContent = document.createElement("div");
    memoContent.classList.add("memo-content");

    const memoText = document.createElement("span");
    memoText.textContent = memo.text;

    const memoDate = document.createElement("small");
    memoDate.classList.add("memo-date");
    memoDate.textContent = "作成日：" + formatDate(memo.createdAt);

    memoContent.appendChild(memoText);
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
      memos[index].done = !memos[index].done;
      saveMemos();
      renderMemos();
    });

    editButton.addEventListener("click", function() {
      editIndex = index;
      memoInput.value = memo.text;
      addButton.textContent = "保存する";
      memoInput.focus();
    });

    deleteButton.addEventListener("click", function() {
      memos.splice(index, 1);
      saveMemos();

      if (editIndex === index) {
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
}

function addMemo() {
  const inputValue = memoInput.value;

  if (inputValue.trim() === "") {
    alert("メモを入力してください");
    return;
  }

  if (editIndex === null) {
    const newMemo = {
      text: inputValue,
      done: false,
      createdAt: new Date().toISOString()
    };

    memos.push(newMemo);
  } else {
    memos[editIndex].text = inputValue;
  }

  saveMemos();
  renderMemos();
  resetEditMode();
}

addButton.addEventListener("click", function() {
  addMemo();
});

cancelEditButton.addEventListener("click", function() {
  resetEditMode();
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

memoInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addMemo();
  }
});

renderMemos();