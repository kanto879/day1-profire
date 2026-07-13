const memoInput = document.getElementById("memoInput");
const addButton = document.getElementById("addButton");
const clearButton = document.getElementById("clearButton");
const memoList = document.getElementById("memoList");

let memos = JSON.parse(localStorage.getItem("memos")) || [];

function saveMemos() {
  localStorage.setItem("memos", JSON.stringify(memos));
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

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.classList.add("delete-button");

    memoText.addEventListener("click", function() {
      memos[index].done = !memos[index].done;
      saveMemos();
      renderMemos();
    });

    deleteButton.addEventListener("click", function() {
      memos.splice(index, 1);
      saveMemos();
      renderMemos();
    });

    listItem.appendChild(memoText);
    listItem.appendChild(deleteButton);

    memoList.appendChild(listItem);
  });
}

function addMemo() {
  const inputValue = memoInput.value;

  if (inputValue.trim() === "") {
    alert("メモを入力してください");
    return;
  }

  const newMemo = {
    text: inputValue,
    done: false
  };

  memos.push(newMemo);

  saveMemos();
  renderMemos();

  memoInput.value = "";
  memoInput.focus();
}

addButton.addEventListener("click", function() {
  addMemo();
});

memoInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addMemo();
  }
});

clearButton.addEventListener("click", function() {
  const confirmDelete = confirm("すべてのメモを削除しますか？");

  if (confirmDelete) {
    memos = [];
    saveMemos();
    renderMemos();
  }
});

renderMemos();