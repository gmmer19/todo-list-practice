// Достаём DOM элементы страницы
const addButton = document.querySelector("#addButton");
const itemInput = document.querySelector("#itemInput");
const itemList = document.querySelector("#itemList");
const searchInput = document.querySelector("#searchInput");
const items = [];

// Создаем функции для сохранения и загрузки хранилища
function saveItems(key, value) {
	localStorage.setItem(key, value);
}
function loadItems(key) {
	const data = localStorage.getItem(key);
	return data;
}

// Иницализируем данные: (Загружаем данные по ключу "items", если есть то разворачиваем массив в виде объекта)
// Восстанавливаем фильтры из хранилища по ключу "search", если есть то отдаем в поле ввода
// Отрисовываем список учитывая фильтры
function init() {
	const savedData = loadItems("items");

	if (savedData) {
		items.push(...JSON.parse(savedData));
	}

	const savedSearch = loadItems("search");

	if (savedSearch) {
		searchInput.value = savedSearch;
	}

	renderItems();
}
// Здесь же запускаем инициализацию, при загрузке страницы
init();

// Функция для создания первоначального списка, кнопок "Добавить", "Удалить", текста из поля ввода, чекбоксов, итд
function createItem(item) {
	const li = document.createElement("li");
	const span = document.createElement("span");
	const button = document.createElement("button");
	const checkbox = document.createElement("input");

	checkbox.type = "checkbox";
	checkbox.checked = item.completed;
	checkbox.id = `item-${item.id}`;

	const label = document.createElement("label");
	label.htmlFor = checkbox.id;
	button.textContent = "Удалить";
	button.setAttribute("aria-label", `Удалить элемент: ${item.text}`);

	span.textContent = item.text;
	span.tabIndex = 0;
	span.addEventListener("keydown", function (event) {
		if (event.key === "Enter") startEditing(event.target);
	});

	li.dataset.id = item.id;
	li.append(checkbox);
	li.append(span);
	li.append(button);

	itemList.append(li);
}

// Функция для отрисовки списка createItems, но учитывая филтьтры
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

//Вешаем слушатель на поле ввода, при каждом вводе пользователя запускается отрисовка списка с фильтром
searchInput.addEventListener("input", function () {
	renderItems();
	saveItems("search", searchInput.value);
});

// При нажатии на чекбокс, мы определяем id для li, в котором находится название задачи
// Например задача "Купить молоко" находится в li, соответсвенно этому блоку будет выдан уникальный id
itemList.addEventListener("click", function (event) {
	const li = event.target.closest("li");
	const id = Number(li.dataset.id);

	if (event.target.tagName === "INPUT" && event.target.type === "checkbox") {
		const item = items.find((item) => item.id === id);
		item.completed = event.target.checked;
		saveItems("items", JSON.stringify(items));
	}

	// В этом же ul, у нас лежит кнопка для удаления задач, поэтому здесь же мы делаем логику удаления
	if (event.target.tagName === "BUTTON") {
		const index = items.findIndex((item) => item.id === id);
		items.splice(index, 1);
		saveItems("items", JSON.stringify(items));
		li.remove();
	}
});

// Функция для редактирования текста созданной задачи, сначала мы определяем состояние, редактируем или нет
function startEditing(span) {
	let editing = true;
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
			editing = false;
			input.replaceWith(span);
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
}

// Слушатель на двойное нажатие, что позволяет редактировать текст задачи из списка
itemList.addEventListener("dblclick", function (event) {
	if (event.target.tagName !== "SPAN") {
		return;
	}
	startEditing(event.target);
});

// Слушатель для кнопки "Добавить", чтобы добавлять задачу из инпута пользователя
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
	renderItems();
	itemInput.value = "";
});
