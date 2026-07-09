const memoInput = document.getElementById("memoInput");
const addButton = document.getElementById("addButton");
const memoList = document.getElementById("memoList");

function addMemo() {
  const inputValue = memoInput.value;

  if (inputValue === "") {
    alert("メモを入力してください");
    return;
  }

  const listItem = document.createElement("li");

  const memoText = document.createElement("span");
  memoText.textContent = inputValue;

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "削除";
  deleteButton.classList.add("delete-button");

  memoText.addEventListener("click", function() {
    listItem.classList.toggle("done");
  });

  deleteButton.addEventListener("click", function() {
    memoList.removeChild(listItem);
  });

  listItem.appendChild(memoText);
  listItem.appendChild(deleteButton);

  memoList.appendChild(listItem);

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