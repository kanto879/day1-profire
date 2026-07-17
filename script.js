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

    const memoText = document.createElement("span");
    memoText.textContent = memo.text;

    const buttonArea = document.createElement("div");
    buttonArea.classList.add("button-area");

    const editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.classList.add("edit-button");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.classList.add("delete-button");

    memoText.addEventListener("click", function() {
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

    listItem.appendChild(memoText);
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
      done: false
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