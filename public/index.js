// Форматирование даты
const formatDateTime = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

// Запрос данных с сервера и отрисовка в таблице
function getDataAndRenderTable() {
  console.log("Запрашиваем данные с сервера...");

  fetch("/data")
    .then((response) => response.json())
    .then((data) => {
      console.log("Получены данные:", data);
      renderTable(data);
    })
    .catch((error) => console.error("Ошибка:", error));
}

// Вычисление разницы во времени в минутах
function getTimeDifferenceInMinutes(createDate, executeDate) {
  const createTime = new Date(createDate).getTime();
  const executeTime = new Date(executeDate).getTime();

  const diffInMs = executeTime - createTime;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  return diffInMinutes;
}

// Отрисовка таблицы
function renderTable(data) {
  const tbody = document.getElementById("data-table-body");
  tbody.innerHTML = ""; 

  data.forEach((item) => {
    const timeDiff = getTimeDifferenceInMinutes(item.create_dt, item.execute_dt);

    if (isNaN(timeDiff) || timeDiff < 30) return;

    const row = document.createElement("tr");

    // Окрашивание строк
    if (timeDiff >= 30 && timeDiff <= 120) {
      row.style.backgroundColor = "yellow"; // Жёлтый цвет для 30-120 минут
    } else if (timeDiff > 120) {
      row.style.backgroundColor = "red"; // Красный цвет для более 120 минут
    }

    row.innerHTML = `
      <td>${item.pat_fio}</td>
			<td>${item.cardnum}</td>
      <td>${item.naz_name}</td>
      <td>${formatDateTime(item.create_dt)}</td>
      <td>${item.created_by}</td>
      <td>${formatDateTime(item.execute_dt)}</td>
      <td>${item.executed_by}</td>
			<td>${item.naz_create_in}</td>
      <td>${timeDiff} минут</td>
    `;

    tbody.appendChild(row);
  });
}

// Фильтрация по дате
document.getElementById("filter-button").addEventListener("click", () => {
  const startDateInput = document.getElementById("start-date").value;
  const endDateInput = document.getElementById("end-date").value;

  if (!startDateInput || !endDateInput) {
    alert("Пожалуйста, заполните обе даты!");
    return;
  }

	const startDate = new Date(startDateInput)
	const endDate = new Date(endDateInput)
	const today = new Date();

	if (startDate > endDate) {
		alert('Начальная дата не может быть больше конечной')
		return
	}

	if (startDate > today) {
		alert('Начальная дата не может быть больше текущей')
	}

	

  fetch(`/data?startDate=${startDate}&endDate=${endDate}`)
    .then((response) => response.json())
    .then((filteredData) => {
      renderTable(filteredData);
    })
    .catch((error) => console.error("Ошибка:", error));
});

