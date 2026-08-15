const addButton = document.querySelector("#addButton");
const itemInput = document.querySelector("#itemInput");
const itemList = document.querySelector("#itemList");
const searchInput = document.querySelector("#searchInput");
const items = [];

function saveItems(key, value) {
	localStorage.setItem(key, value);
}
function loadItems(key, value) {
	localStorage.getItem(key, value);
}

const savedData = loadItems("items");
if (savedData) {
	items.push(...JSON.parse(savedData));
}

const savedSearch = loadItems("items");
if (savedSearch) {
	searchInput.value = savedSearch;
	renderItems();
}

function createItem(item) {
	const li = document.createElement("li");
	const span = document.createElement("span");
	const button = document.createElement("button");
	const checkbox = document.createElement("input");

	checkbox.type = "checkbox";
	checkbox.checked = item.completed;

	span.textContent = item.text;
	button.textContent = "Удалить";

	li.dataset.id = item.id;
	li.append(checkbox);
	li.append(span);
	li.append(button);

	itemList.append(li);
}

items.forEach(function (item) {
	createItem(item);
});

function renderItems() {
	const inputText = searchInput.value;
	const filteredItems = items.filter((item) =>
		item.text.toLowerCase().includes(inputText.toLowerCase()),
	);
	itemList.innerHTML = "";
	filteredItems.forEach(function (item) {
		createItem(item);
	});
}
searchInput.addEventListener("input", function (event) {
	renderItems();
	saveItems("search", searchInput.value);
});

itemList.addEventListener("click", function (event) {
	const li = event.target.parentElement;
	const id = Number(li.dataset.id);

	if (event.target.tagName === "INPUT" && event.target.type === "checkbox") {
		const item = items.find((item) => item.id === id);
		item.completed = event.target.checked;
		saveItems("items", JSON.stringify(items));
	}

	if (event.target.tagName === "BUTTON") {
		const index = items.findIndex((item) => item.id === id);
		items.splice(index, 1);
		saveItems("items", JSON.stringify(items));
		li.remove();
	}
});

itemList.addEventListener("dblclick", function (event) {
	if (event.target.tagName !== "SPAN") {
		return;
	}
	let editing = true;
	const span = event.target;
	const li = span.parentElement;
	const id = Number(li.dataset.id);

	const item = items.find((item) => item.id === id);

	const input = document.createElement("input");
	input.value = item.text;
	span.replaceWith(input);
	input.focus();

	function finishEditing() {
		if (!editing) {
			return;
		}
		if (input.value.trim() === "") {
			return;
		}
		editing = false;
		item.text = input.value;
		saveItems("items", JSON.stringify(items));

		input.replaceWith(span);
		span.textContent = item.text;
	}

	input.addEventListener("keydown", function (event) {
		if (event.key === "Enter") {
			finishEditing();
		} else if (event.key === "Escape") {
			editing = false;
			input.replaceWith(span);
		}
	});

	input.addEventListener("blur", function () {
		finishEditing();
	});
});

addButton.addEventListener("click", function () {
	const text = itemInput.value;

	if (text.trim() === "") {
		return;
	}
	const item = {
		id: Date.now(),
		text: text,
		completed: false,
	};
	items.push(item);
	saveItems("items", JSON.stringify(items));
	createItem(item);
	itemInput.value = "";
});